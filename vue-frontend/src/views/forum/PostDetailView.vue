<template>
  <div class="post-detail-view" v-loading="loading" element-loading-text="正在加载帖子详情...">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft" type="default">返回帖子列表</el-button>
    </div>

    <!-- 帖子详情 -->
    <el-card v-if="post" shadow="hover" class="post-card">
      <template #header>
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <el-tag size="small" effect="plain">{{ post.author }}</el-tag>
            <span class="post-time">发布于 {{ formatDate(post.created_at) }}</span>
            <el-button 
              v-if="isAuthor(post.author)" 
              type="danger" 
              size="small" 
              @click="confirmDeletePost"
              :icon="Delete"
            >
              删除帖子
            </el-button>
          </div>
        </div>
      </template>
      <div class="post-content">
        {{ post.content }}
      </div>
    </el-card>

    <!-- 评论区 -->
    <div class="comments-section" v-if="post">
      <el-card shadow="hover">
        <template #header>
          <div class="comments-header">
            <h3>评论区 ({{ comments.length }})</h3>
          </div>
        </template>

        <!-- 评论列表 -->
        <div class="comments-list" v-if="comments.length > 0">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <el-avatar :size="40" :icon="UserFilled"></el-avatar>
              <div class="comment-info">
                <div class="comment-author">{{ comment.author }}</div>
                <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
            <el-divider></el-divider>
          </div>
        </div>

        <!-- 无评论提示 -->
        <el-empty v-else description="暂无评论" />

        <!-- 添加评论 -->
        <div class="add-comment">
          <h4>发表评论</h4>
          <el-form :model="commentForm" :rules="rules" ref="commentFormRef">
            <el-form-item prop="content">
              <el-input
                v-model="commentForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入评论内容"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitComment" :loading="submitting">发表评论</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="!loading && !post" description="帖子不存在或已被删除" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Delete, UserFilled } from '@element-plus/icons-vue'
import { getPostDetail, addComment, deletePost } from '@/services/forumApi'
import type { Post, Comment } from '@/services/forumApi'

// 路由
const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)

// 数据加载状态
const loading = ref(false)
const submitting = ref(false)

// 帖子数据
const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])

// 评论表单
const commentFormRef = ref<FormInstance>()
const commentForm = reactive({
  content: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 2, max: 1000, message: '评论长度应在2到1000个字符之间', trigger: 'blur' }
  ]
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 检查当前用户是否是帖子作者
const isAuthor = (author: string) => {
  const userJson = localStorage.getItem('user')
  if (userJson) {
    const user = JSON.parse(userJson)
    return user.username === author
  }
  return false
}

// 返回帖子列表
const goBack = () => {
  router.push('/forum/posts')
}

// 加载帖子详情
const loadPostDetail = async () => {
  if (loading.value || !postId) return
  
  loading.value = true
  try {
    const response = await getPostDetail(postId)
    post.value = response.post
    comments.value = response.comments
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    ElMessage.error('加载帖子详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentFormRef.value || !postId) return
  
  await commentFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const response = await addComment(postId, commentForm.content)
        comments.value.push(response.comment)
        commentForm.content = '' // 清空评论内容
        ElMessage.success('评论发表成功')
      } catch (error) {
        console.error('发表评论失败:', error)
        ElMessage.error('发表评论失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 确认删除帖子
const confirmDeletePost = () => {
  if (!post.value) return
  
  ElMessageBox.confirm(
    '确定要删除这个帖子吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deletePost(post.value!.id)
      ElMessage.success('帖子删除成功')
      router.push('/forum/posts') // 返回帖子列表
    } catch (error) {
      console.error('删除帖子失败:', error)
      ElMessage.error('删除帖子失败，请稍后重试')
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.post-detail-view {
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.post-card {
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #909399;
}

.post-time {
  font-size: 14px;
}

.post-content {
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 10px 0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-list {
  margin-bottom: 30px;
}

.comment-item {
  margin-bottom: 15px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.comment-info {
  margin-left: 10px;
}

.comment-author {
  font-weight: bold;
  font-size: 16px;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  padding: 5px 0 5px 50px;
  white-space: pre-wrap;
  word-break: break-word;
}

.add-comment {
  margin-top: 20px;
}
</style>