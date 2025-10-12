<template>
  <div class="balance-sheet-table">
    <el-card>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <el-input
              v-model="reportDateFilter"
              placeholder="输入报告期进行筛选（如：2023、2023-12）"
              clearable
              @input="handleFilterChange"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button @click="clearFilter">清除筛选</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-if="!loading && tableData.length > 0"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        height="500"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="report_date" label="报告期" width="120" sortable />
        <el-table-column prop="monetary_funds" label="货币资金" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.monetary_funds) }}
          </template>
        </el-table-column>
        <el-table-column prop="accounts_receivable" label="应收账款" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.accounts_receivable) }}
          </template>
        </el-table-column>
        <el-table-column prop="inventory" label="存货" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.inventory) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_assets" label="总资产" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.total_assets) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_assets_growth_rate" label="总资产增长率" min-width="120" sortable>
          <template #default="scope">
            <span :class="getGrowthClass(scope.row.total_assets_growth_rate)">
              {{ scope.row.total_assets_growth_rate ? scope.row.total_assets_growth_rate.toFixed(2) + '%' : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="accounts_payable" label="应付账款" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.accounts_payable) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_liabilities" label="总负债" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.total_liabilities) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_liabilities_growth_rate" label="总负债增长率" min-width="120" sortable>
          <template #default="scope">
            <span :class="getGrowthClass(scope.row.total_liabilities_growth_rate)">
              {{ scope.row.total_liabilities_growth_rate ? scope.row.total_liabilities_growth_rate.toFixed(2) + '%' : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="debt_to_asset_ratio" label="资产负债率" min-width="120" sortable>
          <template #default="scope">
            {{ scope.row.debt_to_asset_ratio ? scope.row.debt_to_asset_ratio.toFixed(2) + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="total_equity" label="股东权益" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.total_equity) }}
          </template>
        </el-table-column>
        <el-table-column prop="announcement_date" label="公告日期" width="120" />
      </el-table>

      <!-- 分页 -->
      <div v-if="!loading && tableData.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 加载中 -->
      <div v-else-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 无数据 -->
      <div v-else class="empty-container">
        <el-empty description="暂无资产负债表数据">
          <el-button type="primary" @click="fetchData">刷新数据</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 资产负债表组件
 * 
 * 功能：
 * 1. 展示指定股票的资产负债表数据
 * 2. 支持按报告期筛选
 * 3. 支持数据排序和分页
 * 4. 提供数据格式化显示
 * 
 * 参数：
 * @param stockCode - 股票代码
 * 
 * 事件：
 * @emits loading - 加载状态变化
 * @emits error - 错误信息
 */
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getStockBalanceSheets } from '@/services/individualStockApi'
import type { BalanceSheet, FinancialStatementParams } from '@/services/individualStockApi'

// 组件属性
interface Props {
  stockCode: string
}

const props = defineProps<Props>()

// 组件事件
const emit = defineEmits<{
  loading: [value: boolean]
  error: [message: string]
}>()

// 数据状态
const loading = ref(false)
const tableData = ref<BalanceSheet[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选相关
const reportDateFilter = ref('')

// 查询参数
const queryParams = reactive<FinancialStatementParams>({
  page: 1,
  page_size: 20,
  date: ''
})

// 方法：获取数据
const fetchData = async () => {
  if (!props.stockCode) {
    ElMessage.warning('请提供股票代码')
    return
  }

  loading.value = true
  emit('loading', true)
  
  try {
    queryParams.page = currentPage.value
    queryParams.page_size = pageSize.value
    
    const response = await getStockBalanceSheets(props.stockCode, queryParams)
    
    tableData.value = response.data
    console.log('资产负债表数据:', response)
    total.value = response.data.length
    
    if (response.data.length === 0) {
      ElMessage.info('暂无资产负债表数据')
    }
  } catch (error) {
    console.error('获取资产负债表数据失败:', error)
    const errorMessage = '获取资产负债表数据失败，请稍后重试'
    ElMessage.error(errorMessage)
    emit('error', errorMessage)
  } finally {
    loading.value = false
    emit('loading', false)
  }
}

// 方法：日期变化处理
const handleDateChange = (value: string) => {
  queryParams.date = value
  currentPage.value = 1
  fetchData()
}

// 方法：排序变化处理
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  // 这里可以根据需要实现排序逻辑
  console.log('排序变化:', prop, order)
}

// 方法：页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchData()
}

// 方法：当前页变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchData()
}

// 方法：格式化金额
const formatAmount = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-'
  
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿'
  } else if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万'
  } else {
    return amount.toString()
  }
}

// 方法：获取增长率颜色类
const getGrowthClass = (rate: number | null | undefined): string => {
  if (rate === null || rate === undefined) return ''
  if (rate > 0) return 'growth-positive'
  if (rate < 0) return 'growth-negative'
  return ''
}

// 方法：筛选变化处理
const handleFilterChange = () => {
  // 筛选功能暂时保留，可以在后续版本中实现客户端筛选
}

// 方法：清除筛选
const clearFilter = () => {
  reportDateFilter.value = ''
}

// 监听股票代码变化
watch(
  () => props.stockCode,
  (newCode) => {
    if (newCode) {
      currentPage.value = 1
      fetchData()
    }
  }
)

// 组件挂载
onMounted(() => {
  if (props.stockCode) {
    fetchData()
  }
})
</script>

<style scoped>
.balance-sheet-table {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.loading-container {
  padding: 20px;
}

.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.growth-positive {
  color: #67c23a;
  font-weight: 600;
}

.growth-negative {
  color: #f56c6c;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>