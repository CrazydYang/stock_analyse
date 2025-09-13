<template>
  <div class="news-list">
    <el-card class="page-header">
      <template #header>
        <div class="card-header">
          <span>CCTV新闻列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词搜索"
              style="width: 200px; margin-right: 10px"
            />
            <el-button type="primary" @click="searchNews">搜索</el-button>
          </div>
        </div>
      </template>
      
      <div class="news-content">
        <!-- 新闻列表 -->
        <el-card shadow="hover" v-loading="newsLoading" element-loading-text="正在加载新闻数据...">
          <template #header>
            <div class="list-header">
              <h3>新闻列表</h3>
              <el-button type="primary" @click="refreshNews" :icon="Refresh" :loading="newsLoading">刷新</el-button>
            </div>
          </template>
          
          <el-table :data="newsList" style="width: 100%" v-if="newsList.length > 0">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题">
              <template #default="scope">
                <router-link :to="`/analysis/news-detail/${scope.row.id}`" class="news-title-link">
                  {{ scope.row.title }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column prop="publish_date" label="发布日期" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="text" 
                  @click="viewNewsDetail(scope.row.id)"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-else description="暂无新闻数据" />
          
          <!-- 分页 -->
          <div class="pagination-container" v-if="total > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getNewsList, type NewsItem } from '@/services/newsApi'

const router = useRouter()
const searchKeyword = ref('')
const newsList = ref<NewsItem[]>([])
const newsLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 获取新闻列表
async function fetchNewsList() {
  newsLoading.value = true
  try {
    const data = await getNewsList(
      pageSize.value,
      (currentPage.value - 1) * pageSize.value,
      searchKeyword.value || undefined
    )
    console.log(data)
    if (data) {
      newsList.value = data.news
      total.value = data.total
    } else {
      ElMessage.error(`获取新闻列表失败: ${data}`)
    }
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    ElMessage.error('获取新闻列表失败，请检查网络连接')
  } finally {
    newsLoading.value = false
  }
}

// 搜索新闻
function searchNews() {
  currentPage.value = 1 // 重置到第一页
  fetchNewsList()
}

// 刷新新闻列表
function refreshNews() {
  fetchNewsList()
}

// 查看新闻详情
function viewNewsDetail(id: number) {
  router.push(`/analysis/news-detail/${id}`)
}

// 处理每页显示数量变化
function handleSizeChange(val: number) {
  pageSize.value = val
  fetchNewsList()
}

// 处理页码变化
function handleCurrentChange(val: number) {
  currentPage.value = val
  fetchNewsList()
}

// 初始化时获取一次数据
onMounted(() => {
  fetchNewsList()
})
</script>

<style scoped>
.news-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.news-content {
  margin-top: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.news-title-link {
  color: #409EFF;
  text-decoration: none;
}

.news-title-link:hover {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>