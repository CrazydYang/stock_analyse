<template>
  <div class="industry-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button 
          type="default" 
          size="default"
          @click="goBack"
          class="back-button"
        >
          <template #icon>
            <span>←</span>
          </template>
          返回行业分析
        </el-button>
        <h1 class="page-title">{{ industryData?.industry }} - 行业详情</h1>
      </div>
    </div>



    <!-- 行业详情内容 -->
    <div v-if="industryData" class="detail-content">
      <!-- 统计信息卡片 -->
      <div class="stats-section">
        <el-row :gutter="20" class="stats-grid">
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">行业名称</div>
              <div class="stat-value">{{ industryData.industry }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">股票总数</div>
              <div class="stat-value">{{ industryData.count }}只</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">市场占比</div>
              <div class="stat-value">{{ calculatePercentage(industryData.count || 0) }}%</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">平均涨跌幅</div>
              <div class="stat-value" :class="{
                'positive': industryData.avgChangePercent > 0,
                'negative': industryData.avgChangePercent < 0,
                'neutral': industryData.avgChangePercent === 0
              }">{{ formatChangePercent(industryData.avgChangePercent) }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">平均PE</div>
              <div class="stat-value">{{ industryData.avgPeRatio ? industryData.avgPeRatio.toFixed(2) : 'N/A' }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">平均PB</div>
              <div class="stat-value">{{ industryData.avgPbRatio ? industryData.avgPbRatio.toFixed(2) : 'N/A' }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">60天涨跌幅</div>
              <div class="stat-value" :class="{
                'positive': industryData.avgChange60Day > 0,
                'negative': industryData.avgChange60Day < 0,
                'neutral': industryData.avgChange60Day === 0
              }">{{ formatChangePercent(industryData.avgChange60Day) }}</div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-label">年初至今涨跌幅</div>
              <div class="stat-value" :class="{
                'positive': industryData.avgChangeYtd > 0,
                'negative': industryData.avgChangeYtd < 0,
                'neutral': industryData.avgChangeYtd === 0
              }">{{ formatChangePercent(industryData.avgChangeYtd) }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 股票列表 -->
      <div class="stock-list-section">
        <div class="section-header">
          <h2>股票列表</h2>
          <div class="stock-count">共 {{ industryData.stocks?.length || 0 }} 只股票</div>
        </div>
        
        <div class="table-container">
          <el-table 
          :data="sortedStocks" 
          style="width: 100%"
          stripe
          border
          :loading="loading"
          empty-text="暂无股票数据"
        >
            <el-table-column prop="code" label="股票代码" min-width="100" sortable>
              <template #default="scope">
                <a 
                  :href="`https://xueqiu.com/S/SH${scope.row.code}`" 
                  target="_blank" 
                  class="stock-code stock-link"
                >
                  {{ scope.row.code }}
                </a>
              </template>
            </el-table-column>
            
            <el-table-column prop="name" label="股票名称" min-width="120" sortable>
              <template #default="scope">
                <span class="stock-name">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="total_market_cap" label="总市值" min-width="100" align="center" sortable>
              <template #default="scope">
                <span class="market-cap">{{ scope.row.total_market_cap?.toFixed(2) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="latest_price" label="最新价格" min-width="80" align="center" sortable>
              <template #default="scope">
                <span class="price">{{ scope.row.latest_price?.toFixed(2) || 'N/A' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="change_percent" label="涨跌幅" min-width="80" align="center" sortable>
              <template #default="scope">
                <span 
                  class="change-value" 
                  :class="{
                    'positive': scope.row.change_percent > 0,
                    'negative': scope.row.change_percent < 0,
                    'neutral': scope.row.change_percent === 0
                  }"
                >
                  {{ formatChangePercent(scope.row.change_percent) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="pe_ratio" label="市盈率" min-width="70" align="center" sortable>
              <template #default="scope">
                <span class="ratio">{{ scope.row.pe_ratio?.toFixed(2) || 'N/A' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="pb_ratio" label="市净率" min-width="70" align="center" sortable>
              <template #default="scope">
                <span class="ratio">{{ scope.row.pb_ratio?.toFixed(2) || 'N/A' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="change_60day" label="60天涨跌" min-width="80" align="center" sortable>
              <template #default="scope">
                <span 
                  class="change-value" 
                  :class="{
                    'positive': scope.row.change_60day > 0,
                    'negative': scope.row.change_60day < 0,
                    'neutral': scope.row.change_60day === 0
                  }"
                >
                  {{ formatChangePercent(scope.row.change_60day) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="change_ytd" label="年初至今" min-width="80" align="center" sortable>
              <template #default="scope">
                <span 
                  class="change-value" 
                  :class="{
                    'positive': scope.row.change_ytd > 0,
                    'negative': scope.row.change_ytd < 0,
                    'neutral': scope.row.change_ytd === 0
                  }"
                >
                  {{ formatChangePercent(scope.row.change_ytd) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <div class="error-message">未找到行业数据</div>
      <button class="retry-button" @click="goBack">返回行业分析</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchIndustryDetail, type Industry, type Stock } from '../../services/industryApi'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const industryData = ref<Industry | null>(null)
const stockSortBy = ref('')
const stockSortOrder = ref('desc')

// 排序后的股票列表
const sortedStocks = computed(() => {
  if (!industryData.value || !stockSortBy.value) {
    return industryData.value?.stocks || []
  }
  
  return [...industryData.value.stocks].sort((a, b) => {
    const field = stockSortBy.value as keyof Stock
    let aValue = a[field]
    let bValue = b[field]
    
    // 处理可能为undefined或null的值
    if (aValue === undefined || aValue === null) aValue = -Infinity
    if (bValue === undefined || bValue === null) bValue = -Infinity
    
    // 字符串类型特殊处理
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return stockSortOrder.value === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }
    
    // 数值类型处理
    return stockSortOrder.value === 'asc' 
      ? (aValue as number) - (bValue as number) 
      : (bValue as number) - (aValue as number)
  })
})

// 排序股票列表
const sortStocks = (field: string) => {
  if (stockSortBy.value === field) {
    // 如果已经按此字段排序，则切换排序顺序
    stockSortOrder.value = stockSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 如果是新的排序字段，设置为降序
    stockSortBy.value = field
    stockSortOrder.value = 'desc'
  }
}

// 格式化百分比
const formatChangePercent = (value: number | undefined) => {
  if (value === undefined || value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

// 计算百分比
const calculatePercentage = (count: number) => {
  // 这里可以根据实际需求计算市场占比
  return (count * 0.1).toFixed(2)
}

// 返回上一页
const goBack = () => {
  router.push('/industries')
}

// 获取行业数据
const fetchIndustryData = async () => {
  try {
    loading.value = true
    const industryName = decodeURIComponent(route.params.industry as string)
    console.log('industryName', industryName)
    
    if (!industryName) {
      throw new Error('未指定行业名称')
    }
    
    // 使用API服务获取行业详细数据
    const data = await fetchIndustryDetail(industryName)
    
    if (data) {
      industryData.value = data
    } else {
      throw new Error('未找到行业数据')
    }
  } catch (error) {
    console.error('获取行业数据失败:', error)
    industryData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchIndustryData()
})
</script>

<style scoped>
.industry-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 页面头部 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}



.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-message {
  color: #ff4d4f;
  font-size: 18px;
  margin-bottom: 16px;
}

.retry-button {
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background: #40a9ff;
}

/* 详情内容 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 统计信息 */
.stats-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .detail-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1200px) {
  .detail-stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.detail-item:hover {
  border-color: #d9d9d9;
  background: #f5f5f5;
}

.detail-item .label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 股票列表 */
.stock-list-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.stock-count {
  color: #666;
  font-size: 14px;
}

/* Element Plus 表格样式 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.stock-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #1890ff;
}

.stock-name {
  font-weight: 600;
  color: #1a1a1a;
}

.market-cap {
  font-weight: 600;
  color: #333;
}

.latest-price {
  font-weight: 600;
  color: #333;
}

.value-badge {
  font-weight: 600;
  color: #333;
}

/* 颜色样式 */
.positive {
  color: #ff4d4f; 
}

.negative {
  color: #52c41a;
}

.neutral {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .industry-detail {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .detail-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-container {
    margin: 0 -12px;
    border-radius: 0;
  }
}

@media (max-width: 480px) {
  .detail-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stock-list-section {
    padding: 16px;
  }
}
</style>