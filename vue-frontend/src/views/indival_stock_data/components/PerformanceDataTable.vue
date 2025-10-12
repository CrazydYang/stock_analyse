<template>
  <div class="performance-data-table">
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
      :data="paginatedPerformanceData"
      v-loading="loading"
      stripe
      border
      height="600"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="report_date" label="报告期" width="120" sortable="custom">
        <template #default="{ row }">
          {{ formatDate(row.report_date) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="earnings_per_share" label="每股收益(元)" width="120" sortable="custom" align="right">
        <template #default="{ row }">
          <span :class="getPriceClass(row.earnings_per_share)">
            {{ formatNumber(row.earnings_per_share, 4) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="operating_revenue" label="营业收入(亿元)" width="140" sortable="custom" align="right">
        <template #default="{ row }">
          {{ formatAmount(row.operating_revenue) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="operating_revenue_growth_rate" label="营收增长率(%)" width="140" sortable="custom" align="right">
        <template #default="{ row }">
          <span :class="getPriceClass(row.operating_revenue_growth_rate)">
            {{ formatPercent(row.operating_revenue_growth_rate) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="net_profit" label="净利润(亿元)" width="140" sortable="custom" align="right">
        <template #default="{ row }">
          <span :class="getPriceClass(row.net_profit)">
            {{ formatAmount(row.net_profit) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="net_profit_growth_rate" label="净利润增长率(%)" width="150" sortable="custom" align="right">
        <template #default="{ row }">
          <span :class="getPriceClass(row.net_profit_growth_rate)">
            {{ formatPercent(row.net_profit_growth_rate) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="net_assets_per_share" label="每股净资产(元)" width="140" sortable="custom" align="right">
        <template #default="{ row }">
          {{ formatNumber(row.net_assets_per_share, 4) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="roe" label="净资产收益率(%)" width="150" sortable="custom" align="right">
        <template #default="{ row }">
          <span :class="getPriceClass(row.roe)">
            {{ formatPercent(row.roe) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="operating_cash_flow_per_share" label="每股经营现金流(元)" width="170" sortable="custom" align="right">
        <template #default="{ row }">
          <span :class="getPriceClass(row.operating_cash_flow_per_share)">
            {{ formatNumber(row.operating_cash_flow_per_share, 4) }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="gross_profit_margin" label="毛利率(%)" width="120" sortable="custom" align="right">
        <template #default="{ row }">
          <span v-if="row.gross_profit_margin !== null" :class="getPriceClass(row.gross_profit_margin)">
            {{ formatPercent(row.gross_profit_margin) }}
          </span>
          <span v-else class="text-gray-400">--</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="announcement_date" label="公告日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.announcement_date) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredPerformanceData.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 空数据状态 -->
    <el-empty 
      v-if="!loading && filteredPerformanceData.length === 0" 
      :description="reportDateFilter ? '未找到匹配的业绩数据' : '暂无业绩数据'" 
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 业绩数据表格组件
 * 
 * 功能：
 * 1. 展示股票业绩快报数据
 * 2. 支持数据排序
 * 3. 支持分页显示
 * 4. 提供数据格式化显示
 * 5. 支持增长率和收益率的颜色区分
 * 6. 支持报告期模糊筛选
 * 
 * @param performanceData - 业绩数据数组
 * @emits refresh - 刷新数据事件
 * @emits sort-change - 排序变化事件
 */
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { PerformanceReport } from '@/services/individualStockApi'

// Props
interface Props {
  performanceData: PerformanceReport[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  refresh: []
  'sort-change': [{ prop: string; order: string | null }]
}>()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选相关
const reportDateFilter = ref('')

// 计算属性：筛选后的数据
const filteredPerformanceData = computed(() => {
  if (!reportDateFilter.value) {
    return props.performanceData
  }
  
  const filterText = reportDateFilter.value.toLowerCase().trim()
  return props.performanceData.filter(item => {
    const reportDate = item.report_date.toLowerCase()
    return reportDate.includes(filterText)
  })
})

// 计算属性：分页后的数据
const paginatedPerformanceData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPerformanceData.value.slice(start, end)
})

// 方法：筛选变化处理
const handleFilterChange = () => {
  currentPage.value = 1 // 筛选时重置到第一页
}

// 方法：清除筛选
const clearFilter = () => {
  reportDateFilter.value = ''
  currentPage.value = 1
}

// 方法：排序变化处理
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  emit('sort-change', { prop, order })
}

// 方法：页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

// 方法：当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 方法：格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '--'
  
  // 处理 YYYY-MM-DD 格式
  if (dateStr.includes('-')) {
    return dateStr
  }
  
  // 处理 YYYYMMDD 格式
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }
  
  return dateStr
}

// 方法：格式化数字
const formatNumber = (value: number | null, decimals: number = 2): string => {
  if (value === null || value === undefined) return '--'
  return value.toFixed(decimals)
}

// 方法：格式化百分比
const formatPercent = (value: number | null): string => {
  if (value === null || value === undefined) return '--'
  return `${value.toFixed(2)}%`
}

// 方法：格式化金额（转换为亿元）
const formatAmount = (value: number | null): string => {
  if (value === null || value === undefined) return '--'
  const amount = value / 100000000 // 转换为亿元
  return amount.toFixed(2)
}

// 方法：获取价格变化的样式类
const getPriceClass = (value: number | null): string => {
  if (value === null || value === undefined || value === 0) return ''
  return value > 0 ? 'text-red-500' : 'text-green-500'
}
</script>

<style scoped>
.performance-data-table {
  width: 100%;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.text-red-500 {
  color: #f56c6c;
}

.text-green-500 {
  color: #67c23a;
}

.text-gray-400 {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-data-table :deep(.el-table) {
    font-size: 12px;
  }
  
  .performance-data-table :deep(.el-table .cell) {
    padding: 8px 4px;
  }
}
</style>