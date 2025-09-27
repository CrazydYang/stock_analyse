<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="90%"
    :before-close="handleClose"
    destroy-on-close
  >
    <div v-if="strategyResult" class="strategy-detail-content">
      <!-- 策略基本信息 -->
      <div class="strategy-info-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>策略基本信息</span>
            </div>
          </template>
          <div class="strategy-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="策略ID">
                {{ strategyResult.id }}
              </el-descriptions-item>
              <el-descriptions-item label="策略名称">
                {{ strategyResult.strategy_name }}
              </el-descriptions-item>
              <el-descriptions-item label="策略描述" :span="2">
                {{ strategyResult.strategy_description }}
              </el-descriptions-item>
              <el-descriptions-item label="选股数量">
                <el-tag type="info">{{ strategyResult.strategy_result.length }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDateTime(strategyResult.created_at) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDateTime(strategyResult.updated_at) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <!-- 选股结果表格 -->
      <div class="selected-stocks-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>选股结果 ({{ strategyResult.strategy_result.length }} 只股票)</span>
              <div class="header-actions">
                <el-input
                  v-model="stockSearchKeyword"
                  placeholder="搜索股票代码或名称"
                  clearable
                  style="width: 200px; margin-right: 10px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button :icon="Download" @click="exportData">
                  导出数据
                </el-button>
              </div>
            </div>
          </template>
          
          <el-table
            :data="filteredStocks"
            stripe
            border
            style="width: 100%"
            :default-sort="{ prop: 'stock_code', order: 'ascending' }"
            max-height="500"
          >
            <!-- 动态列：根据数据结构自动生成 -->
            <el-table-column
              v-for="column in tableColumns"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              :min-width="column.minWidth"
              :align="column.align"
              :sortable="column.sortable"
              :show-overflow-tooltip="column.showOverflowTooltip"
            >
              <template #default="{ row }">
                <span v-if="column.type === 'number'">
                  {{ formatNumber(row[column.prop]) }}
                </span>
                <span v-else>
                  {{ row[column.prop] || '-' }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="strategyResult.strategy_result.length > 10" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="filteredStocks.length"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 策略结果详情弹窗组件
 * 
 * 功能：
 * 1. 展示策略的基本信息（ID、名称、描述、执行时间等）
 * 2. 展示策略参数（如果有）
 * 3. 以表格形式展示选股结果，支持动态列
 * 4. 支持按股票代码或名称搜索
 * 5. 支持数据导出
 * 6. 支持分页显示
 * 
 * 参数：
 * - visible: 弹窗显示状态
 * - strategyResult: 策略结果数据
 * 
 * 事件：
 * - update:visible: 更新弹窗显示状态
 */
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import type { StrategyResult, SelectedStock } from '@/services/strategyResultApi'

// Props
interface Props {
  visible: boolean
  strategyResult: StrategyResult | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  strategyResult: null
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 弹窗标题
const dialogTitle = computed(() => {
  return props.strategyResult ? `策略详情 - ${props.strategyResult.strategy_name}` : '策略详情'
})

// 股票搜索关键词
const stockSearchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 表格列配置
const tableColumns = ref<Array<{
  prop: string
  label: string
  width?: number
  minWidth?: number
  align?: string
  sortable?: boolean
  showOverflowTooltip?: boolean
  type?: string
}>>([])

// 过滤后的股票数据
const filteredStocks = computed(() => {
  if (!props.strategyResult?.strategy_result) return []
  
  let stocks = props.strategyResult.strategy_result
  
  // 按关键词过滤
  if (stockSearchKeyword.value) {
    const keyword = stockSearchKeyword.value.toLowerCase()
    stocks = stocks.filter((stock: SelectedStock) => 
      stock.stock_code?.toLowerCase().includes(keyword) ||
      stock.stock_name?.toLowerCase().includes(keyword)
    )
  }
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return stocks.slice(startIndex, endIndex)
})

/**
 * 生成表格列配置
 */
const generateTableColumns = () => {
  if (!props.strategyResult?.strategy_result?.length) {
    tableColumns.value = []
    return
  }
  
  const firstStock = props.strategyResult.strategy_result[0]
  const columns = []
  
  // 基础列
  if (firstStock.stock_code !== undefined) {
    columns.push({
      prop: 'stock_code',
      label: '股票代码',
      width: 120,
      align: 'center',
      sortable: true
    })
  }
  
  if (firstStock.stock_name !== undefined) {
    columns.push({
      prop: 'stock_name',
      label: '股票名称',
      minWidth: 120,
      showOverflowTooltip: true,
      sortable: true
    })
  }
  
  if (firstStock.buy_signal !== undefined) {
    columns.push({
      prop: 'buy_signal',
      label: '买入信号',
      minWidth: 150,
      showOverflowTooltip: true
    })
  }
  
  // 动态列：其他字段
  const excludeFields = ['stock_code', 'stock_name', 'buy_signal']
  Object.keys(firstStock).forEach(key => {
    if (!excludeFields.includes(key)) {
      const value = firstStock[key]
      columns.push({
        prop: key,
        label: key,
        minWidth: 120,
        align: typeof value === 'number' ? 'center' : 'left',
        sortable: true,
        showOverflowTooltip: true,
        type: typeof value === 'number' ? 'number' : 'string'
      })
    }
  })
  
  tableColumns.value = columns
}

/**
 * 格式化数字
 */
const formatNumber = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value !== 'number') return String(value)
  
  // 保留2位小数
  return value.toFixed(2)
}

/**
 * 格式化参数值
 */
const formatParameterValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
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

/**
 * 页大小变化
 */
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

/**
 * 当前页变化
 */
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

/**
 * 导出数据
 */
const exportData = () => {
  if (!props.strategyResult?.strategy_result?.length) {
    ElMessage.warning('没有数据可导出')
    return
  }
  
  try {
    const stocks = props.strategyResult.strategy_result
    const headers = tableColumns.value.map(col => col.label).join(',')
    const rows = stocks.map((stock: SelectedStock) => 
      tableColumns.value.map(col => stock[col.prop] || '').join(',')
    ).join('\n')
    
    const csvContent = `${headers}\n${rows}`
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${props.strategyResult.strategy_name}_选股结果.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  }
}

/**
 * 关闭弹窗
 */
const handleClose = () => {
  dialogVisible.value = false
  // 重置状态
  stockSearchKeyword.value = ''
  currentPage.value = 1
}

// 监听策略结果变化，重新生成表格列
watch(
  () => props.strategyResult,
  () => {
    if (props.strategyResult) {
      generateTableColumns()
      // 重置搜索和分页状态
      stockSearchKeyword.value = ''
      currentPage.value = 1
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.strategy-detail-content {
  max-height: 80vh;
  overflow-y: auto;
}

.strategy-info-section,
.strategy-params-section,
.selected-stocks-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.strategy-info {
  margin-top: 10px;
}

.params-content {
  margin-top: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions .el-input {
    width: 100% !important;
  }
}
</style>