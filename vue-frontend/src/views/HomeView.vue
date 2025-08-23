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
                  <p>AI驱动的智能股票筛选和推荐</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="goToAnalysis">
                  <el-icon size="48" color="#409EFF"><TrendCharts /></el-icon>
                  <h3>技术分析</h3>
                  <p>专业的技术指标和图表分析</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="goToFundamental">
                  <el-icon size="48" color="#67C23A"><Document /></el-icon>
                  <h3>基本面分析</h3>
                  <p>深度的财务数据和分析</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="feature-card" @click="goToPortfolio">
                  <el-icon size="48" color="#E6A23C"><DataAnalysis /></el-icon>
                  <h3>投资组合</h3>
                  <p>智能的投资组合管理</p>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="quick-stats">
          <template #header>
            <span>今日行情</span>
          </template>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">上证指数</span>
              <span class="stat-value positive">+1.25%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">深证成指</span>
              <span class="stat-value positive">+0.89%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">创业板指</span>
              <span class="stat-value negative">-0.45%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">沪深300</span>
              <span class="stat-value positive">+0.78%</span>
            </div>
          </div>
        </el-card>
        
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TrendCharts, Document, DataAnalysis, MagicStick } from '@element-plus/icons-vue'

const router = useRouter()

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

const goToStockPicker = () => {
  router.push('/stock-picker')
}

const goToAnalysis = () => {
  router.push('/analysis/technical')
}

const goToFundamental = () => {
  router.push('/analysis/fundamental')
}

const goToPortfolio = () => {
  router.push('/portfolio')
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

.stats-content {
  padding: 20px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stat-label {
  font-weight: bold;
  color: #606266;
}

.stat-value {
  font-weight: bold;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
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
