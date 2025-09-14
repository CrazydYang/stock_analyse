<template>
  <div class="forum-list-view" v-loading="loading" element-loading-text="正在加载帖子列表...">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-card shadow="hover">
        <div class="header-content">
          <div class="forum-info">
            <h1 class="forum-title">论坛讨论区</h1>
            <p class="forum-subtitle">分享交流投资心得与市场观点</p>
          </div>
          <div class="header-actions">
            <el-button @click="refreshData" :loading="loading" :icon="Refresh" type="primary">刷新</el-button>
            <el-button @click="createNewPost" type="success" :icon="Plus">发布帖子</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 帖子列表 -->
    <div class="post-list-section" v-if="posts.length > 0">
      <el-card shadow="hover">
        <template #header>
          <div class="table-header">
            <h3>帖子列表</h3>
            <div class="table-controls">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索帖子标题"
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
            </div>
          </div>
        </template>
        
        <el-table
          :data="filteredPosts"
          stripe
          border
          style="width: 100%"
          :default-sort="{ prop: 'created_at', order: 'descending' }"
          height="600"
          highlight-current-row
          @row-click="viewPostDetail"
        >
          <!-- 固定列 -->
          <el-table-column type="index" label="#" width="50" fixed="left" align="center" />
          <el-table-column prop="title" label="标题" min-width="300">
            <template #default="scope">
              <el-button type="text" @click.stop="viewPostDetail(scope.row)">
                {{ scope.row.title }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120" align="center">
            <template #default="scope">
              <el-tag size="small" effect="plain">{{ scope.row.author }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="comment_count" label="评论数" width="100" align="center" sortable />
          <el-table-column prop="created_at" label="发布时间" width="180" align="center" sortable>
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button 
                v-if="isAuthor(scope.row.author)" 
                type="danger" 
                size="small" 
                @click.stop="confirmDeletePost(scope.row)"
                :icon="Delete"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 表格底部分页 -->
        <div class="table-footer">
          <el-pagination
            v-if="pageInfo.total_items > 0"
            layout="total, sizes, prev, pager, next"
            :total="pageInfo.total_items"
            :page-sizes="[10, 20, 50, 100]"
            v-model:page-size="pageSize"
            v-model:current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 无数据提示 -->
    <el-empty v-if="!loading && posts.length === 0" description="暂无帖子" />

    <!-- 新建帖子对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="发布新帖子"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="postForm" label-width="80px" :rules="rules" ref="postFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="postForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入帖子内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPost" :loading="submitting">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Refresh, Plus, Delete, Search } from '@element-plus/icons-vue'
import { getPostList, createPost, deletePost } from '@/services/forumApi'
import type { Post, PageInfo } from '@/services/forumApi'

// 路由
const router = useRouter()

// 数据加载状态
const loading = ref(false)
const submitting = ref(false)

// 帖子数据
const posts = ref<Post[]>([])
const pageInfo = ref<PageInfo>({
  current: 1,
  total_pages: 0,
  total_items: 0,
  has_next: false,
  has_previous: false
})

// 搜索关键词
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 新建帖子对话框
const dialogVisible = ref(false)
const postFormRef = ref<FormInstance>()
const postForm = reactive({
  title: '',
  content: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在2到100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 5, max: 10000, message: '内容长度应在5到10000个字符之间', trigger: 'blur' }
  ]
})

// 过滤后的帖子数据
const filteredPosts = computed(() => {
  let result = posts.value
  if (searchKeyword.value) {
    result = result.filter(post => {
      return post.title.includes(searchKeyword.value)
    })
  }
  return result
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
    minute: '2-digit'
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

// 刷新数据
const refreshData = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await getPostList(currentPage.value, pageSize.value)
    console.log(response)
    posts.value = response.posts
    pageInfo.value = response.page
    ElMessage.success('帖子列表加载成功')
  } catch (error) {
    console.error('加载帖子列表失败:', error)
    ElMessage.error('加载帖子列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  refreshData()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  refreshData()
}

// 查看帖子详情
const viewPostDetail = (row: Post) => {
  router.push(`/forum/posts/${row.id}`)
}

// 创建新帖子
const createNewPost = () => {
  postForm.title = ''
  postForm.content = ''
  dialogVisible.value = true
}

// 提交帖子
const submitPost = async () => {
  if (!postFormRef.value) return
  
  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await createPost(postForm.title, postForm.content)
        ElMessage.success('帖子发布成功')
        dialogVisible.value = false
        refreshData() // 刷新帖子列表
      } catch (error) {
        console.error('发布帖子失败:', error)
        ElMessage.error('发布帖子失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 确认删除帖子
const confirmDeletePost = (post: Post) => {
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
      await deletePost(post.id)
      ElMessage.success('帖子删除成功')
      refreshData() // 刷新帖子列表
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
  refreshData()
})
</script>

<style scoped>
.forum-list-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forum-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.forum-subtitle {
  margin: 5px 0 0;
  color: #909399;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-list-section {
  margin-bottom: 20px;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-table__header) {
  font-weight: bold;
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  transition: all 0.3s;
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f0f9ff !important;
}

/* 表格底部分页 */
.table-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>