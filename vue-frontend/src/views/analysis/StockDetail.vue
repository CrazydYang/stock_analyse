<template>
  <div class="stock-detail" v-loading="loading" element-loading-text="正在加载股票详情...">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-card shadow="hover">
        <div class="header-content">
          <div class="stock-info">
            <h1 class="stock-title">{{ stockCode }} {{ stockName }} 股票详情分析</h1>
            <p class="stock-subtitle">实时估值数据与历史趋势分析</p>
          </div>
          <div class="header-actions">
            <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
            <el-button @click="refreshData" :loading="loading" :icon="Refresh" type="primary">刷新数据</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最新数据概览 -->
    <div class="latest-data-section" v-if="latestData">
      <el-card shadow="hover">
        <template #header>
          <h3>最新估值数据 ({{ latestData.date }})</h3>
        </template>
        <el-row :gutter="20" class="metrics-grid">
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value price" :class="{ 'up': latestData.当日涨跌幅 > 0, 'down': latestData.当日涨跌幅 < 0 }">
                ¥{{ latestData.当日收盘价.toFixed(2) }}
              </div>
              <div class="metric-label">当日收盘价</div>
              <div class="metric-change" :class="{ 'up': latestData.当日涨跌幅 > 0, 'down': latestData.当日涨跌幅 < 0 }">
                {{ latestData.当日涨跌幅 > 0 ? '+' : '' }}{{ latestData.当日涨跌幅.toFixed(2) }}%
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData['PE(TTM)'].toFixed(2) }}</div>
              <div class="metric-label">市盈率(TTM)</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData['PE(静)'].toFixed(2) }}</div>
              <div class="metric-label">市盈率(静)</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.市净率.toFixed(2) }}</div>
              <div class="metric-label">市净率</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData['PEG值'].toFixed(2) }}</div>
              <div class="metric-label">PEG值</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ formatMarketCap(latestData.总市值) }}</div>
              <div class="metric-label">总市值</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ formatMarketCap(latestData.流通市值) }}</div>
              <div class="metric-label">流通市值</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.市现率.toFixed(2) }}</div>
              <div class="metric-label">市现率</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="metric-card">
              <div class="metric-value">{{ latestData.市销率.toFixed(2) }}</div>
              <div class="metric-label">市销率</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 趋势图表 -->
    <div class="charts-section" v-if="stockValueData.length > 0">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <div class="chart-header">
                <h3>估值指标趋势分析</h3>
                <div class="chart-controls">
                  <el-select v-model="selectedMetrics" multiple placeholder="选择指标" style="width: 300px;">
                    <el-option label="PE(TTM)" value="PE(TTM)"></el-option>
                    <el-option label="PE(静)" value="PE(静)"></el-option>
                    <el-option label="市净率" value="市净率"></el-option>
                    <el-option label="PEG值" value="PEG值"></el-option>
                    <el-option label="市现率" value="市现率"></el-option>
                    <el-option label="市销率" value="市销率"></el-option>
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
                title="估值指标趋势"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 资金流向数据 -->
    <div class="fund-flow-section" v-if="stockFundFlowData.length > 0">
      <el-row :gutter="20">
        <!-- 最新资金流向数据卡片 -->
        <el-col :span="24" v-if="latestFundFlowData">
          <el-card shadow="hover" class="latest-fund-flow-card">
            <template #header>
              <h3>最新资金流向数据 ({{ latestFundFlowData.date }})</h3>
            </template>
            <el-row :gutter="20" class="metrics-grid">
              <el-col :xs="12" :sm="8" :md="6" :lg="4">
                <div class="metric-card">
                  <div class="metric-value" :class="{ 'positive': latestFundFlowData['主力净流入-净额'] > 0, 'negative': latestFundFlowData['主力净流入-净额'] < 0 }">
                    {{ (latestFundFlowData['主力净流入-净额'] / 100000000).toFixed(2) }}亿
                  </div>
                  <div class="metric-label">主力净流入</div>
                  <div class="metric-change" :class="{ 'positive': latestFundFlowData['主力净流入-净占比'] > 0, 'negative': latestFundFlowData['主力净流入-净占比'] < 0 }">
                    {{ latestFundFlowData['主力净流入-净占比'].toFixed(2) }}%
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6" :lg="4">
                <div class="metric-card">
                  <div class="metric-value" :class="{ 'positive': latestFundFlowData['超大单净流入-净额'] > 0, 'negative': latestFundFlowData['超大单净流入-净额'] < 0 }">
                    {{ (latestFundFlowData['超大单净流入-净额'] / 100000000).toFixed(2) }}亿
                  </div>
                  <div class="metric-label">超大单净流入</div>
                  <div class="metric-change" :class="{ 'positive': latestFundFlowData['超大单净流入-净占比'] > 0, 'negative': latestFundFlowData['超大单净流入-净占比'] < 0 }">
                    {{ latestFundFlowData['超大单净流入-净占比'].toFixed(2) }}%
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6" :lg="4">
                <div class="metric-card">
                  <div class="metric-value" :class="{ 'positive': latestFundFlowData['大单净流入-净额'] > 0, 'negative': latestFundFlowData['大单净流入-净额'] < 0 }">
                    {{ (latestFundFlowData['大单净流入-净额'] / 100000000).toFixed(2) }}亿
                  </div>
                  <div class="metric-label">大单净流入</div>
                  <div class="metric-change" :class="{ 'positive': latestFundFlowData['大单净流入-净占比'] > 0, 'negative': latestFundFlowData['大单净流入-净占比'] < 0 }">
                    {{ latestFundFlowData['大单净流入-净占比'].toFixed(2) }}%
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6" :lg="4">
                <div class="metric-card">
                  <div class="metric-value" :class="{ 'positive': latestFundFlowData['中单净流入-净额'] > 0, 'negative': latestFundFlowData['中单净流入-净额'] < 0 }">
                    {{ (latestFundFlowData['中单净流入-净额'] / 100000000).toFixed(2) }}亿
                  </div>
                  <div class="metric-label">中单净流入</div>
                  <div class="metric-change" :class="{ 'positive': latestFundFlowData['中单净流入-净占比'] > 0, 'negative': latestFundFlowData['中单净流入-净占比'] < 0 }">
                    {{ latestFundFlowData['中单净流入-净占比'].toFixed(2) }}%
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="8" :md="6" :lg="4">
                <div class="metric-card">
                  <div class="metric-value" :class="{ 'positive': latestFundFlowData['小单净流入-净额'] > 0, 'negative': latestFundFlowData['小单净流入-净额'] < 0 }">
                    {{ (latestFundFlowData['小单净流入-净额'] / 100000000).toFixed(2) }}亿
                  </div>
                  <div class="metric-label">小单净流入</div>
                  <div class="metric-change" :class="{ 'positive': latestFundFlowData['小单净流入-净占比'] > 0, 'negative': latestFundFlowData['小单净流入-净占比'] < 0 }">
                    {{ latestFundFlowData['小单净流入-净占比'].toFixed(2) }}%
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        
        <!-- 资金流向趋势图 -->
        <el-col :span="24">
          <el-card shadow="hover" class="fund-flow-chart-card">
            <template #header>
              <div class="chart-header">
                <h3>资金流向趋势分析（净额）</h3>
              </div>
            </template>
            <div class="chart-container">
              <TrendChart 
                :data="fundFlowChartData" 
                date-field="date"
                :yFields="[
                  { key: '超大单净流入', label: '超大单净流入(亿)' },
                  { key: '大单净流入', label: '大单净流入(亿)' },
                  { key: '中单净流入', label: '中单净流入(亿)' },
                  { key: '小单净流入', label: '小单净流入(亿)' },
                  { key: '主力净流入', label: '主力净流入(亿)' }
                ]"
                :defaultSelectedFields="['超大单净流入', '大单净流入', '小单净流入', '主力净流入']"
                height="400px"
                title="资金流向趋势（净额）"
              />
            </div>
          </el-card>
        </el-col>
        
        <!-- 资金流向占比趋势图 -->
        <el-col :span="24">
          <el-card shadow="hover" class="fund-flow-chart-card">
            <template #header>
              <div class="chart-header">
                <h3>资金流向趋势分析（占比）</h3>
              </div>
            </template>
            <div class="chart-container">
              <TrendChart 
                :data="fundFlowPercentChartData" 
                date-field="date"
                :yFields="[
                  { key: '超大单净占比', label: '超大单净占比(%)' },
                  { key: '大单净占比', label: '大单净占比(%)' },
                  { key: '中单净占比', label: '中单净占比(%)' },
                  { key: '小单净占比', label: '小单净占比(%)' },
                  { key: '主力净占比', label: '主力净占比(%)' }
                ]"
                :defaultSelectedFields="['超大单净占比', '大单净占比', '小单净占比', '主力净占比']"
                height="400px"
                title="资金流向趋势（占比）"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section" v-if="stockValueData.length > 0">
      <el-card shadow="hover">
        <template #header>
          <div class="table-header">
            <h3>历史估值数据</h3>
            <div class="table-info">
              共 {{ stockValueData.length }} 条记录
            </div>
          </div>
        </template>
        <el-table 
          :data="paginatedData" 
          style="width: 100%"
          stripe
          border
          @sort-change="handleSortChange"
        >
          <el-table-column prop="date" label="日期" width="120" sortable></el-table-column>
          <el-table-column prop="当日收盘价" label="收盘价" width="100" align="center" sortable>
            <template #default="scope">
              <span class="price-value">{{ scope.row.当日收盘价.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="当日涨跌幅" label="涨跌幅(%)" width="120" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.当日涨跌幅 > 0,
                  'negative': scope.row.当日涨跌幅 < 0,
                  'neutral': scope.row.当日涨跌幅 === 0
                }"
              >
                {{ scope.row.当日涨跌幅 > 0 ? '+' : '' }}{{ scope.row.当日涨跌幅.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="PE(TTM)" label="PE(TTM)" width="100" align="center" sortable>
            <template #default="scope">
              <span>{{ scope.row['PE(TTM)'].toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="PE(静)" label="PE(静)" width="100" align="center" sortable>
            <template #default="scope">
              <span>{{ scope.row['PE(静)'].toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="市净率" label="市净率" width="100" align="center" sortable>
            <template #default="scope">
              <span>{{ scope.row.市净率.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="PEG值" label="PEG值" width="100" align="center" sortable>
            <template #default="scope">
              <span>{{ scope.row['PEG值'].toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="市现率" label="市现率" width="100" align="center" sortable>
            <template #default="scope">
              <span>{{ scope.row.市现率.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="市销率" label="市销率" width="100" align="center" sortable>
            <template #default="scope">
              <span>{{ scope.row.市销率.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="总市值" label="总市值" width="120" align="center" sortable>
            <template #default="scope">
              <span>{{ formatMarketCap(scope.row.总市值) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="流通市值" label="流通市值" width="120" align="center" sortable>
            <template #default="scope">
              <span>{{ formatMarketCap(scope.row.流通市值) }}</span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="stockValueData.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!loading && stockValueData.length === 0">
      <el-empty description="暂无股票估值数据">
        <el-button type="primary" @click="refreshData">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import TrendChart from '@/components/TrendChart.vue'
import { fetchStockValueData, fetchStockTypeInfo, fetchStockFundFlowData, formatMarketCap, type StockValueData, type StockFundFlowData } from '@/services/stockApi'

const route = useRoute()
const router = useRouter()

// 响应式数据
const stockCode = ref<string>('')
const stockName = ref<string>('')
const stockValueData = ref<StockValueData[]>([])
const stockFundFlowData = ref<StockFundFlowData[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedMetrics = ref<string[]>(['PE(TTM)', '市净率', 'PEG值'])
const sortField = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('desc')

// 计算属性
const latestData = computed(() => {
  if (stockValueData.value.length === 0) return null
  return stockValueData.value[0] // 假设数据按日期降序排列
})

const chartData = computed(() => {
  return stockValueData.value.map(item => ({
    date: item.date,
    'PE(TTM)': item['PE(TTM)'],
    'PE(静)': item['PE(静)'],
    '市净率': item.市净率,
    'PEG值': item['PEG值'],
    '市现率': item.市现率,
    '市销率': item.市销率,
    '当日收盘价': item.当日收盘价,
    '当日涨跌幅': item.当日涨跌幅
  }))
})

const selectedMetricsConfig = computed(() => {
  return [
    { key: 'PE(TTM)', label: 'PE(TTM)' },
    { key: 'PE(静)', label: 'PE(静)' },
    { key: '市净率', label: '市净率' },
    { key: 'PEG值', label: 'PEG值' },
    { key: '市现率', label: '市现率' },
    { key: '市销率', label: '市销率' }
  ]
})

const marketCapData = computed(() => {
  return stockValueData.value.map(item => ({
    date: item.date,
    '总市值': item.总市值 / 100000000, // 转换为亿元
    '流通市值': item.流通市值 / 100000000 // 转换为亿元
  }))
})

const fundFlowChartData = computed(() => {
  return stockFundFlowData.value.map(item => ({
    date: item.date,
    '超大单净流入': item['超大单净流入-净额'] / 100000000, // 转换为亿元
    '大单净流入': item['大单净流入-净额'] / 100000000,
    '中单净流入': item['中单净流入-净额'] / 100000000,
    '小单净流入': item['小单净流入-净额'] / 100000000,
    '主力净流入': item['主力净流入-净额'] / 100000000
  }))
})

const fundFlowPercentChartData = computed(() => {
  return stockFundFlowData.value.map(item => ({
    date: item.date,
    '超大单净占比': item['超大单净流入-净占比'],
    '大单净占比': item['大单净流入-净占比'],
    '中单净占比': item['中单净流入-净占比'],
    '小单净占比': item['小单净流入-净占比'],
    '主力净占比': item['主力净流入-净占比']
  }))
})

const latestFundFlowData = computed(() => {
  if (stockFundFlowData.value.length === 0) return null
  return stockFundFlowData.value[0] // 假设数据按日期降序排列
})

const sortedData = computed(() => {
  if (!sortField.value) return stockValueData.value
  
  return [...stockValueData.value].sort((a, b) => {
    const aValue = (a as any)[sortField.value]
    const bValue = (b as any)[sortField.value]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder.value === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(stockValueData.value.length / pageSize.value)
})

// 方法
const fetchData = async () => {
  if (!stockCode.value) return
  
  loading.value = true
  try {
    // 获取股票估值数据
    const data = await fetchStockValueData(stockCode.value)
    stockValueData.value = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // 获取股票名称
    const stockInfo = await fetchStockTypeInfo(stockCode.value)
    stockName.value = stockInfo.name
    
    // 获取资金流向数据
    const fundFlowData = await fetchStockFundFlowData(stockCode.value)
    stockFundFlowData.value = fundFlowData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    ElMessage.success('股票数据加载成功')
  } catch (error) {
    console.error('获取股票数据失败:', error)
    ElMessage.error('获取股票数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
}

const goBack = () => {
  router.back()
}

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  sortField.value = prop || ''
  sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
}

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
}

// 监听路由参数变化
watch(
  () => route.params.code,
  (newCode) => {
    if (newCode && typeof newCode === 'string') {
      stockCode.value = newCode
      fetchData()
    }
  },
  { immediate: true }
)

// 组件挂载
onMounted(() => {
  const code = route.params.code
  if (code && typeof code === 'string') {
    stockCode.value = code
    fetchData()
  }
})
</script>

<style scoped>
.stock-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
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

.stock-info h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.stock-info p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.latest-data-section, .fund-flow-section {
  margin-bottom: 20px;
}

.latest-fund-flow-card {
  margin-bottom: 20px;
}

.fund-flow-chart-card {
  margin-bottom: 20px;
}

.metrics-grid {
  margin-top: 20px;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.metric-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.metric-value.price {
  font-size: 28px;
}

.metric-value.up, .metric-value.positive {
  color: #f56c6c;
}

.metric-value.down, .metric-value.negative {
  color: #67c23a;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-change {
  font-size: 12px;
  font-weight: 500;
}

.metric-change.up, .metric-change.positive {
  color: #f56c6c;
}

.metric-change.down, .metric-change.negative {
  color: #67c23a;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-header h3 {
  margin: 0;
}

.chart-container {
  margin-top: 20px;
}

.table-section {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
}

.table-info {
  color: #909399;
  font-size: 14px;
}

.price-value {
  font-weight: 600;
}

.change-value {
  font-weight: 600;
}

.change-value.positive {
  color: #f56c6c;
}

.change-value.negative {
  color: #67c23a;
}

.change-value.neutral {
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.empty-state {
  margin-top: 40px;
}

.chart-container {
  width: 100%;
  min-height: 500px;
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stock-detail {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .metric-card {
    padding: 15px;
  }
  
  .metric-value {
    font-size: 20px;
  }
  
  .metric-value.price {
    font-size: 24px;
  }
}
</style>