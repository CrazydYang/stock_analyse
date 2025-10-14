<template>
  <div class="congestion-heatmap">
    <el-card>
      <template #header>
        <div class="header-controls">
          <h3>行业拥挤度热力图</h3>
          <div class="controls">
            <!-- 热力图类型选择 -->
            <el-radio-group v-model="heatmapType" @change="updateChart" size="small">
              <el-radio-button label="turnover">成交金额占比分位数</el-radio-button>
              <el-radio-button label="performance">行业业绩指标</el-radio-button>
            </el-radio-group>
            
            <!-- 业绩指标选择（仅在业绩指标模式下显示） -->
            <el-select 
              v-if="heatmapType === 'performance'" 
              v-model="selectedMetric" 
              @change="updateChart" 
              placeholder="选择指标" 
              style="width: 180px; margin-left: 10px;"
            >
              <el-option 
                v-for="(config, key) in HEATMAP_METRICS" 
                :key="key" 
                :label="config.name" 
                :value="key" 
              />
            </el-select>
            
            <!-- 报告类型选择（仅在业绩指标模式下显示） -->
            <el-select 
              v-if="heatmapType === 'performance'" 
              v-model="reportType" 
              @change="updateChart" 
              placeholder="选择报告类型" 
              style="width: 120px; margin-left: 10px;"
            >
              <el-option label="年报" value="annual" />
              <el-option label="中报" value="semi_annual" />
              <el-option label="一季报" value="q1" />
              <el-option label="三季报" value="q3" />
              <el-option label="季报" value="quarterly" />
            </el-select>
            
            <!-- 日期范围选择（仅在换手率模式下显示） -->
            <el-select 
              v-if="heatmapType === 'turnover'" 
              v-model="selectedDateRange" 
              @change="updateChart" 
              placeholder="选择日期范围" 
              style="width: 150px; margin-left: 10px;"
            >
              <el-option label="最近10天" value="10" />
              <el-option label="最近15天" value="15" />
              <el-option label="最近20天" value="20" />
              <el-option label="全部29天" value="all" />
            </el-select>
            
            <el-input
              v-model="searchKeyword"
              @input="updateChart"
              @clear="updateChart"
              placeholder="搜索行业"
              style="width: 200px; margin-left: 10px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="sortByLastColumn" type="primary">按最后一列排序</el-button>
          </div>
        </div>
      </template>
      
      <div ref="chartContainer" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, reactive } from 'vue'
import * as echarts from 'echarts'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import { fetchIndustryTurnoverPercentile } from '@/services/industry-turnover-percentile'
import type { IndustryTurnoverPercentileItem } from '@/services/industry-turnover-percentile'
import { fetchIndustryHeatmapData, HeatmapMetricType, HEATMAP_METRICS } from '@/services/industry-heatmap'
import type { IndustryHeatmapData, IndustryHeatmapDataItem, HeatmapMetricConfig } from '@/services/industry-heatmap'

// 数据结构定义
// 使用从stockApi导入的IndustryTurnoverPercentileItem接口

interface CongestionData {
  turnoverRateFQuantile: number
  amountCongestionQuantile: number
}

interface IndustryData {
  name: string
  data: CongestionData[]
}

const chartContainer = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
const sortMetric = ref('amount')
const selectedDateRange = ref('20')
const sortAscending = ref(true) // 确保初始值为false，从大到小排序
const searchKeyword = ref('')
const loading = ref(false)

// 新增的响应式变量
const heatmapType = ref('turnover') // 热力图类型：turnover(换手率) 或 performance(业绩指标)
const selectedMetric = ref(HeatmapMetricType.OPERATING_REVENUE_GROWTH) // 选择的业绩指标
const reportType = ref('annual') // 报告类型

// 数据存储
const allIndustries = ref<IndustryData[]>([])
const allDates = ref<string[]>([])

// 新增：行业业绩数据存储
const industryHeatmapData = ref<IndustryHeatmapData | null>(null)

// 从API获取数据
const fetchData = async () => {
  loading.value = true
  try {
    if (heatmapType.value === 'turnover') {
      await fetchTurnoverData()
    } else {
      await fetchPerformanceData()
    }
  } catch (error) {
    console.error('获取数据出错:', error)
    ElMessage.error('获取数据出错，请检查网络连接或API服务是否可用')
  } finally {
    loading.value = false
  }
}

// 获取换手率数据
const fetchTurnoverData = async () => {
  // 计算日期范围
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  
  // 根据选择的日期范围计算开始日期
  const days = selectedDateRange.value === 'all' ? 30 : parseInt(selectedDateRange.value)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - days)
  const formattedStartDate = startDate.toISOString().split('T')[0]
  
  // 使用stockApi中的函数获取数据
  const response = await fetchIndustryTurnoverPercentile(formattedStartDate, endDate)
  
  if (response) {
    // 处理API返回的数据
    const apiData = response.data
    
    // 确保apiData是数组
    if (!Array.isArray(apiData)) {
      console.error('API返回的数据不是数组:', apiData)
      throw new Error('API返回的数据格式不正确')
    }
    
    // 提取所有唯一日期
    const uniqueDates = [...new Set(apiData.map((item: IndustryTurnoverPercentileItem) => item.date))].sort() as string[]
    allDates.value = uniqueDates
    
    // 按行业分组数据
    const industriesMap = new Map<string, {name: string, data: CongestionData[]}>() 
    
    apiData.forEach((item: IndustryTurnoverPercentileItem) => {
      if (!industriesMap.has(item.sector_code)) {
        industriesMap.set(item.sector_code, {
          name: item.sector_name,
          data: []
        })
      }
      
      // 为每个日期添加数据
      const industryData = industriesMap.get(item.sector_code)!
      const dateIndex = uniqueDates.indexOf(item.date)
      
      // 确保数据数组长度与日期数组一致
      while (industryData.data.length < uniqueDates.length) {
        industryData.data.push({
          turnoverRateFQuantile: 0,
          amountCongestionQuantile: 0
        })
      }
      
      // 更新对应日期的数据
      industryData.data[dateIndex] = {
        turnoverRateFQuantile: item.turnover_ratio_percentile,
        amountCongestionQuantile: item.turnover_ratio_percentile // 这里使用相同的值，因为API中没有提供amountCongestionQuantile
      }
    })
    
    // 转换为数组
    allIndustries.value = Array.from(industriesMap.values())
  } else {
    ElMessage.error('获取数据失败: ')
  }
}

// 获取行业业绩数据
const fetchPerformanceData = async () => {
  const response = await fetchIndustryHeatmapData(
    searchKeyword.value.trim() || undefined,
    reportType.value,
    undefined, // startDate
    undefined  // endDate
  )
  
  if (response) {
    industryHeatmapData.value = response
  } else {
    ElMessage.error('获取行业业绩数据失败')
  }
}

// 根据选择的日期范围过滤数据
const getFilteredData = () => {
  let industries = allIndustries.value
  
  // 根据搜索关键词过滤行业
  if (searchKeyword.value.trim()) {
    industries = allIndustries.value.filter(industry => 
      industry.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  const dates = selectedDateRange.value === 'all' ? allDates.value : allDates.value.slice(-parseInt(selectedDateRange.value))
  const filteredIndustries = industries.map(industry => ({
    ...industry,
    data: selectedDateRange.value === 'all' ? industry.data : industry.data.slice(-parseInt(selectedDateRange.value))
  }))
  return { dates, industries: filteredIndustries }
}

const initChart = () => {
  if (!chartContainer.value) return
  
  chart = echarts.init(chartContainer.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return
  
  if (heatmapType.value === 'turnover') {
    const { dates, industries } = getFilteredData()
    
    // 如果有搜索关键词，显示趋势图
    if (searchKeyword.value.trim()) {
      showTrendChart(industries, dates)
    } else {
      showHeatmap(industries, dates)
    }
  } else {
    // 业绩指标热力图
    showPerformanceHeatmap()
  }
}

// 显示业绩指标热力图
const showPerformanceHeatmap = () => {
  if (!chart || !industryHeatmapData.value) return
  
  const data = industryHeatmapData.value
  const dates = data.dates
  const industries = data.swCodeNames
  
  // 过滤行业（如果有搜索关键词）
  let filteredIndustries = industries
  if (searchKeyword.value.trim()) {
    filteredIndustries = industries.filter(industry => 
      industry.indexName.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  // 按最后一列数据排序
  const sortedIndustries = [...filteredIndustries].sort((a, b) => {
    const aData = data.congestions[a.indexCode]
    const bData = data.congestions[b.indexCode]
    
    if (!aData || !bData || aData.length === 0 || bData.length === 0) return 0
    
    const aLastValue = aData[aData.length - 1][selectedMetric.value as keyof IndustryHeatmapDataItem] as number
    const bLastValue = bData[bData.length - 1][selectedMetric.value as keyof IndustryHeatmapDataItem] as number
    
    return sortAscending.value ? aLastValue - bLastValue : bLastValue - aLastValue
  })
  
  // 构建热力图数据
  const heatmapData: [number, number, number][] = []
  let minValue = Infinity
  let maxValue = -Infinity
  
  sortedIndustries.forEach((industry, industryIndex) => {
    const industryData = data.congestions[industry.indexCode]
    if (industryData) {
      industryData.forEach((item, dateIndex) => {
        const value = item[selectedMetric.value as keyof IndustryHeatmapDataItem] as number
        heatmapData.push([dateIndex, industryIndex, value])
        minValue = Math.min(minValue, value)
        maxValue = Math.max(maxValue, value)
      })
    }
  })
  
  // 获取指标配置
  const metricConfig = HEATMAP_METRICS[selectedMetric.value as HeatmapMetricType]
  
  chart.clear()
  const option: echarts.EChartsOption = {
    tooltip: {
      position: 'top',
      formatter: function (params: any) {
        const [dateIndex, industryIndex, value] = params.data
        const date = dates[dateIndex]
        const industry = sortedIndustries[industryIndex].indexName
        const formattedValue = metricConfig.formatter ? metricConfig.formatter(value) : value.toFixed(2)
        return `${industry}<br/>${date}<br/>${metricConfig.name}: ${formattedValue}${metricConfig.unit}`
      }
    },
    grid: {
      height: Math.max(400, sortedIndustries.length * 20) + 'px',
      top: '2%',
      left: '15%',
      right: '16%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: dates,
        splitArea: { show: true },
        axisLabel: { rotate: 45, fontSize: 10 }
      },
      {
        type: 'category',
        position: 'top',
        data: dates,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { rotate: 45, fontSize: 10, margin: 6 },
        name: '报告期',
        nameLocation: 'end',
        nameTextStyle: { fontSize: 12 }
      }
    ],
    yAxis: [
      {
        type: 'category',
        data: sortedIndustries.map(industry => industry.indexName),
        splitArea: { show: true },
        axisLabel: { fontSize: 11 }
      },
      {
        type: 'category',
        position: 'right',
        data: sortedIndustries.map(industry => industry.indexName),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { fontSize: 11 },
        name: '行业',
        nameLocation: 'end',
        nameTextStyle: { fontSize: 12 }
      }
    ],
    visualMap: {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: '5%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      text: ['高', '低'],
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      name: metricConfig.name,
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        fontSize: 9,
        formatter: function (params: any) {
          const value = params.data[2]
          return metricConfig.formatter ? metricConfig.formatter(value) : value.toFixed(1)
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  chart.setOption(option)
  
  // 动态调整容器高度
  if (chartContainer.value) {
    const containerHeight = Math.max(500, sortedIndustries.length * 22 + 120)
    chartContainer.value.style.height = containerHeight + 'px'
    chart.resize()
  }
}

// 显示热力图
const showHeatmap = (industries: IndustryData[], dates: string[]) => {
  if (!chart) return
  
  const sortedIndustries = [...industries].sort((a, b) => {
    if (a.data.length === 0 || b.data.length === 0) return 0
    const aLastValue = a.data[a.data.length - 1][sortMetric.value === 'turnover' ? 'turnoverRateFQuantile' : 'amountCongestionQuantile']
    const bLastValue = b.data[b.data.length - 1][sortMetric.value === 'turnover' ? 'turnoverRateFQuantile' : 'amountCongestionQuantile']
    return sortAscending.value ? aLastValue - bLastValue : bLastValue - aLastValue
  })
  
  const heatmapData: [number, number, number][] = []
  
  sortedIndustries.forEach((industry, industryIndex) => {
    industry.data.forEach((item: any, dateIndex: number) => {
      const value = sortMetric.value === 'turnover' ? item.turnoverRateFQuantile : item.amountCongestionQuantile
      heatmapData.push([dateIndex, industryIndex, value])
    })
  })
  
  // 先清空之前的配置，避免热力图的 visualMap 等残留到趋势图
  chart.clear()
  chart.clear()
  const option: echarts.EChartsOption = {
    tooltip: {
      position: 'top',
      formatter: function (params: any) {
        const [dateIndex, industryIndex, value] = params.data
        const date = dates[dateIndex]
        const industry = sortedIndustries[industryIndex].name
        const metricName = sortMetric.value === 'turnover' ? '等权换手率分位数' : '成交金额占比分位数'
        return `${industry}<br/>${date}<br/>${metricName}: ${value}`
      }
    },
    grid: {
      height: Math.max(400, sortedIndustries.length * 20) + 'px',
      top: '2%',
      left: '15%',
      right: '16%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: dates.map(date => date.substring(5)),
        splitArea: { show: true },
        axisLabel: { rotate: 45, fontSize: 10 }
      },
      {
        type: 'category',
        position: 'top',
        data: dates.map(date => date.substring(5)),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { rotate: 45, fontSize: 10, margin: 6 },
        name: '日期',
        nameLocation: 'end',
        nameTextStyle: { fontSize: 12 }
      }
    ],
    yAxis: [
      {
        type: 'category',
        data: sortedIndustries.map(industry => industry.name),
        splitArea: { show: true },
        axisLabel: { fontSize: 11 }
      },
      {
        type: 'category',
        position: 'right',
        data: sortedIndustries.map(industry => industry.name),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { fontSize: 11 },
        name: '行业',
        nameLocation: 'end',
        nameTextStyle: { fontSize: 12 }
      }
    ],
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: '5%',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      },
      text: ['高', '低'],
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      name: sortMetric.value === 'turnover' ? '等权换手率分位数' : '成交金额占比分位数',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        fontSize: 9,
        formatter: function (params: any) {
          return params.data[2]
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  chart.setOption(option)
  
  // 动态调整容器高度
  if (chartContainer.value) {
    const containerHeight = Math.max(500, sortedIndustries.length * 22 + 120)
    chartContainer.value.style.height = containerHeight + 'px'
    chart.resize()
  }
}

// 显示趋势图
const showTrendChart = (industries: IndustryData[], dates: string[]) => {
  if (!chart) return
  
  const palette = ['#5470C6','#91CC75','#EE6666','#FAC858','#73C0DE','#3BA272','#FC8452','#9A60B4','#EA7CCC','#2f4554','#61a0a8','#d48265','#749f83','#ca8622','#bda29a','#6e7074','#546570','#c4ccd3']
  const hashColor = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0
    }
    return palette[hash % palette.length]
  }
  const series = industries.map((industry) => {
    const color = hashColor(industry.name)
    return {
      name: industry.name,
      type: 'line' as const,
      data: industry.data.map((item: any) => sortMetric.value === 'turnover' ? item.turnoverRateFQuantile : item.amountCongestionQuantile),
      smooth: true,
      symbol: 'circle' as const,
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color
      },
      itemStyle: {
        color
      }
    }
  })
  
  chart.clear()
  const option: echarts.EChartsOption = {
    title: {
      text: `行业拥挤度趋势图 - ${industries.map(i => i.name).join('、')}`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params: any) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((param: any) => {
          const metricName = sortMetric.value === 'turnover' ? '等权换手率分位数' : '成交金额占比分位数'
          result += `${param.seriesName} ${metricName}: ${param.value}<br/>`
        })
        return result
      }
    },
    legend: {
      type: 'scroll',
      data: industries.map((industry) => industry.name),
      top: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates.map(date => date.substring(5)),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: sortMetric.value === 'turnover' ? '等权换手率分位数' : '成交金额占比分位数',
      min: 0,
      max: 100
    },
    series: series
  }
  
  chart.setOption(option, true)
  
  // 调整容器高度为固定值
  if (chartContainer.value) {
    chartContainer.value.style.height = '500px'
    chart.resize()
  }
}

const sortByLastColumn = () => {
  sortAscending.value = !sortAscending.value
  updateChart()
}

const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

// 监听指标和搜索关键词变化
watch([sortMetric, searchKeyword], () => {
  if (chart) {
    updateChart()
  }
})

// 监听热力图类型、选择的指标、报告类型变化
watch([heatmapType, selectedMetric, reportType], async () => {
  await fetchData()
  if (chart) {
    updateChart()
  }
})

// 监听日期范围变化，重新获取数据（仅在换手率模式下）
watch(selectedDateRange, async () => {
  if (heatmapType.value === 'turnover') {
    await fetchData()
    if (chart) {
      updateChart()
    }
  }
})

onMounted(async () => {
  const loadingInstance = ElLoading.service({
    target: '.congestion-heatmap',
    text: '加载数据中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })
  
  try {
    await fetchData()
    await nextTick()
    initChart()
  } finally {
    loadingInstance.close()
  }
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.congestion-heatmap {
  padding: 20px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-controls h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.chart-container {
  width: 100%;
  min-height: 500px;
  height: auto;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .chart-container {
    height: 500px;
  }
}
</style>