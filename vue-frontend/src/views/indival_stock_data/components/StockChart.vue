<template>
  <div class="stock-chart-container">
    <div v-if="!loading && historyData.length > 0" class="chart-wrapper">
      <div ref="chartRef" class="stock-chart"></div>
    </div>
    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    <div v-else class="empty-container">
      <el-empty description="暂无历史行情数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 股票历史行情图表组件
 * 
 * 功能：
 * 1. 展示股票K线图和成交量
 * 2. 支持数据缩放和交互
 * 3. 响应式设计
 * 
 * 参数：
 * @param historyData - 历史行情数据数组
 * @param stockInfo - 股票基本信息
 * @param loading - 加载状态
 * 
 * 事件：
 * 无
 */
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { StockHistory, StockInfo } from '@/services/individualStockApi'

// Props 定义
interface Props {
  historyData: StockHistory[]
  stockInfo: StockInfo
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 图表引用
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

/**
 * 初始化图表
 * 功能：创建K线图和成交量图表
 */
const initChart = () => {
  console.log('StockChart initChart called', {
    hasChartRef: !!chartRef.value,
    dataLength: props.historyData.length,
    stockInfo: props.stockInfo,
    loading: props.loading
  })
  
  if (!chartRef.value || !props.historyData.length) {
    console.log('StockChart initChart early return', {
      hasChartRef: !!chartRef.value,
      dataLength: props.historyData.length
    })
    return
  }
  
  // 如果图表已存在，先销毁
  if (chart) {
    chart.dispose()
  }
  
  // 创建图表实例
  chart = echarts.init(chartRef.value)
  console.log('StockChart chart instance created', chart)
  
  // 设置图表选项
  const option = {
    title: {
      text: `${props.stockInfo.name} (${props.stockInfo.code}) 历史K线图`,
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
        data: props.historyData.map(item => item.date),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        gridIndex: 0
      },
      {
        type: 'category',
        data: props.historyData.map(item => item.date),
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
        data: props.historyData.map(item => [
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
        data: props.historyData.map(item => item.volume),
        itemStyle: {
          color: function(params: any) {
            const index = params.dataIndex
            const item = props.historyData[index]
            return item.close_price > item.open_price ? '#f56c6c' : '#67c23a'
          }
        }
      }
    ]
  }
  
  console.log('StockChart option prepared', option)
  
  // 设置图表选项并渲染
  chart.setOption(option)
  console.log('StockChart setOption completed')
  
  // 响应窗口大小变化
  const handleResize = () => {
    chart?.resize()
  }
  
  window.addEventListener('resize', handleResize)
}

/**
 * 监听数据变化，重新初始化图表
 */
watch(
  () => [props.historyData, props.stockInfo, props.loading],
  async () => {
    console.log('StockChart watch triggered', {
      loading: props.loading,
      dataLength: props.historyData.length,
      stockInfo: props.stockInfo
    })
    
    if (!props.loading && props.historyData.length > 0) {
      await nextTick()
      initChart()
    } else if (chart) {
      chart.clear()
    }
  },
  { deep: true, immediate: true }
)

// 组件挂载后初始化图表
onMounted(async () => {
  console.log('StockChart onMounted', {
    loading: props.loading,
    dataLength: props.historyData.length
  })
  
  if (!props.loading && props.historyData.length > 0) {
    await nextTick()
    initChart()
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
.stock-chart-container {
  width: 100%;
}

.chart-wrapper {
  margin-bottom: 30px;
}

.stock-chart {
  width: 100%;
  height: 500px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stock-chart {
    height: 350px;
  }
}
</style>