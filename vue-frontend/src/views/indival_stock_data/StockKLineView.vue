<template>
  <div class="stock-kline-view">
    <div class="page-header">
      <h1>股票K线图分析</h1>
      <p>查看个股历史K线数据，支持技术指标分析</p>
    </div>
    
    <div class="control-panel">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>查询条件</span>
          </div>
        </template>
        
        <el-form :model="queryForm" label-width="100px" class="query-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="股票代码">
                <el-select
                  v-model="queryForm.stockCode"
                  placeholder="请选择股票"
                  class="full-width"
                  @change="handleStockSelect"
                >
                  <el-option
                    v-for="item in stockList"
                    :key="item.code"
                    :label="`${item.code} ${item.name}`"
                    :value="item.code"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="时间范围">
                <el-select v-model="queryForm.dateRangeType" @change="handleDateRangeChange" class="full-width">
                  <el-option label="最近一周" value="week" />
                  <el-option label="最近一月" value="month" />
                  <el-option label="最近三月" value="threeMonths" />
                  <el-option label="最近六月" value="sixMonths" />
                  <el-option label="最近一年" value="year" />
                  <el-option label="最近三年" value="threeYears" />
                  <el-option label="全部" value="all" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" v-if="queryForm.dateRangeType === 'custom'">
            <el-col :span="8">
              <el-form-item label="开始日期">
                <el-date-picker
                  v-model="queryForm.startDate"
                  type="date"
                  placeholder="选择开始日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="8">
              <el-form-item label="结束日期">
                <el-date-picker
                  v-model="queryForm.endDate"
                  type="date"
                  placeholder="选择结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item>
            <el-button type="primary" @click="fetchStockData">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div class="chart-container" v-if="stockHistoryData.length > 0">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ selectedStockInfo.name }}({{ selectedStockInfo.code }}) K线图</span>
            <div class="stock-info">
              <span>行业: {{ selectedStockInfo.industry || '未知' }}</span>
              <span>上市日期: {{ selectedStockInfo.listDate || '未知' }}</span>
              <span>总市值: {{ formatMarketCap(selectedStockInfo.totalMarketCap) }}</span>
              <span>流通市值: {{ formatMarketCap(selectedStockInfo.circulatingMarketCap) }}</span>
            </div>
          </div>
        </template>
        
        <stock-k-line-chart
          :stock-code="selectedStockInfo.code"
          :stock-name="selectedStockInfo.name"
          :kline-data="stockHistoryData"
          height="600px"
          :show-volume="true"
        />
        

      </el-card>
    </div>
    
    <div class="empty-state" v-else>
      <el-empty description="请选择股票并查询数据" />
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import StockKLineChart from '@/components/StockKLineChart.vue'
import { fetchStockHistoryData, fetchStockInfo, fetchStockList, formatDateToYYYYMMDD, getDaysAgo } from '@/services/stockHistoryApi'
import type { StockHistoryDataItem, StockInfoItem } from '@/services/stockHistoryApi'

// 查询表单
const queryForm = reactive({
  stockCode: '',
  stockName: '',
  dateRangeType: 'month',
  startDate: '',
  endDate: ''
})

// 股票数据
const stockHistoryData = ref<StockHistoryDataItem[]>([])
const selectedStockInfo = reactive({
  code: '',
  name: '',
  industry: '',
  listDate: '',
  totalMarketCap: 0,
  circulatingMarketCap: 0
})



// 股票列表数据
const stockList = ref<StockInfoItem[]>([])

// 加载状态
const loading = ref(false)

// 选择股票
const handleStockSelect = (stockCode: string) => {
  // 从已加载的股票列表中查找股票信息
  const selectedStock = stockList.value.find(item => item.code === stockCode)
  
  if (selectedStock) {
    queryForm.stockCode = selectedStock.code
    queryForm.stockName = selectedStock.name
    
    // 获取股票详细信息
    fetchStockDetailInfo(selectedStock.code)
  }
}

// 获取股票详细信息
const fetchStockDetailInfo = async (stockCode: string) => {
  try {
    const stockInfo = await fetchStockInfo(stockCode)
    
    selectedStockInfo.code = stockInfo.code
    selectedStockInfo.name = stockInfo.name
    selectedStockInfo.industry = stockInfo.industry
    selectedStockInfo.listDate = stockInfo.list_date
    selectedStockInfo.totalMarketCap = stockInfo.total_market_cap
    selectedStockInfo.circulatingMarketCap = stockInfo.circulating_market_cap
  } catch (error) {
    console.error('获取股票详细信息失败:', error)
    ElMessage.error('获取股票详细信息失败')
  }
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  const today = new Date()
  const endDateStr = formatDateToYYYYMMDD(today)
  
  // 设置结束日期为今天
  queryForm.endDate = endDateStr
  
  // 根据选择的时间范围设置开始日期
  switch (queryForm.dateRangeType) {
    case 'week':
      // 最近一周
      queryForm.startDate = formatDateToYYYYMMDD(getDaysAgo(7))
      break
    case 'month':
      // 最近一月
      queryForm.startDate = formatDateToYYYYMMDD(getDaysAgo(30))
      break
    case 'threeMonths':
      // 最近三月
      queryForm.startDate = formatDateToYYYYMMDD(getDaysAgo(90))
      break
    case 'sixMonths':
      // 最近六月
      queryForm.startDate = formatDateToYYYYMMDD(getDaysAgo(180))
      break
    case 'year':
      // 最近一年
      queryForm.startDate = formatDateToYYYYMMDD(getDaysAgo(365))
      break
    case 'threeYears':
      // 最近三年
      queryForm.startDate = formatDateToYYYYMMDD(getDaysAgo(365 * 3))
      break
    case 'all':
      // 全部，不设置开始日期
      queryForm.startDate = ''
      break
    case 'custom':
      // 自定义，不自动设置日期
      break
  }
}

// 获取股票数据
const fetchStockData = async () => {
  if (!queryForm.stockCode) {
    ElMessage.warning('请选择股票')
    return
  }
  
  loading.value = true
  
  try {
    // 转换日期格式
    let startDate = queryForm.startDate
    let endDate = queryForm.endDate
    
    if (startDate) {
      startDate = startDate.replace(/-/g, '')
    }
    
    if (endDate) {
      endDate = endDate.replace(/-/g, '')
    }
    
    // 获取股票历史数据
    const historyData = await fetchStockHistoryData(
      queryForm.stockCode,
      startDate,
      endDate
    )
    
    stockHistoryData.value = historyData
    
    if (historyData.length === 0 ) {
      ElMessage.warning('未查询到股票历史数据')
    }
  } catch (error) {
    console.error('获取股票数据失败:', error)
    ElMessage.error('获取股票数据失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  queryForm.stockCode = ''
  queryForm.stockName = ''
  queryForm.dateRangeType = 'month'
  queryForm.startDate = ''
  queryForm.endDate = ''
  
  stockHistoryData.value = []
  
  // 重置选中的股票信息
  selectedStockInfo.code = ''
  selectedStockInfo.name = ''
  selectedStockInfo.industry = ''
  selectedStockInfo.listDate = ''
  selectedStockInfo.totalMarketCap = 0
  selectedStockInfo.circulatingMarketCap = 0
}

// 格式化市值
const formatMarketCap = (value: number): string => {
  if (!value) return '未知'
  
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`
  } else {
    return value.toString()
  }
}



// 加载股票列表数据
const loadStockList = async () => {
  try {
    loading.value = true
    const { data } = await fetchStockList(1, 100) // 加载更多股票以供选择
    stockList.value = data
  } catch (error) {
    console.error('加载股票列表失败:', error)
    ElMessage.error('加载股票列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化日期范围和加载股票列表
onMounted(() => {
  handleDateRangeChange()
  loadStockList() // 页面渲染时加载股票列表
})
</script>

<style scoped>
.stock-kline-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.page-header p {
  color: #606266;
  margin: 0;
}

.control-panel {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #606266;
}

.query-form {
  margin-top: 10px;
}

.full-width {
  width: 100%;
}

.chart-container {
  margin-top: 20px;
}

.empty-state {
  margin-top: 50px;
  display: flex;
  justify-content: center;
}

.stock-item {
  display: flex;
  justify-content: space-between;
}

.stock-code {
  font-weight: bold;
}

.stock-name {
  color: #606266;
}


</style>