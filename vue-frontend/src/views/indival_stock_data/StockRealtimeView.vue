<template>
  <div class="stock-realtime-view">
    <el-card class="page-header">
      <template #header>
        <div class="header-content">
          <div class="stock-info">
            <h2>{{ stockInfo.name }} <span class="stock-code">{{ stockInfo.code }}</span></h2>
            <p v-if="stockInfo.industry">{{ stockInfo.industry }} | {{ stockInfo.exchange }}</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="ArrowLeft" @click="goBack">返回</el-button>
            <el-button type="success" :icon="Refresh" @click="fetchRealtimeData" :loading="loading">
              刷新数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 股票选择器 -->
      <div class="stock-selector">
        <el-form :inline="true">
          <el-form-item label="选择股票">
            <el-select 
              v-model="selectedStock" 
              filterable 
              remote 
              placeholder="请输入股票代码或名称" 
              :remote-method="searchStocks"
              :loading="searchLoading"
              @change="handleStockChange"
            >
              <el-option 
                v-for="item in stockOptions" 
                :key="item.code" 
                :label="`${item.name} (${item.code})`" 
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 实时行情数据 -->
      <div v-if="!loading && realtimeData" class="realtime-data">
        <div class="price-section">
          <div class="current-price" :class="getPriceClass(realtimeData.change_percent)">
            {{ realtimeData.latest_price }}
          </div>
          <div class="price-change">
            <div :class="getPriceClass(realtimeData.change_percent)">
              {{ realtimeData.change_amount > 0 ? '+' : '' }}{{ realtimeData.change_amount }}
            </div>
            <div :class="getPriceClass(realtimeData.change_percent)">
              {{ realtimeData.change_percent > 0 ? '+' : '' }}{{ realtimeData.change_percent }}%
            </div>
          </div>
        </div>

        <el-divider />

        <!-- 交易数据 -->
        <div class="trading-data">
          <el-row :gutter="20">
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">今开</div>
                <div class="value" :class="getPriceClass(realtimeData.open_price - realtimeData.close_price)">
                  {{ realtimeData.open_price }}
                </div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">最高</div>
                <div class="value" :class="getPriceClass(realtimeData.high - realtimeData.close_price)">
                  {{ realtimeData.high }}
                </div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">最低</div>
                <div class="value" :class="getPriceClass(realtimeData.low - realtimeData.close_price)">
                  {{ realtimeData.low }}
                </div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">昨收</div>
                <div class="value">{{ realtimeData.close_price }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">成交量</div>
                <div class="value">{{ formatVolume(realtimeData.volume) }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">成交额</div>
                <div class="value">{{ formatAmount(realtimeData.amount) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <!-- 估值指标 -->
        <div class="valuation-data">
          <el-row :gutter="20">
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">市盈率(TTM)</div>
                <div class="value">{{ stockInfo.pe_ratio ? stockInfo.pe_ratio.toFixed(2) : '-' }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">市净率</div>
                <div class="value">{{ stockInfo.pb_ratio ? stockInfo.pb_ratio.toFixed(2) : '-' }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">市值</div>
                <div class="value">{{ formatMarketCap(stockInfo.total_market_cap) }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">流通市值</div>
                <div class="value">{{ formatMarketCap(stockInfo.circulating_market_cap) }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">换手率</div>
                <div class="value">{{ realtimeData.turnover_rate ? realtimeData.turnover_rate.toFixed(2) + '%' : '-' }}</div>
              </div>
            </el-col>
            <el-col :span="8" :xs="12">
              <div class="data-item">
                <div class="label">振幅</div>
                <div class="value">{{ realtimeData.amplitude ? realtimeData.amplitude.toFixed(2) + '%' : '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <!-- 更新时间 -->
        <div class="update-time">
          <span>数据更新时间: {{ formatDateTime(realtimeData.timestamp) }}</span>
          <el-tag size="small" type="info">{{ getMarketStatusFromTime() }}</el-tag>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-else-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated>
          <template #template>
            <div class="loading-header">
              <el-skeleton-item variant="h1" style="width: 50%" />
            </div>
            <div class="loading-price">
              <el-skeleton-item variant="text" style="width: 30%" />
              <el-skeleton-item variant="text" style="width: 20%" />
            </div>
            <el-divider />
            <div class="loading-grid">
              <el-row :gutter="20">
                <el-col :span="8" v-for="i in 6" :key="i">
                  <el-skeleton-item variant="text" style="width: 60%" />
                  <el-skeleton-item variant="text" style="width: 40%" />
                </el-col>
              </el-row>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 无数据 -->
      <div v-else class="empty-container">
        <el-empty description="暂无实时行情数据" :image-size="200">
          <template #image>
            <el-icon style="font-size: 80px; color: #909399;">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M128 896V128h768v768H128zm291.712-327.296 128 102.4 180.16-201.792-47.744-42.624-139.84 156.608-128-102.4-180.16 201.792 47.744 42.624 139.84-156.608z"></path>
              </svg>
            </el-icon>
          </template>
          <div class="empty-text">可能是网络问题或者股票代码不存在</div>
          <div class="empty-actions">
            <el-button type="primary" @click="fetchRealtimeData" :icon="Refresh">刷新数据</el-button>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/**
 * 股票实时行情页面
 * 
 * 功能：
 * 1. 展示单只股票的实时行情数据
 * 2. 支持股票切换
 * 3. 支持数据刷新
 * 4. 显示价格、交易数据和估值指标
 */
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getStockList, getStockRealtime, getStockInfo } from '@/services/individualStockApi'
import type { StockRealtime, StockInfo } from '@/services/individualStockApi'

// 路由
const route = useRoute()
const router = useRouter()
const stockCode = ref(route.params.code as string || '')

// 数据加载状态
const loading = ref(false)
const searchLoading = ref(false)

// 股票信息
const stockInfo = reactive({
  code: '',
  name: '',
  exchange: '', // 自定义字段，API中可能不存在
  industry: '',
  total_market_cap: 0,
  circulating_market_cap: 0,
  pe_ratio: 0,
  pb_ratio: 0,
  list_date: ''
})

// 实时行情数据
const realtimeData = ref<StockRealtime | null>(null)

// 股票选择
const selectedStock = ref('')
const stockOptions = ref<StockInfo[]>([])

// 方法：返回上一页
const goBack = () => {
  router.back()
}

// 方法：获取实时行情数据
const fetchRealtimeData = async () => {
  if (!stockCode.value) return
  
  loading.value = true
  try {
    // 获取实时行情数据
    const realtimeResponse = await getStockRealtime(stockCode.value)
    realtimeData.value = realtimeResponse
    
    // 更新股票基本信息
    if (realtimeData.value) {
      stockInfo.code = stockCode.value
      stockInfo.name = realtimeData.value.stock_name || ''
      
      // 获取股票详细信息
      try {
        const infoResponse = await getStockInfo(stockCode.value) as StockInfo
        stockInfo.industry = infoResponse.industry || ''
        // 交易所信息可能需要从其他地方获取或自定义
        stockInfo.exchange = ''
        stockInfo.total_market_cap = infoResponse.total_market_cap || 0
        stockInfo.circulating_market_cap = infoResponse.circulating_market_cap || 0
        stockInfo.pe_ratio = infoResponse.pe_ratio || 0
        stockInfo.pb_ratio = infoResponse.pb_ratio || 0
        stockInfo.list_date = infoResponse.list_date || ''
      } catch (infoError) {
        console.error('获取股票详细信息失败:', infoError)
      }
    }
    
    ElMessage.success('实时行情数据加载成功')
  } catch (error) {
    console.error('获取实时行情数据失败:', error)
    ElMessage.error('获取实时行情数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 方法：搜索股票
const searchStocks = async (query: string) => {
  if (query.length < 2) return
  
  searchLoading.value = true
  try {
    const response = await getStockList()
    const allStocks = response.data
    
    // 过滤股票
    stockOptions.value = allStocks.filter(stock => 
      stock.code.includes(query) || 
      stock.name.includes(query)
    ).slice(0, 20) // 限制结果数量
  } catch (error) {
    console.error('搜索股票失败:', error)
  } finally {
    searchLoading.value = false
  }
}

// 方法：股票切换
const handleStockChange = (value: string) => {
  stockCode.value = value
  router.push(`/stock-realtime/${value}`)
}

// 方法：获取价格颜色类
const getPriceClass = (change: number) => {
  if (change > 0) return 'price-up'
  if (change < 0) return 'price-down'
  return 'price-unchanged'
}

// 方法：格式化成交量
const formatVolume = (volume: number | null | undefined): string => {
  if (volume === null || volume === undefined) return '-'
  
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿手'
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万手'
  } else {
    return volume.toString() + '手'
  }
}

// 方法：格式化成交额
const formatAmount = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-'
  
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿'
  } else if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万'
  } else {
    return amount.toString()
  }
}

// 方法：格式化市值
const formatMarketCap = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  
  if (value >= 100000000000) {
    return (value / 100000000000).toFixed(2) + '千亿'
  } else if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿'
  } else if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万'
  } else {
    return value.toString()
  }
}

// 方法：格式化日期时间
const formatDateTime = (timestamp: string | number | null | undefined): string => {
  if (!timestamp) return '-'
  
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 方法：获取市场状态
const getMarketStatus = (status: string | null | undefined): string => {
  if (!status) return '未知状态'
  
  const statusMap: Record<string, string> = {
    'open': '交易中',
    'closed': '已收盘',
    'pre_market': '盘前',
    'after_hours': '盘后',
    'suspended': '停牌'
  }
  
  return statusMap[status] || status
}

// 自定义市场状态
const getMarketStatusFromTime = (): string => {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const day = now.getDay()
  
  // 周末
  if (day === 0 || day === 6) return '已收盘'
  
  // 交易时间：9:30-11:30, 13:00-15:00
  if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) ||
      (hour >= 13 && hour < 15)) {
    return '交易中'
  } else if (hour < 9 || (hour === 9 && minute < 30)) {
    return '盘前'
  } else {
    return '已收盘'
  }
}

// 监听路由参数变化
watch(
  () => route.params.code,
  (newCode) => {
    if (newCode && typeof newCode === 'string') {
      stockCode.value = newCode
      selectedStock.value = newCode
      fetchRealtimeData()
    }
  }
)

// 组件挂载
onMounted(() => {
  if (stockCode.value) {
    selectedStock.value = stockCode.value
    fetchRealtimeData()
  }
})
</script>

<style scoped>
.stock-realtime-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.stock-info h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.stock-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.stock-code {
  font-size: 16px;
  color: #909399;
  margin-left: 8px;
}

.stock-selector {
  margin-bottom: 20px;
}

.realtime-data {
  margin-top: 20px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.current-price {
  font-size: 36px;
  font-weight: 700;
}

.price-change {
  font-size: 18px;
  font-weight: 600;
}

.price-up {
  color: #f56c6c; /* 红色表示上涨 */
}

.price-down {
  color: #67c23a; /* 绿色表示下跌 */
}

.price-unchanged {
  color: #909399;
}

.trading-data,
.valuation-data {
  margin: 20px 0;
}

.data-item {
  margin-bottom: 15px;
}

.data-item .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.data-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.update-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 14px;
  margin-top: 20px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.empty-text {
  color: #909399;
  font-size: 14px;
  margin: 10px 0 20px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.loading-header {
  margin-bottom: 20px;
}

.loading-price {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.loading-grid {
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stock-realtime-view {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  
  .current-price {
    font-size: 28px;
  }
  
  .price-change {
    font-size: 16px;
  }
}
</style>