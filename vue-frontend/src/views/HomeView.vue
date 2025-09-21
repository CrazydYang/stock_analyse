<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="welcome-card">
          <template #header>
            <span>欢迎使用股票分析系统</span>
          </template>
          <div class="welcome-content">
            <h2>欢迎来到股票分析系统</h2>
            <p>这是一个专业的股票分析平台，提供技术分析、基本面分析和投资组合管理功能。</p>
            
            <el-row :gutter="20" class="feature-cards">
              <el-col :span="8">
                <el-card class="feature-card" @click="goToStockPicker">
                  <el-icon size="48" color="#722ed1"><MagicStick /></el-icon>
                  <h3>智能选股</h3>
                  <p>基于市场数据的智能股票筛选</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="goToAnalysis">
                  <el-icon size="48" color="#409EFF"><TrendCharts /></el-icon>
                  <h3>技术分析</h3>
                  <p>K线图表与技术指标分析</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="goToFundamental">
                  <el-icon size="48" color="#67C23A"><Document /></el-icon>
                  <h3>基本面分析</h3>
                  <p>财务报表与估值分析</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="goToMarketOverview">
                  <el-icon size="48" color="#E6A23C"><DataAnalysis /></el-icon>
                  <h3>市场概况</h3>
                  <p>大盘数据与市场趋势分析</p>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="quick-stats">
          <template #header>
            <div class="card-header">
              <span>今日行情</span>
              <el-tag v-if="marketDate" size="small" type="info">{{ formatDate(marketDate) }}</el-tag>
            </div>
          </template>
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="4" animated />
          </div>
          <div v-else-if="error" class="error-message">
            <el-alert type="error" :title="error" :closable="false" />
          </div>
          <div v-else class="stats-content">
            <div v-for="index in marketIndices" :key="index.name" class="stat-item">
              <span class="stat-label">{{ index.name }}</span>
              <div class="stat-value-container">
                <span class="stat-value-number">{{ index.value.toFixed(2) }}</span>
                <span :class="['stat-value', index.changePercent >= 0 ? 'positive' : 'negative']">
                  {{ index.changePercent >= 0 ? '+' : '' }}{{ index.changePercent.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- <el-card class="market-overview mt-20" v-if="!loading && !error && marketOverview.length > 0">
          <template #header>
            <span>市场概况</span>
          </template>
          <div class="market-data">
            <div v-for="item in marketOverview" :key="item.index_name" class="market-item">
              <span class="market-label">{{ item.index_name }}</span>
              <span :class="['market-value', isIndexItem(item.index_name) ? (item.volume >= 0 ? 'positive' : 'negative') : '']">
                {{ formatMarketValue(item.volume) }}
              </span>
            </div>
          </div>
        </el-card> -->
        
        <el-card class="recent-news mt-20">
          <template #header>
            <span>最新资讯</span>
          </template>
          <div class="news-list">
            <div v-for="news in recentNews" :key="news.id" class="news-item">
              <h4>{{ news.title }}</h4>
              <p>{{ news.summary }}</p>
              <span class="news-time">{{ news.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TrendCharts, Document, DataAnalysis, MagicStick } from '@element-plus/icons-vue'
import { getMarketIndices, getMarketDailyOverview, type MarketIndexChange, type MarketIndexData } from '@/services/marketService'

const router = useRouter()

// 市场数据
const marketIndices = ref<MarketIndexChange[]>([])
const marketOverview = ref<MarketIndexData[]>([])
const marketDate = ref<string>('')
const loading = ref(true)
const error = ref<string | null>(null)

// 获取市场数据
const fetchMarketData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 获取市场指数数据
    const indicesData = await getMarketIndices()
    marketIndices.value = indicesData
    
    // 获取市场每日概况
    const marketData = await getMarketDailyOverview()
    
    if (marketData.date) {
      marketDate.value = marketData.date
      marketOverview.value = [
        marketData.shanghai,
        marketData.shenzhen,
        marketData.hs300,
        marketData.sz50
      ]
      
    }

  } catch (err) {
    console.error('获取市场数据出错:', err)
    error.value = '获取市场数据出错，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 格式化日期 YYYYMMDD -> YYYY-MM-DD
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return dateStr
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
}

// 格式化市场数据值
const formatMarketValue = (value: number): string => {
  if (value === null || value === undefined) return '-'
  
  // 根据数值大小选择合适的单位
  if (value >= 10000000000000) {
    return `${(value / 100000000000).toFixed(2)}万亿`
  } else if (value >= 1) {
    return `${(value / 100000000).toFixed(2)}亿`
  } else {
    return `${(value * 100).toFixed(2)}%`
  }
}

// 判断是否为指数项目
const isIndexItem = (name: string): boolean => {
  const indexNames = ['上证指数', '深证成指', '沪深300', '上证50']
  return indexNames.includes(name)
}

// 新闻数据
const recentNews = ref([
  {
    id: 1,
    title: '央行宣布降准0.5个百分点',
    summary: '央行今日宣布下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元。',
    time: '2小时前'
  },
  {
    id: 2,
    title: 'A股成交额突破万亿',
    summary: '今日A股市场成交额突破1万亿元，创近期新高，市场情绪明显回暖。',
    time: '3小时前'
  },
  {
    id: 3,
    title: '科技股集体上涨',
    summary: '半导体、人工智能等科技板块今日集体上涨，多股涨停。',
    time: '4小时前'
  }
])

// 页面导航
const goToStockPicker = () => {
  router.push('/stock-picker')
}

const goToAnalysis = () => {
  router.push('/analysis/technical')
}

const goToFundamental = () => {
  router.push('/analysis/fundamental')
}

const goToMarketOverview = () => {
  router.push('/market-overview')
}

// 页面加载时获取数据
onMounted(() => {
  fetchMarketData()
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-content h2 {
  color: #303133;
  margin-bottom: 10px;
}

.welcome-content p {
  color: #606266;
  margin-bottom: 20px;
}

.feature-cards {
  margin-top: 30px;
}

.feature-card {
  text-align: center;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin: 15px 0 10px 0;
  color: #303133;
}

.feature-card p {
  color: #909399;
  font-size: 14px;
}

.quick-stats {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px 0;
}

.error-message {
  padding: 10px 0;
}

.stats-content {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: bold;
  color: #606266;
}

.stat-value-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value-number {
  font-weight: bold;
  color: #303133;
  font-size: 16px;
}

.stat-value {
  font-weight: bold;
  font-size: 14px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

.market-overview {
  margin-bottom: 20px;
}

.market-data {
  padding: 10px 0;
}

.market-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.market-item:last-child {
  border-bottom: none;
}

.market-label {
  color: #606266;
}

.market-value {
  font-weight: bold;
  color: #303133;
}

.recent-news {
  margin-bottom: 20px;
}

.news-list {
  padding: 10px 0;
}

.news-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.news-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.news-item h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.news-item p {
  margin: 0 0 5px 0;
  color: #606266;
  font-size: 14px;
}

.news-time {
  color: #909399;
  font-size: 12px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
