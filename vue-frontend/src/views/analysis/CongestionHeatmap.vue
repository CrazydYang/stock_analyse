<template>
  <div class="congestion-heatmap">
    <el-card>
      <template #header>
        <div class="header-controls">
          <h3>行业拥挤度热力图</h3>
          <div class="controls">
            <el-radio-group v-model="sortMetric" @change="updateChart">
              <el-radio-button label="turnover">等权换手率分位数</el-radio-button>
              <el-radio-button label="amount">成交金额占比分位数</el-radio-button>
            </el-radio-group>
            <el-select v-model="selectedDateRange" @change="updateChart" placeholder="选择日期范围" style="width: 150px; margin-left: 10px;">
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { Search } from '@element-plus/icons-vue'

// 模拟数据结构
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
const sortMetric = ref('turnover')
const selectedDateRange = ref('20')
const sortAscending = ref(false)
const searchKeyword = ref('')

// 导入真实数据
import industryDataJson from './industry_data.json'

// 处理真实数据
const allIndustries: IndustryData[] = industryDataJson.swCodeNames.map(item => ({
  name: item.indexName,
  data: (industryDataJson.congestions as Record<string, any>)[item.indexCode] || []
}))

const allDates = industryDataJson.dates

// 根据选择的日期范围过滤数据
const getFilteredData = () => {
  let industries = allIndustries
  
  // 根据搜索关键词过滤行业
  if (searchKeyword.value.trim()) {
    industries = allIndustries.filter(industry => 
      industry.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  const dates = selectedDateRange.value === 'all' ? allDates : allDates.slice(-parseInt(selectedDateRange.value))
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
  
  const { dates, industries } = getFilteredData()
  
  // 如果有搜索关键词，显示趋势图
  if (searchKeyword.value.trim()) {
    showTrendChart(industries, dates)
  } else {
    showHeatmap(industries, dates)
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

// 监听日期范围、指标和搜索关键词变化
watch([selectedDateRange, sortMetric, searchKeyword], () => {
  if (chart) {
    updateChart()
  }
})

onMounted(async () => {
  await nextTick()
  initChart()
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