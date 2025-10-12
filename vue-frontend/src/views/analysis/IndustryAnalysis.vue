<template>
  <div class="industry-analysis">
    <!-- 筛选控制面板 -->
    <el-card class="filter-panel" shadow="hover">
      <div class="filter-row">
        <!-- 行业选择 -->
        <div class="filter-item">
          <label class="filter-label">选择行业：</label>
          <el-select
            v-model="selectedIndustry"
            placeholder="请选择行业"
            style="width: 200px"
            @change="handleIndustryChange"
          >
            <el-option
              v-for="industry in industryList"
              :key="industry.name"
              :label="industry.name"
              :value="industry.name"
            />
          </el-select>
        </div>

        <!-- 季度选择 -->
        <div class="filter-item">
          <label class="filter-label">选择季度：</label>
          <el-select
            v-model="selectedQuarter"
            placeholder="请选择季度"
            style="width: 150px"
            @change="handleQuarterChange"
          >
            <el-option
              v-for="quarter in quarterOptions"
              :key="quarter.value"
              :label="quarter.label"
              :value="quarter.value"
            />
          </el-select>
        </div>

        <!-- 指标选择 -->
        <div class="filter-item">
          <label class="filter-label">选择指标：</label>
          <el-select
            v-model="selectedIndicator"
            placeholder="请选择指标"
            style="width: 180px"
            @change="handleIndicatorChange"
          >
            <el-option
              v-for="indicator in indicatorOptions"
              :key="indicator.value"
              :label="indicator.label"
              :value="indicator.value"
            />
          </el-select>
        </div>

        <!-- 查询按钮 -->
        <div class="filter-item">
          <el-button
            type="primary"
            :loading="loading"
            @click="fetchAnalysisData"
          >
            查询分析
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 图表展示区域 -->
    <el-card class="chart-panel" shadow="hover" v-if="chartData.length > 0">
      <div class="chart-header">
        <h3>{{ chartTitle }}</h3>
        <div class="chart-info">
          <span class="info-item">行业: {{ selectedIndustryName }}</span>
          <span class="info-item">季度: {{ selectedQuarterName }}</span>
          <span class="info-item">指标: {{ selectedIndicatorName }}</span>
        </div>
      </div>
      
      <div class="chart-container">
        <div ref="chartRef" class="chart" style="width: 100%; height: 500px;"></div>
      </div>
    </el-card>



    <!-- 空状态 -->
    <el-empty
      v-if="!loading && chartData.length === 0"
      description="请选择筛选条件并点击查询分析按钮"
      :image-size="200"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-loading
        element-loading-text="正在加载数据..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 行业分析页面组件
 * 功能：
 * 1. 提供行业选择、季度选择、指标选择的交互界面
 * 2. 基于用户选择调用API获取数据
 * 3. 使用ECharts展示指标趋势图
 * 4. 提供详细数据表格展示
 * 5. 支持数据导出功能
 * 
 * 参数：无
 * 返回值：无
 * 事件：无
 */

import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { 
  getIndustrySectors, 
  getIndustryPerformanceReports,
  type IndustrySector,
  type IndustryPerformanceReport,
  ReportType
} from '../../services/industryAnalysisApi'

// 响应式数据
const loading = ref(false)
const chartRef = ref<HTMLDivElement>()
const chartInstance = ref<echarts.ECharts>()

// 筛选条件
const selectedIndustry = ref<string>()
const selectedQuarter = ref<string>('')
const selectedIndicator = ref<string>('revenue')

// 基础数据
const industryList = ref<IndustrySector[]>([])
const chartData = ref<any[]>([])

// 选项配置
// - `annual`: 年报，筛选报告期以1231结尾的数据
// - `semi_annual`: 中报，筛选报告期以0630结尾的数据  
// - `q1`: 一季报，筛选报告期以0331结尾的数据
// - `q3`: 三季报，筛选报告期以0930结尾的数据
// - `quarterly`: 季报，包含一季报和三季报数据（向后兼容）
const quarterOptions = ref([
  { label: '年报', value: 'annual' },
  { label: '中报', value: 'semi_annual' },
  { label: '一季报', value: 'q1' },
  { label: '三季报', value: 'q3' },
  { label: '季报', value: 'quarterly' },
])

const indicatorOptions = ref([
  { label: '营业收入', value: 'revenue' },
  { label: '净利润', value: 'net_profit' },
  { label: '营业收入同比增长率', value: 'revenue_growth' },
  { label: '净利润同比增长率', value: 'profit_growth' },
  { label: '毛利率', value: 'gross_margin' },
  { label: '净利率', value: 'net_margin' },
  { label: 'ROE', value: 'roe' },
  { label: 'ROA', value: 'roa' },
])

// 计算属性
const selectedIndustryName = computed(() => {
  if (selectedIndustry.value === 'all') return '全部行业'
  const industry = industryList.value.find(item => item.name === selectedIndustry.value)
  return industry?.name || '未知行业'
})

const selectedQuarterName = computed(() => {
  const quarter = quarterOptions.value.find(item => item.value === selectedQuarter.value)
  return quarter?.label || '未选择'
})

const selectedIndicatorName = computed(() => {
  const indicator = indicatorOptions.value.find(item => item.value === selectedIndicator.value)
  return indicator?.label || '未选择'
})

const chartTitle = computed(() => {
  return `${selectedIndustryName.value} - ${selectedIndicatorName.value}趋势分析`
})

// 方法
/**
 * 初始化页面数据
 */
const initializeData = async () => {
  loading.value = true
  try {
    // 获取行业列表
    const response = await getIndustrySectors()
    console.log('获取行业列表响应:', response)
    industryList.value = response.sectors
    console.log('行业列表:', industryList.value)
    
    // 设置默认值
    if (quarterOptions.value.length > 0) {
      selectedQuarter.value = quarterOptions.value[0].value
    }
    
    ElMessage.success('页面初始化完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

/**
 * 获取分析数据
 * 根据选择的行业、季度和指标获取相应的数据
 */
const fetchAnalysisData = async () => {
  if (!selectedQuarter.value || !selectedIndicator.value) {
    ElMessage.warning('请选择季度和指标')
    return
  }

  loading.value = true
  
  try {
    const params: any = {
      report_type: selectedQuarter.value
    }

    // 如果选择了特定行业，添加行业参数
    if (selectedIndustry.value !== 'all') {
      params.industry = selectedIndustry.value
    }

    const response = await getIndustryPerformanceReports(params)
    
    // 处理数据
    processChartData(response.aggregated_reports)
    
    // 渲染图表
    await nextTick()
    renderChart()
    
    ElMessage.success('数据加载完成')
  } catch (error) {
    console.error('获取分析数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 处理图表数据
 * 根据选择的行业类型处理不同的图表数据格式
 * @param reports IndustryPerformanceReport[] 行业业绩快报数据数组
 */
const processChartData = async (reports: IndustryPerformanceReport[]) => {
  // 单个行业：显示该行业的历史趋势
  chartData.value = reports.map(report => ({
    quarter: report.report_date,
    value: getIndicatorValue(report, selectedIndicator.value),
    growth_rate: getGrowthRate(report, selectedIndicator.value)
  }))
}

/**
 * 格式化季度名称
 * @param quarter 季度代码
 * @returns 格式化后的季度名称
 */
const formatQuarterName = (quarter: string): string => {
  const quarterMap: { [key: string]: string } = {
    'q1': 'Q1',
    'semi_annual': '中报', 
    'q3': 'Q3',
    'annual': '年报'
  }
  return quarterMap[quarter] || quarter
}

/**
 * 获取季度排序顺序
 * @param quarter 季度名称
 * @returns 排序数字
 */
const getQuarterOrder = (quarter: string): number => {
  const orderMap: { [key: string]: number } = {
    'Q1': 1,
    '中报': 2,
    'Q3': 3, 
    '年报': 4
  }
  return orderMap[quarter] || 0
}





/**
 * 获取指标值
 * 根据选择的指标从IndustryPerformanceReport中获取对应的数值
 * @param report IndustryPerformanceReport 行业业绩快报数据
 * @param indicator string 指标类型
 * @returns number 指标值
 */
const getIndicatorValue = (report: IndustryPerformanceReport, indicator: string): number => {
  const mapping: Record<string, keyof IndustryPerformanceReport> = {
    'revenue': 'total_operating_revenue',
    'net_profit': 'total_net_profit',
    'revenue_growth': 'avg_operating_revenue_growth_rate',
    'profit_growth': 'avg_net_profit_growth_rate',
    'gross_margin': 'avg_gross_profit_margin',
    'net_margin': 'avg_gross_profit_margin', // 使用毛利率作为净利率的替代
    'roe': 'avg_roe',
    'roa': 'avg_roe', // 使用ROE作为ROA的替代
    'eps': 'avg_earnings_per_share', // 每股收益
    'bvps': 'avg_net_assets_per_share', // 每股净资产
    'ocfps': 'avg_operating_cash_flow_per_share' // 每股经营现金流
  }
  
  const key = mapping[indicator]
  return key ? (report[key] as number) || 0 : 0
}

/**
 * 获取增长率
 * 根据选择的指标获取对应的增长率数据
 * @param report IndustryPerformanceReport 行业业绩快报数据
 * @param indicator string 指标类型
 * @returns number 增长率值
 */
const getGrowthRate = (report: IndustryPerformanceReport, indicator: string): number => {
  const growthMapping: Record<string, keyof IndustryPerformanceReport> = {
    'revenue': 'avg_operating_revenue_growth_rate',
    'net_profit': 'avg_net_profit_growth_rate',
    'revenue_growth': 'avg_operating_revenue_growth_rate',
    'profit_growth': 'avg_net_profit_growth_rate'
  }
  
  const key = growthMapping[indicator]
  return key ? (report[key] as number) || 0 : 0
}

/**
 * 渲染图表
 * 根据选择的行业类型渲染不同类型的图表
 */
const renderChart = () => {
  if (!chartRef.value || chartData.value.length === 0) return

  // 销毁现有图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  // 创建新的图表实例
  chartInstance.value = echarts.init(chartRef.value)

  let option: echarts.EChartsOption

  if (selectedIndustry.value === 'all') {
    // 检查数据格式，判断是趋势图还是柱状图
    const hasMultipleDataPoints = chartData.value.length > 0 && chartData.value[0].data
    
    if (hasMultipleDataPoints) {
      // 多行业趋势对比图
      const quarters = [...new Set(
        chartData.value.flatMap(item => item.data.map((d: any) => d.quarter))
      )].sort((a, b) => getQuarterOrder(a) - getQuarterOrder(b))
      
      const colors = [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
        '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
      ]
      
      option = {
        title: {
          text: chartTitle.value,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: chartData.value.map(item => item.name),
          top: '10%',
          type: 'scroll'
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: quarters,
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          name: selectedIndicatorName.value,
          nameTextStyle: {
            fontSize: 12
          }
        },
        series: chartData.value.map((item, index) => ({
          name: item.name,
          type: 'line',
          data: quarters.map(quarter => {
            const dataPoint = item.data.find((d: any) => d.quarter === quarter)
            return dataPoint ? dataPoint.value : null
          }),
          smooth: true,
          connectNulls: false,
          itemStyle: {
            color: colors[index % colors.length]
          },
          lineStyle: {
            color: colors[index % colors.length],
            width: 2
          },
          symbol: 'circle',
          symbolSize: 6
        }))
      }
    } else {
      // 柱状图显示所有行业对比（降级处理）
      option = {
        title: {
          text: chartTitle.value,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: chartData.value.map(item => item.name),
          axisLabel: {
            rotate: 45,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: selectedIndicatorName.value
        },
        series: [{
          name: selectedIndicatorName.value,
          type: 'bar',
          data: chartData.value.map(item => item.value),
          itemStyle: {
            color: '#1890ff'
          }
        }]
      }
    }
  } else {
    // 折线图显示单个行业趋势
    option = {
      title: {
        text: chartTitle.value,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: chartData.value.map(item => item.quarter)
      },
      yAxis: {
        type: 'value',
        name: selectedIndicatorName.value
      },
      series: [{
        name: selectedIndicatorName.value,
        type: 'line',
        data: chartData.value.map(item => item.value),
        smooth: true,
        itemStyle: {
          color: '#1890ff'
        },
        lineStyle: {
          color: '#1890ff'
        }
      }]
    }
  }

  chartInstance.value.setOption(option)
}

/**
 * 事件处理
 */
const handleIndustryChange = () => {
  chartData.value = []
}

const handleQuarterChange = () => {
  chartData.value = []
}

const handleIndicatorChange = () => {
  chartData.value = []
}


// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.industry-analysis {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.filter-panel {
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.chart-panel {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.chart-info {
  display: flex;
  gap: 16px;
}

.info-item {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.chart-container {
  width: 100%;
}



.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .industry-analysis {
    padding: 16px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .chart-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>