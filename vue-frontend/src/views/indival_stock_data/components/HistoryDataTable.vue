<template>
  <div class="history-data-table">
    <div v-if="historyData.length > 0" class="table-container">
      <el-table
        :data="paginatedHistoryData"
        border
        stripe
        style="width: 100%; max-width: 100%"
        height="400"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="open_price" label="开盘价" min-width="100" sortable />
        <el-table-column prop="high_price" label="最高价" min-width="100" sortable />
        <el-table-column prop="low_price" label="最低价" min-width="100" sortable />
        <el-table-column prop="close_price" label="收盘价" min-width="100" sortable />
        <el-table-column prop="change_percent" label="涨跌幅" min-width="100" sortable>
          <template #default="scope">
            <span :class="getPriceClass(scope.row.change_percent)">
              {{ scope.row.change_percent > 0 ? '+' : '' }}{{ scope.row.change_percent.toFixed(2) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="成交量" min-width="120" sortable>
          <template #default="scope">
            {{ formatVolume(scope.row.volume) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="成交额" min-width="120" sortable>
          <template #default="scope">
            {{ formatAmount(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="turnover_rate" label="换手率" min-width="100" sortable>
          <template #default="scope">
            {{ scope.row.turnover_rate ? scope.row.turnover_rate.toFixed(2) + '%' : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="historyData.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <div v-else class="empty-container">
      <el-empty description="暂无历史行情数据">
        <el-button type="primary" @click="handleRefresh">查询数据</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 历史行情数据表格组件
 * 
 * 功能：
 * 1. 展示股票历史行情数据表格
 * 2. 支持数据排序和分页
 * 3. 提供数据格式化显示
 * 4. 支持涨跌幅颜色区分
 * 
 * 参数：
 * @param historyData - 历史行情数据数组
 * 
 * 事件：
 * @emits refresh - 刷新数据请求
 * @emits sort-change - 排序变化
 */
import { ref, computed } from 'vue'
import type { StockHistory } from '@/services/individualStockApi'

// 组件属性
interface Props {
  historyData: StockHistory[]
}

const props = defineProps<Props>()

// 组件事件
const emit = defineEmits<{
  refresh: []
  'sort-change': [{ prop: string; order: string | null }]
}>()

// 排序状态
const sortField = ref('date')
const sortOrder = ref('desc')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性：排序后的历史数据
const sortedHistoryData = computed(() => {
  if (!props.historyData.length) return []
  
  return [...props.historyData].sort((a, b) => {
    const fieldA = a[sortField.value as keyof StockHistory]
    const fieldB = b[sortField.value as keyof StockHistory]
    
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
})

// 计算属性：当前页的历史数据
const paginatedHistoryData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedHistoryData.value.slice(start, end)
})

// 方法：排序变化处理
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sortField.value = prop || 'date'
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  emit('sort-change', { prop, order })
}

// 方法：页大小变化
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

// 方法：当前页变化
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

// 方法：刷新数据
const handleRefresh = () => {
  emit('refresh')
}

// 方法：获取价格颜色类
const getPriceClass = (change: number) => {
  if (change > 0) return 'price-up'
  if (change < 0) return 'price-down'
  return 'price-unchanged'
}

// 方法：格式化成交量
const formatVolume = (volume: number | null | undefined): string => {
  if (volume === null || volume === undefined) return '-'
  
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿手'
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万手'
  } else {
    return volume.toString() + '手'
  }
}

// 方法：格式化成交额
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

// 暴露方法供父组件调用
defineExpose({
  resetPagination: () => {
    currentPage.value = 1
  }
})
</script>

<style scoped>
.history-data-table {
  width: 100%;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.price-up {
  color: #f56c6c;
  font-weight: 600;
}

.price-down {
  color: #67c23a;
  font-weight: 600;
}

.price-unchanged {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-container {
    font-size: 12px;
  }
}
</style>