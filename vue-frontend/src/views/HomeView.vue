<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="welcome-card">
          <template #header>
            <span>欢迎使用股票分析系统</span>
          </template>
          <div class="welcome-content">
            <h2>平台功能迭代</h2>
            <p>查看平台最新的功能更新和版本发布历史，了解系统的持续改进和优化。</p>
            
            <div class="feature-updates-list">
              <div 
                v-for="update in sortedFeatureUpdates" 
                :key="update.id" 
                class="update-item"
              >
                <div class="update-header">
                  <div class="update-meta">
                    <span class="update-date">{{ update.date }}</span>
                    <el-tag size="small" type="info" class="version-tag">{{ update.version }}</el-tag>
                    <el-tag 
                      size="small" 
                      :type="getStatusTagType(update.status)"
                      class="status-tag"
                    >
                      {{ getStatusText(update.status) }}
                    </el-tag>
                  </div>
                  <el-icon 
                    :size="20" 
                    :color="getTypeColor(update.type)"
                    class="type-icon"
                  >
                    <component :is="getTypeIcon(update.type)" />
                  </el-icon>
                </div>
                <div class="update-content">
                  <h3 class="update-title">{{ update.title }}</h3>
                  <p class="update-description">{{ update.description }}</p>
                </div>
              </div>
            </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Refresh, Tools, Document, InfoFilled } from '@element-plus/icons-vue'
import { featureUpdates, recentNews } from '@/services/homeView'
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



// 页面导航 - 保留原有功能但暂时不使用
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



/**
 * 按日期排序的功能迭代列表（从最新到最旧）
 * @returns 排序后的功能迭代列表
 */
const sortedFeatureUpdates = computed(() => {
  return [...featureUpdates.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

/**
 * 获取状态标签类型
 * @param status 状态值
 * @returns Element Plus 标签类型
 */
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'latest':
      return 'danger'
    case 'stable':
      return 'success'
    default:
      return 'info'
  }
}

/**
 * 获取状态标签文本
 * @param status 状态值
 * @returns 状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'latest':
      return '最新'
    case 'stable':
      return '稳定'
    default:
      return '普通'
  }
}

/**
 * 获取更新类型图标
 * @param type 更新类型
 * @returns 图标名称
 */
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return 'Plus'
    case 'update':
      return 'Refresh'
    case 'tool':
      return 'Tools'
    case 'guide':
      return 'Document'
    default:
      return 'InfoFilled'
  }
}

/**
 * 获取更新类型颜色
 * @param type 更新类型
 * @returns 颜色值
 */
const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return '#67C23A'
    case 'update':
      return '#409EFF'
    case 'tool':
      return '#E6A23C'
    case 'guide':
      return '#909399'
    default:
      return '#909399'
  }
}
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

/* 功能迭代列表样式 */
.feature-updates-list {
  margin-top: 30px;
}

.update-item {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.update-item:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.update-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-date {
  color: #909399;
  font-size: 14px;
  font-weight: 500;
}

.version-tag {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.status-tag {
  margin-left: 4px;
}

.type-icon {
  flex-shrink: 0;
}

.update-content {
  padding-left: 4px;
}

.update-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.update-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
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
