<template>
  <div class="strategy-result-list-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-card>
        <div class="header-content">
          <div class="title-section">
            <h2>策略结果管理</h2>
            <p>查看和管理所有策略选股结果</p>
          </div>
          <div class="action-section">
            <el-button 
              type="primary" 
              :icon="Refresh" 
              @click="refreshData"
              :loading="loading"
            >
              刷新数据
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card>
        <div class="search-form">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入策略名称进行搜索"
            clearable
            style="width: 300px; margin-right: 10px;"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="RefreshLeft" @click="resetSearch">
            重置
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 策略结果列表 -->
    <div class="table-section">
      <el-card>
        <div class="table-header">
          <h3>策略结果列表</h3>
          <div class="table-info">
            <span>共 {{ totalResults }} 条记录</span>
          </div>
        </div>
        
        <el-table
          :data="strategyResults"
          v-loading="loading"
          stripe
          style="width: 100%"
          @row-click="handleRowClick"
          row-style="cursor: pointer;"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="strategy_name" label="策略名称" min-width="200" />
          <el-table-column prop="strategy_description" label="策略描述" min-width="300" show-overflow-tooltip />
          <el-table-column label="选股数量" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="info">{{ row.strategy_result.length }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click.stop="viewDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalResults"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 策略结果详情弹窗 -->
    <StrategyResultDetailDialog
      v-model:visible="detailDialogVisible"
      :strategy-result="selectedStrategyResult"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 策略结果列表页面
 * 
 * 功能：
 * 1. 展示所有策略结果的基本信息
 * 2. 支持按策略名称进行搜索
 * 3. 支持分页显示
 * 4. 点击行或查看详情按钮可查看策略结果详情
 * 
 * 参数：
 * - searchKeyword: 搜索关键词，用于按策略名称搜索
 * - currentPage: 当前页码
 * - pageSize: 每页显示数量
 * 
 * 事件：
 * - handleSearch: 触发搜索
 * - resetSearch: 重置搜索条件并刷新数据
 * - fetchStrategyResults: 从后端获取策略结果列表数据
 * - viewDetail: 查看策略结果详情
 */
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, Refresh } from '@element-plus/icons-vue'
import { getStrategyResultList } from '@/services/strategyResultApi'
import type { StrategyResult } from '@/services/strategyResultApi'
import StrategyResultDetailDialog from './components/StrategyResultDetailDialog.vue'

// 数据加载状态
const loading = ref(false)

// 策略结果数据
const strategyResults = ref<StrategyResult[]>([])
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)

// 详情弹窗
const detailDialogVisible = ref(false)
const selectedStrategyResult = ref<StrategyResult | null>(null)

/**
 * 获取策略结果列表数据
 */
const fetchStrategyResults = async () => {
  try {
    loading.value = true
    
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      strategy_name: searchKeyword.value || undefined
    }
    
    const response = await getStrategyResultList(params)
    
    if (response.code === 200) {
      strategyResults.value = response.data.results
      totalResults.value = response.data.total
    } else {
      ElMessage.error(response.message || '获取策略结果列表失败')
    }
  } catch (error) {
    console.error('获取策略结果列表失败:', error)
    ElMessage.error('获取策略结果列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 刷新数据
 */
const refreshData = () => {
  fetchStrategyResults()
}

/**
 * 搜索
 */
const handleSearch = () => {
  currentPage.value = 1
  fetchStrategyResults()
}

/**
 * 重置搜索
 */
const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  fetchStrategyResults()
}

/**
 * 页大小变化
 */
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchStrategyResults()
}

/**
 * 当前页变化
 */
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchStrategyResults()
}

/**
 * 行点击事件
 */
const handleRowClick = (row: StrategyResult) => {
  viewDetail(row)
}

/**
 * 查看详情
 */
const viewDetail = (row: StrategyResult) => {
  selectedStrategyResult.value = row
  detailDialogVisible.value = true
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '-'
  
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateTimeStr
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchStrategyResults()
})
</script>

<style scoped>
.strategy-result-list-view {
  padding: 20px;
}

.page-header,
.search-section,
.table-section {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.title-section p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.table-info {
  color: #909399;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .strategy-result-list-view {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-form .el-input {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>