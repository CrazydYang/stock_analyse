<template>
  <div class="stock-picker" v-loading="loading" element-loading-text="正在加载股票数据...">

    <!-- 搜索栏 -->
    <div class="search-section">
      <el-card class="search-card" shadow="hover">
        <template #header>
          <h3>搜索筛选</h3>
        </template>
        <el-row :gutter="20" class="search-grid">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="search-item">
              <label>股票代码</label>
              <el-input v-model="searchParams.code" placeholder="输入股票代码" clearable />
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="search-item">
              <label>股票名称</label>
              <el-input v-model="searchParams.name" placeholder="输入股票名称" clearable />
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="search-item">
              <label>价格范围</label>
              <div class="range-input">
                <el-input v-model="searchParams.minPrice" placeholder="最低价" type="number" />
                <span class="range-separator">-</span>
                <el-input v-model="searchParams.maxPrice" placeholder="最高价" type="number" />
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="search-item">
              <label>市盈率</label>
              <div class="range-input">
                <el-input v-model="searchParams.minPE" placeholder="最低" type="number" />
                <span class="range-separator">-</span>
                <el-input v-model="searchParams.maxPE" placeholder="最高" type="number" />
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="search-item">
              <label>流通市值(亿元)</label>
              <div class="range-input">
                <el-input v-model="searchParams.minMarketCap" placeholder="最低" type="number" />
                <span class="range-separator">-</span>
                <el-input v-model="searchParams.maxMarketCap" placeholder="最高" type="number" />
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="search-item">
              <label>涨跌幅(%)</label>
              <div class="range-input">
                <el-input v-model="searchParams.minChange" placeholder="最低" type="number" />
                <span class="range-separator">-</span>
                <el-input v-model="searchParams.maxChange" placeholder="最高" type="number" />
              </div>
            </div>
          </el-col>
        </el-row>
        
        
        <!-- 列显示控制 -->
        <el-row class="column-control">
          <el-col :span="24">
            <h4>显示列设置</h4>
            <el-row :gutter="10" class="column-grid">
              <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="col in availableColumns" :key="col.key">
                <el-checkbox v-model="visibleColumns" :label="col.key">{{ col.label }}</el-checkbox>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        
        <el-row class="search-actions" justify="center" :gutter="10">
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetSearch" :icon="RefreshLeft">
              重置
            </el-button>
          </el-col>
          <el-col :span="4">
            <el-button @click="refreshData" :loading="loading" :icon="Refresh">
              刷新
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section" v-if="filteredStocks.length > 0">
      <el-row :gutter="20" class="stats-grid">
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ totalStocks }}</div>
            <div class="stat-label">总股票数</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number up">{{ upCount }}</div>
            <div class="stat-label">上涨股票</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number" :class="{ 'up': upRatio > 50, 'down': upRatio < 50 }">
              {{ upRatio.toFixed(1) }}%
            </div>
            <div class="stat-label">上涨比例</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ avgTurnoverRate }}</div>
            <div class="stat-label">平均换手率</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number" :class="{ 'up': avgChange60Day > 0, 'down': avgChange60Day < 0 }">
              {{ avgChange60Day > 0 ? '+' : '' }}{{ avgChange60Day.toFixed(2) }}%
            </div>
            <div class="stat-label">平均60日涨跌</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number" :class="{ 'up': avgChangeYTD > 0, 'down': avgChangeYTD < 0 }">
              {{ avgChangeYTD > 0 ? '+' : '' }}{{ avgChangeYTD.toFixed(2) }}%
            </div>
            <div class="stat-label">平均年初至今涨跌</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ avgPERatio.toFixed(2) }}</div>
            <div class="stat-label">平均市盈率</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ avgPBRatio.toFixed(2) }}</div>
            <div class="stat-label">平均市净率</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number">{{ formatAmount(totalAmount) }}</div>
            <div class="stat-label">总成交额</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="2.4">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-number" :class="{ 'up': avgChangePercent > 0, 'down': avgChangePercent < 0 }">
              {{ avgChangePercent > 0 ? '+' : '' }}{{ avgChangePercent.toFixed(2) }}%
            </div>
            <div class="stat-label">平均涨跌幅</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 股票列表 -->
    <div class="list-section">
      <div class="list-header">
        <h3>股票列表</h3>
        <div class="list-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredStocks.length) }} 
          条，共 {{ filteredStocks.length }} 条
        </div>
      </div>

      <div class="table-container">
        <el-table 
          :data="paginatedStocks" 
          style="width: 100%"
          stripe
          border
          :loading="loading"
          empty-text="暂无股票数据"
          @sort-change="handleSortChange"
        >
          <el-table-column v-if="visibleColumns.includes('code')" prop="code" label="股票代码" width="120" sortable>
            <template #default="scope">
              <span class="stock-code">{{ scope.row.code }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('name')" prop="name" label="股票名称" width="120" sortable>
            <template #default="scope">
              <span class="stock-name">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('industry')" prop="industry" label="行业类型" width="120" sortable>
            <template #default="scope">
              <span 
                class="industry-value clickable" 
                @click="viewIndustryDetail(scope.row.industry)"
                :class="{ 'disabled': !scope.row.industry || scope.row.industry === '加载中...' || scope.row.industry === '未知' }"
              >
                {{ scope.row.industry || '加载中...' }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('latest_price')" prop="latest_price" label="最新价" width="100" align="center" sortable>
            <template #default="scope">
              <span class="price-value">{{ scope.row.latest_price.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('change_percent')" prop="change_percent" label="涨跌幅" width="120" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.change_percent > 0,
                  'negative': scope.row.change_percent < 0,
                  'neutral': scope.row.change_percent === 0
                }"
              >
                {{ scope.row.change_percent > 0 ? '+' : '' }}{{ scope.row.change_percent.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('change_amount')" prop="change_amount" label="涨跌额" width="100" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.change_amount > 0,
                  'negative': scope.row.change_amount < 0,
                  'neutral': scope.row.change_amount === 0
                }"
              >
                {{ scope.row.change_amount > 0 ? '+' : '' }}{{ scope.row.change_amount.toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('volume')" prop="volume" label="成交量" width="120" align="center" sortable>
            <template #default="scope">
              <span class="volume-value">{{ formatVolume(scope.row.volume) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('amount')" prop="amount" label="成交额" width="120" align="center" sortable>
            <template #default="scope">
              <span class="amount-value">{{ formatAmount(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('amplitude')" prop="amplitude" label="振幅" width="100" align="center" sortable>
            <template #default="scope">
              <span class="amplitude-value">{{ scope.row.amplitude.toFixed(2) }}%</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('high')" prop="high" label="最高价" width="100" align="center" sortable>
            <template #default="scope">
              <span class="price-value">{{ scope.row.high.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('low')" prop="low" label="最低价" width="100" align="center" sortable>
            <template #default="scope">
              <span class="price-value">{{ scope.row.low.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('open')" prop="open" label="开盘价" width="100" align="center" sortable>
            <template #default="scope">
              <span class="price-value">{{ scope.row.open.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('close')" prop="close" label="收盘价" width="100" align="center" sortable>
            <template #default="scope">
              <span class="price-value">{{ scope.row.close.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('volume_ratio')" prop="volume_ratio" label="量比" width="100" align="center" sortable>
            <template #default="scope">
              <span class="ratio-value">{{ scope.row.volume_ratio.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('turnover_rate')" prop="turnover_rate" label="换手率" width="100" align="center" sortable>
            <template #default="scope">
              <span class="turnover-value">{{ scope.row.turnover_rate.toFixed(2) }}%</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('pe_ratio')" prop="pe_ratio" label="市盈率" width="100" align="center" sortable>
            <template #default="scope">
              <span class="ratio-value">{{ scope.row.pe_ratio.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('pb_ratio')" prop="pb_ratio" label="市净率" width="100" align="center" sortable>
            <template #default="scope">
              <span class="ratio-value">{{ scope.row.pb_ratio.toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('total_market_cap')" prop="total_market_cap" label="总市值" width="120" align="center" sortable>
            <template #default="scope">
              <span class="market-cap-value">{{ formatMarketCap(scope.row.total_market_cap) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('circulation_market_cap')" prop="circulation_market_cap" label="流通市值" width="120" align="center" sortable>
            <template #default="scope">
              <span class="market-cap-value">{{ formatMarketCap(scope.row.circulation_market_cap) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('speed')" prop="speed" label="涨速" width="100" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.speed > 0,
                  'negative': scope.row.speed < 0,
                  'neutral': scope.row.speed === 0
                }"
              >
                {{ scope.row.speed > 0 ? '+' : '' }}{{ scope.row.speed.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('change_5min')" prop="change_5min" label="5分钟涨跌" width="120" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.change_5min > 0,
                  'negative': scope.row.change_5min < 0,
                  'neutral': scope.row.change_5min === 0
                }"
              >
                {{ scope.row.change_5min > 0 ? '+' : '' }}{{ scope.row.change_5min.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('change_60day')" prop="change_60day" label="60日涨跌" width="120" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.change_60day > 0,
                  'negative': scope.row.change_60day < 0,
                  'neutral': scope.row.change_60day === 0
                }"
              >
                {{ scope.row.change_60day > 0 ? '+' : '' }}{{ scope.row.change_60day.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="visibleColumns.includes('change_ytd')" prop="change_ytd" label="年初至今" width="120" align="center" sortable>
            <template #default="scope">
              <span 
                class="change-value" 
                :class="{
                  'positive': scope.row.change_ytd > 0,
                  'negative': scope.row.change_ytd < 0,
                  'neutral': scope.row.change_ytd === 0
                }"
              >
                {{ scope.row.change_ytd > 0 ? '+' : '' }}{{ scope.row.change_ytd.toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small"
                @click="viewDetails(scope.row.code)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredStocks.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, RefreshLeft, Refresh } from '@element-plus/icons-vue'
import { 
  fetchStocksData, 
  fetchStocksWithIndustryData,
  enrichStocksWithIndustryData,
  filterStocks, 
  sortStocks, 
  calculateStockStats,
  formatNumber,
  type Stock, 
  type SearchParams 
} from '@/services/stockApi'

const router = useRouter()

// 响应式数据
const stocks = ref<Stock[]>([])
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 搜索参数
const searchParams = ref<SearchParams>({
  code: '',
  name: '',
  minPrice: '',
  maxPrice: '',
  minPE: '',
  maxPE: '',
  minMarketCap: '',
  maxMarketCap: '',
  minChange: '',
  maxChange: ''
})

// 计算属性
const filteredStocks = computed(() => {
  // 使用API服务进行筛选和排序
  let result = filterStocks(stocks.value, searchParams.value)
  result = sortStocks(result, sortField.value, sortOrder.value)
  return result
})

// 在现有的计算属性下方添加新的统计指标计算
const avgChange60Day = computed(() => {
  const stocks = filteredStocks.value
  if (stocks.length === 0) return 0
  return stocks.reduce((sum, s) => sum + s.change_60day, 0) / stocks.length
})

const avgChangeYTD = computed(() => {
  const stocks = filteredStocks.value
  if (stocks.length === 0) return 0
  return stocks.reduce((sum, s) => sum + s.change_ytd, 0) / stocks.length
})

const avgPERatio = computed(() => {
  const stocks = filteredStocks.value.filter(s => s.pe_ratio > 0)
  if (stocks.length === 0) return 0
  return stocks.reduce((sum, s) => sum + s.pe_ratio, 0) / stocks.length
})

const avgPBRatio = computed(() => {
  const stocks = filteredStocks.value.filter(s => s.pb_ratio > 0)
  if (stocks.length === 0) return 0
  return stocks.reduce((sum, s) => sum + s.pb_ratio, 0) / stocks.length
})

const totalAmount = computed(() => {
  return filteredStocks.value.reduce((sum, s) => sum + s.amount, 0)
})

const avgChangePercent = computed(() => {
  const stocks = filteredStocks.value
  if (stocks.length === 0) return 0
  return stocks.reduce((sum, s) => sum + s.change_percent, 0) / stocks.length
})

const paginatedStocks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStocks.value.slice(start, end)
})

// 使用API服务计算统计数据
const stockStats = computed(() => calculateStockStats(filteredStocks.value))
const totalStocks = computed(() => stockStats.value.total)
const totalPages = computed(() => Math.ceil(filteredStocks.value.length / pageSize.value))

const upCount = computed(() => stockStats.value.upCount)
const downCount = computed(() => stockStats.value.downCount)
const flatCount = computed(() => stockStats.value.flatCount)
const upRatio = computed(() => stockStats.value.upRatio)
const avgTurnoverRate = computed(() => {
  const stocks = filteredStocks.value
  if (stocks.length === 0) return 0
  return (stocks.reduce((sum, s) => sum + s.turnover_rate, 0) / stocks.length).toFixed(2)
})



// 方法
const fetchStocks = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await fetchStocksWithIndustryData()
    stocks.value = data
    
    // 为第一页的股票获取行业信息
    const firstPageStocks = data.slice(0, pageSize.value)
    if (firstPageStocks.length > 0) {
      try {
        const enrichedStocks = await enrichStocksWithIndustryData(firstPageStocks)
        
        // 更新stocks数组中对应的股票数据
        enrichedStocks.forEach(enrichedStock => {
          const index = stocks.value.findIndex(stock => stock.code === enrichedStock.code)
          if (index !== -1) {
            stocks.value[index] = enrichedStock
          }
        })
      } catch (error) {
        console.error('获取第一页行业信息失败:', error)
      }
    }
  } catch (err) {
    console.error('获取股票数据失败:', err)
    error.value = err instanceof Error ? err.message : '获取数据失败'
  } finally {
    loading.value = false
  }
}


const handleSearch = async () => {
  currentPage.value = 1
  
  // 为搜索后的第一页股票获取行业信息
  const currentPageStocks = paginatedStocks.value
  if (currentPageStocks.length > 0) {
    try {
      const enrichedStocks = await enrichStocksWithIndustryData(currentPageStocks)
      
      // 更新stocks数组中对应的股票数据
      enrichedStocks.forEach(enrichedStock => {
        const index = stocks.value.findIndex(stock => stock.code === enrichedStock.code)
        if (index !== -1) {
          stocks.value[index] = enrichedStock
        }
      })
    } catch (error) {
      console.error('获取搜索结果行业信息失败:', error)
    }
  }
}

// Element Plus 分页事件处理
const handleSizeChange = async (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  
  // 为新的第一页股票获取行业信息
  const currentPageStocks = paginatedStocks.value
  if (currentPageStocks.length > 0) {
    try {
      const enrichedStocks = await enrichStocksWithIndustryData(currentPageStocks)
      
      // 更新stocks数组中对应的股票数据
      enrichedStocks.forEach(enrichedStock => {
        const index = stocks.value.findIndex(stock => stock.code === enrichedStock.code)
        if (index !== -1) {
          stocks.value[index] = enrichedStock
        }
      })
    } catch (error) {
      console.error('获取行业信息失败:', error)
    }
  }
}

const handleCurrentChange = async (newPage: number) => {
  currentPage.value = newPage
  
  // 为当前页面的股票获取行业信息
  const currentPageStocks = paginatedStocks.value
  if (currentPageStocks.length > 0) {
    try {
      const enrichedStocks = await enrichStocksWithIndustryData(currentPageStocks)
      
      // 更新stocks数组中对应的股票数据
      enrichedStocks.forEach(enrichedStock => {
        const index = stocks.value.findIndex(stock => stock.code === enrichedStock.code)
        if (index !== -1) {
          stocks.value[index] = enrichedStock
        }
      })
    } catch (error) {
      console.error('获取行业信息失败:', error)
    }
  }
}

// Element Plus 表格排序处理
const handleSortChange = ({ column, prop, order }: any) => {
  if (order) {
    sortField.value = prop
    sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  } else {
    sortField.value = ''
    sortOrder.value = 'asc'
  }
}

// 在searchParams定义之后添加
const visibleColumns = ref<string[]>([
  'code', 'name', 'industry', 'latest_price', 'change_percent', 'change_amount', 
  'volume', 'amount', 'turnover_rate', 'circulation_market_cap'
])

const availableColumns = [
  { key: 'code', label: '股票代码' },
  { key: 'name', label: '股票名称' },
  { key: 'industry', label: '行业类型' },
  { key: 'latest_price', label: '最新价' },
  { key: 'change_percent', label: '涨跌幅' },
  { key: 'change_amount', label: '涨跌额' },
  { key: 'volume', label: '成交量' },
  { key: 'amount', label: '成交额' },
  { key: 'amplitude', label: '振幅' },
  { key: 'high', label: '最高价' },
  { key: 'low', label: '最低价' },
  { key: 'open', label: '今开价' },
  { key: 'close', label: '昨收价' },
  { key: 'volume_ratio', label: '量比' },
  { key: 'turnover_rate', label: '换手率' },
  { key: 'pe_ratio', label: '市盈率' },
  { key: 'pb_ratio', label: '市净率' },
  { key: 'total_market_cap', label: '总市值' },
  { key: 'circulation_market_cap', label: '流通市值' },
  { key: 'speed', label: '涨速' },
  { key: 'change_5min', label: '5分钟涨跌' },
  { key: 'change_60day', label: '60日涨跌' },
  { key: 'change_ytd', label: '年初至今涨跌' }
]

// 修改resetSearch方法，添加重置列显示
const resetSearch = () => {
  searchParams.value = {
    code: '',
    name: '',
    minPrice: '',
    maxPrice: '',
    minPE: '',
    maxPE: '',
    minMarketCap: '',
    maxMarketCap: '',
    minChange: '',
    maxChange: ''
  }
  visibleColumns.value = [
    'code', 'name', 'industry', 'latest_price', 'change_percent', 'change_amount', 
    'volume', 'amount', 'turnover_rate', 'circulation_market_cap'
  ]
  currentPage.value = 1
}

const refreshData = () => {
  fetchStocks()
}



const viewDetails = (code: string) => {
  router.push(`/analysis/stock/${code}`)
}

const viewIndustryDetail = (industry: string) => {
  // 检查行业信息是否有效
  if (!industry || industry === '加载中...' || industry === '未知') {
    return
  }
  
  // 跳转到行业详情页
  router.push({
    name: 'industry-detail',
    params: {
      industry: encodeURIComponent(industry)
    }
  })
}

const formatMarketCap = (value: number) => {
  return value.toFixed(2) + '亿'
}

const formatVolume = (value: number) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万'
  }
  return value.toLocaleString()
}

const formatAmount = (value: number) => {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿'
  } else if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万'
  }
  return value.toLocaleString()
}

// 监听搜索参数变化
watch([searchParams], async () => {
  currentPage.value = 1
  
  // 为搜索后的第一页股票获取行业信息
  await nextTick() // 等待DOM更新
  const currentPageStocks = paginatedStocks.value
  if (currentPageStocks.length > 0) {
    try {
      const enrichedStocks = await enrichStocksWithIndustryData(currentPageStocks)
      
      // 更新stocks数组中对应的股票数据
      enrichedStocks.forEach(enrichedStock => {
        const index = stocks.value.findIndex(stock => stock.code === enrichedStock.code)
        if (index !== -1) {
          stocks.value[index] = enrichedStock
        }
      })
    } catch (error) {
      console.error('获取搜索结果行业信息失败:', error)
    }
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  fetchStocks()
})
</script>

<style scoped>
.stock-picker {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 16px;
}

.search-section {
  margin-bottom: 30px;
}

.search-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.search-card h3 {
  margin-bottom: 20px;
  color: #1a1a1a;
}

.search-grid {
  margin-bottom: 20px;
}

.search-item {
  margin-bottom: 16px;
}

.search-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.search-item input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input input {
  flex: 1;
}

.range-input .range-separator {
  color: #666;
  font-weight: 600;
  padding: 0 4px;
  user-select: none;
}

.search-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 统计信息样式 */
.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 16px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  line-height: 1.2;
}

/* 股票列表样式 */
.list-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.list-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1a1a1a;
}

.list-info {
  font-size: 14px;
  color: #666;
}

/* 搜索输入框样式优化 */
.search-content .el-input {
  border-radius: 12px;
}

.search-content .el-input__wrapper {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
}

.search-content .el-input__wrapper:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.search-content .el-input__wrapper.is-focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 搜索按钮样式优化 */
.search-actions .el-button {
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-actions .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  border: none;
}

.search-actions .el-button--primary:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #40a9ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.search-actions .el-button--default {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px solid #dcdfe6;
  color: #606266;
}

.search-actions .el-button--default:hover {
  background: linear-gradient(135deg, #ecf5ff 0%, #b3d8ff 100%);
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

/* Element Plus 表格样式 */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.table-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 股票代码样式 */
.stock-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid #91d5ff;
}

/* 股票名称样式 */
.stock-name {
  font-weight: 600;
  color: #1a1a1a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 价格值样式 */
.price-value {
  font-weight: 600;
  color: #333;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 涨跌幅颜色 */
.change-value {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.change-value.positive {
  color: white;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border: 1px solid #ff4d4f;
}

.change-value.negative {
  color: white;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: 1px solid #52c41a;
}

.change-value.neutral {
  color: #666;
  background: linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%);
  border: 1px solid #d9d9d9;
}

/* 其他数值样式 */
.volume-value,
.amount-value,
.amplitude-value,
.turnover-value,
.ratio-value,
.market-cap-value {
  font-weight: 600;
  color: #333;
}



.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-refresh {
  background: #52c41a;
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background: #73d13d;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Element Plus 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 添加涨跌颜色样式 */
.stat-number.up {
  color: #f5222d;
}

.stat-number.down {
  color: #52c41a;
}

.change.up {
  color: #f5222d;
}

.change.down {
  color: #52c41a;
}

/* 行业类型样式 */
.industry-value {
  color: #1890ff;
  font-weight: 500;
  padding: 2px 8px;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.industry-value.clickable {
  cursor: pointer;
}

.industry-value.clickable:hover:not(.disabled) {
  background: rgba(24, 144, 255, 0.2);
  color: #0050b3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
}

.industry-value.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  color: #999;
  background: rgba(153, 153, 153, 0.1);
}

.industry-value.clickable:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(24, 144, 255, 0.2);
}
</style>