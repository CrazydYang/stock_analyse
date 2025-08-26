<template>
  <div class="trend-analysis-page">
    <div class="page-header">
      <h1>趋势分析</h1>
      <p>通用趋势图表组件演示</p>
    </div>
    
    <!-- 示例1: 股票价格趋势 -->
    <TrendChart
      title="股票价格趋势分析"
      :data="stockPriceData"
      date-field="date"
      :y-fields="stockPriceFields"
      :default-selected-fields="['close', 'volume']"
      height="500px"
    />
    
    <!-- 示例2: 财务指标趋势 -->
    <TrendChart
      title="财务指标趋势分析"
      :data="financialData"
      date-field="quarter"
      :y-fields="financialFields"
      :default-selected-fields="['revenue', 'profit']"
      height="450px"
    />
    
    <!-- 示例3: 市场指数趋势 -->
    <TrendChart
      title="市场指数趋势分析"
      :data="marketIndexData"
      date-field="date"
      :y-fields="marketIndexFields"
      :default-selected-fields="['shanghai_index']"
      height="400px"
    />
    
    <div class="usage-guide">
      <h2>组件使用说明</h2>
      <div class="guide-content">
        <h3>基本用法</h3>
        <pre><code>&lt;TrendChart
  title="图表标题"
  :data="chartData"
  date-field="date"
  :y-fields="yFieldsConfig"
  :default-selected-fields="['field1', 'field2']"
  height="500px"
/&gt;</code></pre>
        
        <h3>Props 说明</h3>
        <ul>
          <li><strong>title</strong>: 图表标题</li>
          <li><strong>data</strong>: 数据数组，每个元素包含日期和各种数值字段</li>
          <li><strong>dateField</strong>: 日期字段名，默认为 'date'</li>
          <li><strong>yFields</strong>: Y轴字段配置数组，包含 key、label、color 等</li>
          <li><strong>defaultSelectedFields</strong>: 默认选中的字段</li>
          <li><strong>height</strong>: 图表高度，默认为 '600px'</li>
        </ul>
        
        <h3>数据格式示例</h3>
        <pre><code>[
  {
    "date": "2024-01-01",
    "close": 3000.5,
    "volume": 1500000,
    "pe_ratio": 15.2
  },
  {
    "date": "2024-01-02",
    "close": 3010.8,
    "volume": 1600000,
    "pe_ratio": 15.3
  }
]</code></pre>
        
        <h3>Y轴字段配置示例</h3>
        <pre><code>[
  {
    key: 'close',
    label: '收盘价',
    color: '#1890ff',
    yAxisIndex: 0
  },
  {
    key: 'volume',
    label: '成交量',
    color: '#52c41a',
    yAxisIndex: 1
  }
]</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TrendChart from '@/components/TrendChart.vue'

// 股票价格数据示例
const stockPriceData = ref([
  { date: '2024-01-01', open: 2980.5, high: 3020.8, low: 2975.2, close: 3000.5, volume: 1500000, pe_ratio: 15.2 },
  { date: '2024-01-02', open: 3000.5, high: 3035.1, low: 2995.8, close: 3010.8, volume: 1600000, pe_ratio: 15.3 },
  { date: '2024-01-03', open: 3010.8, high: 3025.5, low: 2990.2, close: 2995.3, volume: 1400000, pe_ratio: 15.1 },
  { date: '2024-01-04', open: 2995.3, high: 3040.7, low: 2985.1, close: 3025.6, volume: 1700000, pe_ratio: 15.4 },
  { date: '2024-01-05', open: 3025.6, high: 3055.2, low: 3020.8, close: 3045.9, volume: 1800000, pe_ratio: 15.6 },
  { date: '2024-01-08', open: 3045.9, high: 3060.3, low: 3030.5, close: 3038.7, volume: 1650000, pe_ratio: 15.5 },
  { date: '2024-01-09', open: 3038.7, high: 3070.1, low: 3025.4, close: 3055.8, volume: 1750000, pe_ratio: 15.7 },
  { date: '2024-01-10', open: 3055.8, high: 3080.5, low: 3045.2, close: 3068.3, volume: 1900000, pe_ratio: 15.8 },
  { date: '2024-01-11', open: 3068.3, high: 3085.7, low: 3055.1, close: 3072.6, volume: 1850000, pe_ratio: 15.9 },
  { date: '2024-01-12', open: 3072.6, high: 3095.2, low: 3065.8, close: 3088.4, volume: 2000000, pe_ratio: 16.0 }
])

const stockPriceFields = ref([
  { key: 'open', label: '开盘价', color: '#1890ff', yAxisIndex: 0 },
  { key: 'high', label: '最高价', color: '#52c41a', yAxisIndex: 0 },
  { key: 'low', label: '最低价', color: '#faad14', yAxisIndex: 0 },
  { key: 'close', label: '收盘价', color: '#f5222d', yAxisIndex: 0 },
  { key: 'volume', label: '成交量', color: '#722ed1', yAxisIndex: 1 },
  { key: 'pe_ratio', label: 'PE比率', color: '#13c2c2', yAxisIndex: 1 }
])

// 财务指标数据示例
const financialData = ref([
  { quarter: '2023-Q1', revenue: 1200000, profit: 150000, debt: 800000, assets: 5000000 },
  { quarter: '2023-Q2', revenue: 1350000, profit: 180000, debt: 750000, assets: 5200000 },
  { quarter: '2023-Q3', revenue: 1450000, profit: 200000, debt: 700000, assets: 5400000 },
  { quarter: '2023-Q4', revenue: 1600000, profit: 240000, debt: 650000, assets: 5600000 },
  { quarter: '2024-Q1', revenue: 1750000, profit: 280000, debt: 600000, assets: 5800000 },
  { quarter: '2024-Q2', revenue: 1900000, profit: 320000, debt: 550000, assets: 6000000 },
  { quarter: '2024-Q3', revenue: 2050000, profit: 360000, debt: 500000, assets: 6200000 }
])

const financialFields = ref([
  { key: 'revenue', label: '营业收入', color: '#1890ff', yAxisIndex: 0 },
  { key: 'profit', label: '净利润', color: '#52c41a', yAxisIndex: 0 },
  { key: 'debt', label: '负债总额', color: '#f5222d', yAxisIndex: 0 },
  { key: 'assets', label: '资产总额', color: '#722ed1', yAxisIndex: 1 }
])

// 市场指数数据示例
const marketIndexData = ref([
  { date: '2024-01-01', shanghai_index: 3000.5, shenzhen_index: 1800.2, growth_index: 2200.8 },
  { date: '2024-01-02', shanghai_index: 3010.8, shenzhen_index: 1805.5, growth_index: 2210.3 },
  { date: '2024-01-03', shanghai_index: 2995.3, shenzhen_index: 1795.8, growth_index: 2195.7 },
  { date: '2024-01-04', shanghai_index: 3025.6, shenzhen_index: 1815.2, growth_index: 2225.4 },
  { date: '2024-01-05', shanghai_index: 3045.9, shenzhen_index: 1825.7, growth_index: 2240.1 },
  { date: '2024-01-08', shanghai_index: 3038.7, shenzhen_index: 1820.3, growth_index: 2235.6 },
  { date: '2024-01-09', shanghai_index: 3055.8, shenzhen_index: 1830.9, growth_index: 2250.2 },
  { date: '2024-01-10', shanghai_index: 3068.3, shenzhen_index: 1840.5, growth_index: 2265.8 }
])

const marketIndexFields = ref([
  { key: 'shanghai_index', label: '上证指数', color: '#1890ff', yAxisIndex: 0 },
  { key: 'shenzhen_index', label: '深证成指', color: '#52c41a', yAxisIndex: 0 },
  { key: 'growth_index', label: '创业板指', color: '#f5222d', yAxisIndex: 0 }
])
</script>

<style scoped>
.trend-analysis-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 28px;
}

.page-header p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.usage-guide {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 30px 0;
}

.usage-guide h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 24px;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 10px;
}

.usage-guide h3 {
  color: #555;
  margin: 20px 0 10px 0;
  font-size: 18px;
}

.usage-guide ul {
  margin: 10px 0;
  padding-left: 20px;
}

.usage-guide li {
  margin: 8px 0;
  line-height: 1.6;
}

.usage-guide pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  margin: 10px 0;
}

.usage-guide code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.guide-content {
  line-height: 1.6;
}
</style>