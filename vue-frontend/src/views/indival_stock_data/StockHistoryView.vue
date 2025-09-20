<template>
  <div class="stock-history-view">
    <el-card class="page-header">
      <template #header>
        <div class="header-content">
          <div class="stock-info">
            <h2>{{ stockInfo.name }} <span class="stock-code">{{ stockInfo.code }}</span></h2>
            <p v-if="stockInfo.industry">{{ stockInfo.industry }}</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="ArrowLeft" @click="goBack">返回</el-button>
            <el-button type="success" :icon="Refresh" @click="fetchHistoryData" :loading="loading">
              刷新数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 查询条件 -->
      <div class="query-section">
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="股票代码">
            <el-select 
              v-model="queryForm.code" 
              filterable 
              remote 
              placeholder="请输入股票代码或名称" 
              :remote-method="searchStocks"
              :loading="searchLoading"
              @change="handleStockChange"
            >
              <el-option 
                v-for="item in stockOptions" 
                :key="item.code" 
                :label="`${item.name} (${item.code})`" 
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="RefreshLeft" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 历史行情图表 -->
      <div v-if="!loading && historyData.length > 0" class="chart-container">
        <div ref="chartRef" class="stock-chart"></div>
      </div>

      <!-- 历史行情数据表格 -->
      <div v-if="!loading && historyData.length > 0" class="table-container">
        <h3>历史行情数据</h3>
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

      <!-- 加载中 -->
      <div v-else-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 无数据 -->
      <div v-else class="empty-container">
        <el-empty description="暂无历史行情数据">
          <el-button type="primary" @click="handleSearch">查询数据</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 股票历史行情页面
 * 
 * 功能：
 * 1. 展示单只股票的历史行情数据
 * 2. 支持股票切换
 * 3. 支持日期范围和周期选择
 * 4. 提供K线图表和数据表格两种展示方式
 * 5. 支持数据排序和分页
 */
import { ref, reactive, onMounted, watch, nextTick, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Refresh, Search, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getStockList, getStockHistory } from '@/services/individualStockApi'
import type { StockInfo, StockHistory } from '@/services/individualStockApi'

// 路由
const route = useRoute()
const router = useRouter()

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 数据加载状态
const loading = ref(false)
const searchLoading = ref(false)

// 股票信息
const stockInfo = reactive<StockInfo>({
  code: '',
  name: '',
  industry: '',
  total_shares: 0,
  circulating_shares: 0,
  list_date: '',
  pe_ratio: 0,
  pb_ratio: 0,
  total_market_cap: 0,
  circulating_market_cap: 0,
  created_at: '',
  updated_at: ''
})

// 查询表单
const queryForm = reactive({
  code: route.params.code as string || '',
  dateRange: [] as string[]
})

// 历史行情数据
const historyData = ref<StockHistory[]>([])

// 股票选择
const stockOptions = ref<StockInfo[]>([])

// 排序
const sortField = ref('date')
const sortOrder = ref('desc')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性：排序后的历史数据
const sortedHistoryData = computed(() => {
  if (!historyData.value.length) return []
  
  return [...historyData.value].sort((a, b) => {
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

// 方法：返回上一页
const goBack = () => {
  router.back()
}

// 方法：获取历史行情数据
const fetchHistoryData = async () => {
  if (!queryForm.code) {
    ElMessage.warning('请选择股票')
    return
  }
  
  loading.value = true
  try {
    // 处理日期范围
    const startDate = queryForm.dateRange[0] || ''
    const endDate = queryForm.dateRange[1] || ''
    
    const response = await getStockHistory(queryForm.code, {
      start_date: startDate,
      end_date: endDate,
      adjust: ''
    })
    
    historyData.value = response
    
    // 更新股票基本信息
    if (response && response.length > 0) {
      const latestData = response[0]
      stockInfo.code = queryForm.code
      stockInfo.name = latestData.stock_name || ''
    }
    
    ElMessage.success('历史行情数据加载成功')
  } catch (error) {
    console.error('获取历史行情数据失败:', error)
    ElMessage.error('获取历史行情数据失败，请稍后重试')
  } finally {
    loading.value = false
    // 在loading关闭并且DOM更新后再初始化图表，确保chart容器已渲染
    if (historyData.value && historyData.value.length > 0) {
      await nextTick()
      initChart()
    } else if (chart) {
      chart.clear()
    }
  }
}

// 方法：初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 如果图表已存在，先销毁
  if (chart) {
    chart.dispose()
  }
  
  // 创建图表实例
  chart = echarts.init(chartRef.value)
  
  // 准备数据
  const data = historyData.value.map(item => [
    item.date,
    item.open_price,
    item.close_price,
    item.low_price,
    item.high_price,
    item.volume
  ])
  
  // 设置图表选项
  const option = {
    title: {
      text: `${stockInfo.name} (${stockInfo.code}) 历史K线图`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['K线', '成交量'],
      bottom: 10
    },
    grid: [
      {
        id: 'main',
        left: '10%',
        right: '10%',
        height: '60%',
        top: '10%'
      },
      {
        id: 'volume',
        left: '10%',
        right: '10%',
        top: '75%',
        height: '15%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: historyData.value.map(item => item.date),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        gridIndex: 0
      },
      {
        type: 'category',
        data: historyData.value.map(item => item.date),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        gridIndex: 1,
        axisLabel: {show: false}
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: true,
        splitLine: { show: true },
        position: 'right',
        name: '价格',
        nameLocation: 'middle',
        nameGap: 30,
        gridIndex: 0
      },
      {
        type: 'value',
        scale: true,
        splitLine: { show: false },
        name: '成交量',
        nameLocation: 'middle',
        nameGap: 15,
        gridIndex: 1
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        xAxisIndex: [0, 1]
      },
      {
        show: true,
        type: 'slider',
        bottom: 5,
        start: 0,
        end: 100,
        xAxisIndex: [0, 1]
      }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: historyData.value.map(item => [
          item.open_price,
          item.close_price,
          item.low_price,
          item.high_price
        ]),
        itemStyle: {
          color: '#f56c6c',
          color0: '#67c23a',
          borderColor: '#f56c6c',
          borderColor0: '#67c23a'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: historyData.value.map(item => item.volume),
        itemStyle: {
          color: function(params: any) {
            const index = params.dataIndex
            const item = historyData.value[index]
            return item.close_price > item.open_price ? '#f56c6c' : '#67c23a'
          }
        }
      }
    ]
  }
  
  // 设置图表选项并渲染
  chart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart?.resize()
  })
}

// 方法：搜索股票
const searchStocks = async (query: string) => {
  if (query.length < 2) return
  
  searchLoading.value = true
  try {
    const response = await getStockList()
    const allStocks = response.data
    
    // 过滤股票
    stockOptions.value = allStocks.filter(stock => 
      stock.code.includes(query) || 
      stock.name.includes(query)
    ).slice(0, 20) // 限制结果数量
  } catch (error) {
    console.error('搜索股票失败:', error)
  } finally {
    searchLoading.value = false
  }
}

// 方法：股票切换
const handleStockChange = (value: string) => {
  queryForm.code = value
  router.push(`/stock-history/${value}`)
}

// 方法：查询
const handleSearch = () => {
  currentPage.value = 1
  fetchHistoryData()
}

// 方法：重置查询
const resetQuery = () => {
  queryForm.dateRange = []
  currentPage.value = 1
}

// 方法：排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sortField.value = prop || 'date'
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
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

// 监听路由参数变化
watch(
  () => route.params.code,
  (newCode) => {
    if (newCode && typeof newCode === 'string') {
      queryForm.code = newCode
      fetchHistoryData()
    }
  }
)

// 组件挂载
onMounted(() => {
  // 设置默认日期范围（最近30天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  queryForm.dateRange = [
    startDate.toISOString().split('T')[0].replace(/-/g, ''),
    endDate.toISOString().split('T')[0].replace(/-/g, '')
  ]
  
  if (queryForm.code) {
    fetchHistoryData()
  }
})

// 组件卸载前清理图表实例
onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  
  window.removeEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.stock-history-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.stock-info h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.stock-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.stock-code {
  font-size: 16px;
  color: #909399;
  margin-left: 8px;
}

.query-section {
  margin-bottom: 20px;
}

.chart-container {
  margin-bottom: 30px;
}

.stock-chart {
  width: 100%;
  height: 500px;
}

.table-container {
  margin-top: 30px;
  width: 100%;
  overflow-x: auto;
}

.table-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.price-up {
  color: #f56c6c;
}

.price-down {
  color: #67c23a;
}

.price-unchanged {
  color: #909399;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stock-history-view {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  
  .query-section .el-form {
    display: flex;
    flex-direction: column;
  }
  
  .query-section .el-form-item {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .stock-chart {
    height: 350px;
  }
}
</style>