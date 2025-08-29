<template>
  <div class="market-analysis" v-loading="loading" element-loading-text="正在加载大盘数据...">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-card shadow="hover">
        <div class="header-content">
          <div class="market-info">
            <h1 class="market-title">上证A股指数 大盘分析</h1>
            <p class="market-subtitle">实时行情与历史趋势分析</p>
          </div>
          <div class="header-actions">
            <el-button @click="refreshData" :loading="loading" :icon="Refresh" type="primary">刷新数据</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最新数据概览 -->
    <div class="latest-data-section" v-if="latestData">
      <el-card shadow="hover">
        <template #header>
          <h3>最新行情数据 ({{ latestData.date }})</h3>
        </template>
        <el-row :gutter="20" class="metrics-grid">
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value price" :class="{ 'up': latestData.涨跌幅 > 0, 'down': latestData.涨跌幅 < 0 }">
                {{ latestData.收盘.toFixed(2) }}
              </div>
              <div class="metric-label">收盘点位</div>
              <div class="metric-change" :class="{ 'up': latestData.涨跌幅 > 0, 'down': latestData.涨跌幅 < 0 }">
                {{ latestData.涨跌幅 > 0 ? '+' : '' }}{{ latestData.涨跌幅.toFixed(2) }}%
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.开盘.toFixed(2) }}</div>
              <div class="metric-label">开盘点位</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.最高.toFixed(2) }}</div>
              <div class="metric-label">最高点位</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.最低.toFixed(2) }}</div>
              <div class="metric-label">最低点位</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.振幅.toFixed(2) }}%</div>
              <div class="metric-label">振幅</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ formatVolume(latestData.成交量) }}</div>
              <div class="metric-label">成交量</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ formatAmount(latestData.成交额) }}</div>
              <div class="metric-label">成交额</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.换手率.toFixed(2) }}%</div>
              <div class="metric-label">换手率</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 趋势图表 -->
    <div class="charts-section" v-if="indexData.length > 0">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <h3>上证指数趋势分析</h3>
                <div class="chart-controls">
                  <el-select v-model="selectedMetrics" multiple placeholder="选择指标" style="width: 300px;">
                    <el-option label="收盘点位" value="收盘点位"></el-option>
                    <el-option label="开盘点位" value="开盘点位"></el-option>
                    <el-option label="最高点位" value="最高点位"></el-option>
                    <el-option label="最低点位" value="最低点位"></el-option>
                    <el-option label="涨跌幅" value="涨跌幅"></el-option>
                    <el-option label="成交量" value="成交量"></el-option>
                    <el-option label="成交额" value="成交额"></el-option>
                  </el-select>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <TrendChart 
                :data="chartData" 
                date-field="date"
                :yFields="selectedMetricsConfig"
                :defaultSelectedFields="selectedMetrics"
                height="500px"
                title="上证指数趋势"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getShIndexHistory, formatIndexData, type IndexHistData } from '../../services/marketApi'
import TrendChart from '../../components/TrendChart.vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 数据状态
const loading = ref(false)
const indexData = ref<IndexHistData[]>([])
const latestData = computed(() => indexData.value.length > 0 ? indexData.value[indexData.value.length-1] : null)

// 图表配置
const selectedMetrics = ref(['收盘点位', '成交量'])
const selectedMetricsConfig = computed(() => {
  return selectedMetrics.value.map(metric => {
    switch (metric) {
      case '收盘点位':
        return { key: '收盘点位', label: '收盘点位', color: '#409EFF' }
      case '开盘点位':
        return { key: '开盘点位', label: '开盘点位', color: '#67C23A' }
      case '最高点位':
        return { key: '最高点位', label: '最高点位', color: '#E6A23C' }  
      case '最低点位':
        return { key: '最低点位', label: '最低点位', color: '#F56C6C' }
      case '涨跌幅':
        return { key: '涨跌幅', label: '涨跌幅', color: '#909399' }
      case '成交量':
        return { key: '成交量', label: '成交量', color: '#9370DB' }
      case '成交额':
        return { key: '成交额', label: '成交额', color: '#FF6347' } 
      default:
        return { key: metric, label: metric, color: '#409EFF' }
    }
  })
})

// 格式化后的图表数据
const chartData = computed(() => {
  return formatIndexData(indexData.value)
})

// 格式化成交量
function formatVolume(volume: number): string {
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿'
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万'
  } else {
    return volume.toString()
  }
}

// 格式化成交额
function formatAmount(amount: number): string {
  if (amount >= 100000000000) {
    return (amount / 1000000000000).toFixed(2) + '万亿'
  } else if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿'
  } else if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万'
  } else {
    return amount.toString()
  }
}

// 获取上证指数历史数据
async function fetchIndexData() {
  loading.value = true
  try {
    // 获取最近6个月的数据
    const endDate = new Date().toISOString().split('T')[0] // 今天
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6个月前
    
    const response = await getShIndexHistory(startDate, endDate)
    if (response.code === 200 && response.data) {
      indexData.value = response.data
    } else {
      ElMessage.error('获取上证指数数据失败: ' + response.message)
    }
  } catch (error) {
    console.error('获取上证指数数据出错:', error)
    ElMessage.error('获取上证指数数据出错')
  } finally {
    loading.value = false
  }
}

// 刷新数据
function refreshData() {
  fetchIndexData()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIndexData()
})
</script>

<style scoped>
.market-analysis {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.market-subtitle {
  margin: 5px 0 0;
  color: #909399;
}

.latest-data-section {
  margin-bottom: 20px;
}

.metrics-grid {
  margin-top: 10px;
}

.metric-card {
  padding: 15px;
  text-align: center;
  border-radius: 4px;
  background-color: #f5f7fa;
  height: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
}

.metric-change {
  font-size: 14px;
  margin-top: 5px;
}

.price.up, .metric-change.up {
  color: #f56c6c;
}

.price.down, .metric-change.down {
  color: #67c23a;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 500px;
  margin-top: 20px;
}
</style>