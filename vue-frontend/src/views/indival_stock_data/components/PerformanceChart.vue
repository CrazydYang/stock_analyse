<template>
  <div class="performance-chart-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-input
        v-model="reportDateFilter"
        placeholder="筛选报告期 (如: 2023, 2023-12)"
        clearable
        :prefix-icon="Search"
        @input="handleFilterChange"
        style="width: 300px; margin-right: 10px;"
      />
      <el-button @click="clearFilter">清除筛选</el-button>
    </div>

    <!-- 图表区域 -->
    <div v-if="!loading && filteredPerformanceData.length > 0" class="chart-wrapper">
      <h3>业绩数据趋势</h3>
      <div ref="performanceChartRef" class="performance-chart"></div>
    </div>
    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else class="empty-container">
      <el-empty :description="getEmptyDescription()" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 业绩数据趋势图表组件
 * 
 * 功能：
 * 1. 展示股票业绩数据趋势图表
 * 2. 支持报告期筛选功能
 * 3. 包含营业收入、净利润、每股收益、ROE等关键指标
 * 4. 响应式设计
 * 
 * 参数：
 * @param performanceData - 业绩数据数组
 * @param stockInfo - 股票基本信息
 * @param loading - 加载状态
 * 
 * 事件：
 * 无
 */
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { PerformanceReport, StockInfo } from '@/services/individualStockApi'

// Props 定义
interface Props {
  performanceData: PerformanceReport[]
  stockInfo: StockInfo
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 图表引用
const performanceChartRef = ref<HTMLElement | null>(null)
let performanceChart: echarts.ECharts | null = null

// 筛选相关
const reportDateFilter = ref('')

/**
 * 筛选后的业绩数据
 * 功能：根据报告期筛选条件过滤数据
 */
const filteredPerformanceData = computed(() => {
  if (!reportDateFilter.value) {
    return props.performanceData
  }
  
  const filterValue = reportDateFilter.value.toLowerCase().trim()
  return props.performanceData.filter(item => 
    item.report_date.toLowerCase().includes(filterValue)
  )
})

/**
 * 获取空数据状态描述
 * 功能：根据筛选状态显示不同的空数据提示
 */
const getEmptyDescription = () => {
  if (reportDateFilter.value && props.performanceData.length > 0) {
    return '未找到匹配的业绩数据'
  }
  return '暂无业绩数据'
}

/**
 * 处理筛选变化
 * 功能：当筛选条件改变时触发
 */
const handleFilterChange = () => {
  // 筛选变化时重新初始化图表
  if (filteredPerformanceData.value.length > 0) {
    nextTick(() => {
      initPerformanceChart()
    })
  } else if (performanceChart) {
    performanceChart.clear()
  }
}

/**
 * 清除筛选
 * 功能：重置筛选条件
 */
const clearFilter = () => {
  reportDateFilter.value = ''
}

/**
 * 初始化业绩数据趋势图表
 * 功能：展示股票的业绩数据趋势，包括营业收入、净利润、每股收益等关键指标
 */
const initPerformanceChart = () => {
  if (!performanceChartRef.value || !filteredPerformanceData.value.length) return
  
  // 如果图表已存在，先销毁
  if (performanceChart) {
    performanceChart.dispose()
  }
  
  // 创建图表实例
  performanceChart = echarts.init(performanceChartRef.value)
  
  // 准备数据 - 按时间排序（最早的在前）
  const sortedData = [...filteredPerformanceData.value].sort((a, b) => 
    a.report_date.localeCompare(b.report_date)
  )
  
  const dates = sortedData.map(item => item.report_date)
  const revenue = sortedData.map(item => item.operating_revenue / 100000000) // 转换为亿元
  const netProfit = sortedData.map(item => item.net_profit / 100000000) // 转换为亿元
  const eps = sortedData.map(item => item.earnings_per_share)
  const roe = sortedData.map(item => item.roe)
  
  // 设置图表选项
  const option = {
    title: {
      text: `${props.stockInfo.name} (${props.stockInfo.code}) 业绩数据趋势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['营业收入(亿元)', '净利润(亿元)', '每股收益(元)', 'ROE(%)'],
      top: 40
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(亿元)',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '比率',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '营业收入(亿元)',
        type: 'line',
        yAxisIndex: 0,
        data: revenue,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '净利润(亿元)',
        type: 'line',
        yAxisIndex: 0,
        data: netProfit,
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '每股收益(元)',
        type: 'line',
        yAxisIndex: 1,
        data: eps,
        smooth: true,
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: 'ROE(%)',
        type: 'line',
        yAxisIndex: 1,
        data: roe,
        smooth: true,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  
  // 设置图表选项并渲染
  performanceChart.setOption(option)
  
  // 响应窗口大小变化
  const handleResize = () => {
    performanceChart?.resize()
  }
  
  window.addEventListener('resize', handleResize)
}

/**
 * 监听数据变化，重新初始化图表
 */
watch(
  () => [props.performanceData, props.stockInfo],
  async () => {
    if (!props.loading && filteredPerformanceData.value.length > 0) {
      await nextTick()
      initPerformanceChart()
    } else if (performanceChart) {
      performanceChart.clear()
    }
  },
  { deep: true }
)

/**
 * 监听筛选数据变化
 */
watch(
  () => filteredPerformanceData.value,
  async () => {
    if (!props.loading && filteredPerformanceData.value.length > 0) {
      await nextTick()
      initPerformanceChart()
    } else if (performanceChart) {
      performanceChart.clear()
    }
  },
  { deep: true }
)

// 组件挂载后初始化图表
onMounted(async () => {
  if (!props.loading && filteredPerformanceData.value.length > 0) {
    await nextTick()
    initPerformanceChart()
  }
})

// 组件卸载前清理图表实例
onBeforeUnmount(() => {
  if (performanceChart) {
    performanceChart.dispose()
    performanceChart = null
  }
  
  window.removeEventListener('resize', () => {
    performanceChart?.resize()
  })
})
</script>

<style scoped>
.performance-chart-container {
  width: 100%;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.chart-wrapper {
  margin-bottom: 30px;
}

.chart-wrapper h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.performance-chart {
  width: 100%;
  height: 400px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-section {
    padding: 10px;
  }
  
  .filter-section .el-input {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
  
  .performance-chart {
    height: 300px;
  }
}
</style>