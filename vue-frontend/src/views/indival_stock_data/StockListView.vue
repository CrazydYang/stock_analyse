<template>
  <div class="stock-list-view">
    <el-card class="page-header">
      <template #header>
        <div class="header-content">
          <h2>股票列表</h2>
          <div class="header-actions">
            <el-button type="primary" :icon="Refresh" @click="fetchStockList" :loading="loading">
              刷新数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <el-form :inline="true" class="search-form">
          <el-form-item label="股票代码/名称">
            <el-input v-model="searchKeyword" placeholder="请输入股票代码或名称" clearable @clear="handleSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="RefreshLeft" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="filteredStocks"
          border
          stripe
          style="width: 100%"
          @sort-change="handleSortChange"
          fit
        >
          <el-table-column prop="code" label="股票代码" min-width="100" sortable />
          <el-table-column prop="name" label="股票名称" min-width="120" sortable />
          <el-table-column prop="exchange" label="交易所" min-width="80" />
          <el-table-column prop="industry" label="行业" min-width="120" />
          <el-table-column prop="market_cap" label="市值" min-width="100" sortable>
            <template #default="scope">
              {{ formatMarketCap(scope.row.market_cap) }}
            </template>
          </el-table-column>
          <el-table-column prop="pe_ratio" label="市盈率" min-width="80" sortable />
          <el-table-column prop="pb_ratio" label="市净率" min-width="80" sortable />
          <el-table-column prop="dividend_yield" label="股息率" min-width="80" sortable>
            <template #default="scope">
              {{ scope.row.dividend_yield ? scope.row.dividend_yield.toFixed(2) + '%' : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="listing_date" label="上市日期" min-width="100" sortable />
          <el-table-column label="操作" min-width="180" fixed="right">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small"
                @click="viewRealtime(scope.row.code)"
              >
                实时行情
              </el-button>
              <el-button 
                type="info" 
                size="small"
                @click="viewHistory(scope.row.code)"
              >
                历史行情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalStocks"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 股票列表页面
 * 
 * 功能：
 * 1. 展示所有股票的基本信息
 * 2. 支持按股票代码、名称搜索
 * 3. 支持排序和分页
 * 4. 提供跳转到实时行情和历史行情的入口
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getStockList } from '@/services/individualStockApi'
import type { StockInfo } from '@/services/individualStockApi'

// 路由
const router = useRouter()

// 数据加载状态
const loading = ref(false)

// 股票数据
const stocks = ref<StockInfo[]>([])
const searchKeyword = ref('')

// 排序
const sortField = ref('')
const sortOrder = ref('asc')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalStocks = ref(0)

// 计算属性：过滤后的股票列表
const filteredStocks = computed(() => {
  let result = stocks.value

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      stock => 
        stock.code.toLowerCase().includes(keyword) || 
        stock.name.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      const fieldA = a[sortField.value as keyof StockInfo]
      const fieldB = b[sortField.value as keyof StockInfo]

      // 处理不同类型的字段
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortOrder.value === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA)
      } else {
        // 数字类型
        const numA = fieldA === null || fieldA === undefined ? -Infinity : Number(fieldA)
        const numB = fieldB === null || fieldB === undefined ? -Infinity : Number(fieldB)
        return sortOrder.value === 'asc' ? numA - numB : numB - numA
      }
    })
  }

  return result
})


// 方法：获取股票列表
const fetchStockList = async () => {
  loading.value = true
  try {
    const response = await getStockList({
      page: currentPage.value,
      page_size: pageSize.value
    })
    stocks.value = response.data
    
    // 重置分页信息
    totalStocks.value = response.total
    
    ElMessage.success('股票数据加载成功')
  } catch (error) {
    console.error('获取股票列表失败:', error)
    ElMessage.error('获取股票列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 方法：搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 方法：重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 方法：排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sortField.value = prop || ''
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
}

// 方法：页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchStockList()
}

// 方法：当前页变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchStockList()
}

// 方法：查看实时行情
const viewRealtime = (code: string) => {
  router.push(`/stock-realtime/${code}`)
}

// 方法：查看历史行情
const viewHistory = (code: string) => {
  router.push(`/stock-history/${code}`)
}

// 方法：格式化市值
const formatMarketCap = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  
  if (value >= 100000000000) {
    return (value / 100000000000).toFixed(2) + '千亿'
  } else if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿'
  } else if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万'
  } else {
    return value.toString()
  }
}

// 生命周期：组件挂载时获取数据
onMounted(() => {
  fetchStockList()
})
</script>

<style scoped>
.stock-list-view {
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

.header-content h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-section {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
  width: 100%;
  overflow-x: auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stock-list-view {
    padding: 10px;
  }
  
  .search-form {
    display: flex;
    flex-direction: column;
  }
  
  .el-form-item {
    margin-right: 0;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .pagination-container {
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: 10px;
  }
}
</style>