<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    title="回测结果详情"
    width="90%"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="result" class="result-container">
      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        
        <el-descriptions :column="3" border>
          <el-descriptions-item label="任务ID">{{ result.task_info.task_id }}</el-descriptions-item>
          <el-descriptions-item label="策略名称">{{ result.task_info.strategy_name }}</el-descriptions-item>
          <el-descriptions-item label="股票代码">{{ result.task_info.stock_code }}</el-descriptions-item>
          <el-descriptions-item label="股票名称">{{ result.task_info.stock_name }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ result.task_info.start_date }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ result.task_info.end_date }}</el-descriptions-item>
          <el-descriptions-item label="初始资金">{{ formatCurrency(result.task_info.initial_cash) }}</el-descriptions-item>
          <el-descriptions-item label="手续费率">{{ formatPercent(result.task_info.commission) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(result.task_info.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ formatDateTime(result.task_info.completed_at) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 策略参数 -->
        <div v-if="result.task_info.strategy_params && Object.keys(result.task_info.strategy_params).length > 0" class="strategy-params">
          <h4>策略参数</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item 
              v-for="(value, key) in result.task_info.strategy_params" 
              :key="key" 
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
      
      <!-- 绩效指标 -->
      <el-card class="performance-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>绩效指标</span>
          </div>
        </template>
        
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">初始价值</div>
              <div class="metric-value">{{ formatCurrency(result.performance.initial_value) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">最终价值</div>
              <div class="metric-value">{{ formatCurrency(result.performance.final_value) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">总收益率</div>
              <div class="metric-value" :class="getReturnClass(result.performance.total_return)">
                {{ formatPercent(result.performance.total_return) }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">年化收益率</div>
              <div class="metric-value" :class="getReturnClass(result.performance.annual_return)">
                {{ formatPercent(result.performance.annual_return) }}
              </div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">夏普比率</div>
              <div class="metric-value">
                {{ result.performance.sharpe_ratio !== null ? result.performance.sharpe_ratio.toFixed(4) : '-' }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">最大回撤</div>
              <div class="metric-value negative">
                {{ formatPercent(result.performance.max_drawdown) }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">波动率</div>
              <div class="metric-value">
                {{ result.performance.volatility !== null ? formatPercent(result.performance.volatility) : '-' }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">总交易次数</div>
              <div class="metric-value">{{ result.performance.total_trades }}</div>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">胜率</div>
              <div class="metric-value">
                {{ result.performance.win_rate !== null ? formatPercent(result.performance.win_rate) : '-' }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">盈利交易</div>
              <div class="metric-value positive">{{ result.performance.winning_trades }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="metric-item">
              <div class="metric-label">亏损交易</div>
              <div class="metric-value negative">{{ result.performance.losing_trades }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <!-- 预留位置，可以添加其他指标 -->
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 交易记录 -->
      <el-card v-if="result.detailed_data.trade_records.length > 0" class="trades-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>交易记录</span>
            <span class="trade-count">共 {{ result.detailed_data.trade_records.length }} 笔交易</span>
          </div>
        </template>
        
        <el-table 
          :data="result.detailed_data.trade_records" 
          stripe 
          style="width: 100%"
          max-height="400"
        >
          <el-table-column prop="datetime" label="交易时间" min-width="160">
            <template #default="scope">
              {{ formatDateTime(scope.row.datetime) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="交易类型" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'buy' ? 'success' : 'danger'">
                {{ scope.row.type === 'buy' ? '买入' : '卖出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="数量" min-width="100" />
          <el-table-column prop="price" label="价格" min-width="120">
            <template #default="scope">
              {{ formatCurrency(scope.row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="value" label="交易金额" min-width="140">
            <template #default="scope">
              {{ formatCurrency(scope.row.value) }}
            </template>
          </el-table-column>
          <el-table-column prop="commission" label="手续费" min-width="120">
            <template #default="scope">
              {{ formatCurrency(scope.row.commission) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="loadResult">重试</el-button>
        </template>
      </el-result>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 回测结果详情对话框组件
 * 功能：
 * 1. 展示回测任务的基本信息
 * 2. 展示绩效指标
 * 3. 展示交易记录
 * 4. 支持加载状态和错误处理
 * 
 * 参数：
 * - visible: 对话框是否可见
 * - taskId: 回测任务ID
 * 
 * 事件：
 * - update:visible: 更新对话框可见状态
 */
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getBacktestResult, type BacktestResult } from '@/services/quantBacktestApi'

// 组件属性
interface Props {
  visible: boolean
  taskId?: string
}

// 组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const result = ref<BacktestResult | null>(null)
const loading = ref(false)
const error = ref('')

// 加载回测结果
const loadResult = async () => {
  if (!props.taskId) {
    error.value = '任务ID不能为空'
    return
  }
  
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    result.value = await getBacktestResult(props.taskId)
  } catch (err: any) {
    console.error('加载回测结果失败:', err)
    error.value = err.message || '加载回测结果失败'
    ElMessage.error('加载回测结果失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  // 清理数据
  result.value = null
  error.value = ''
}

// 监听对话框显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible && props.taskId) {
    loadResult()
  }
})

// 格式化货币
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value)
}

// 格式化百分比
const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`
}

// 格式化日期时间
const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取收益率样式类
const getReturnClass = (value: number): string => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return ''
}
</script>

<style scoped>
.result-container {
  max-height: 70vh;
  overflow-y: auto;
}

.info-card,
.performance-card,
.trades-card {
  margin-bottom: 20px;
}

.info-card:last-child,
.performance-card:last-child,
.trades-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.trade-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.strategy-params {
  margin-top: 20px;
}

.strategy-params h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.metric-item {
  text-align: center;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.loading-container {
  padding: 20px;
}

.error-container {
  padding: 20px;
  text-align: center;
}

/* 滚动条样式 */
.result-container::-webkit-scrollbar {
  width: 6px;
}

.result-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.result-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.result-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>