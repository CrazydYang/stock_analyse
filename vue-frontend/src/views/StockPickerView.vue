<template>
  <div class="stock-picker">
    <div class="header">
      <h1>上证A股实时行情</h1>
      <p class="subtitle">基于akshare实时数据，提供全面的股票信息</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-card">
        <h3>搜索筛选</h3>
        <div class="search-grid">
          <!-- 原有搜索项保持不变 -->
          <div class="search-item">
            <label>股票代码</label>
            <input v-model="searchParams.code" placeholder="输入股票代码" type="text" />
          </div>
          <div class="search-item">
            <label>股票名称</label>
            <input v-model="searchParams.name" placeholder="输入股票名称" type="text" />
          </div>
          <div class="search-item">
            <label>价格范围</label>
            <div class="range-input">
              <input v-model="searchParams.minPrice" placeholder="最低价" type="number" step="0.01" />
              <span>-</span>
              <input v-model="searchParams.maxPrice" placeholder="最高价" type="number" step="0.01" />
            </div>
          </div>
          <div class="search-item">
            <label>换手率(%)</label>
            <div class="range-input">
              <input v-model="searchParams.minTurnover" placeholder="最低" type="number" step="0.01" />
              <span>-</span>
              <input v-model="searchParams.maxTurnover" placeholder="最高" type="number" step="0.01" />
            </div>
          </div>
          <div class="search-item">
            <label>流通市值(亿元)</label>
            <div class="range-input">
              <input v-model="searchParams.minMarketCap" placeholder="最低" type="number" step="0.01" />
              <span>-</span>
              <input v-model="searchParams.maxMarketCap" placeholder="最高" type="number" step="0.01" />
            </div>
          </div>
          <div class="search-item">
            <label>涨跌幅(%)</label>
            <div class="range-input">
              <input v-model="searchParams.minChange" placeholder="最低" type="number" step="0.01" />
              <span>-</span>
              <input v-model="searchParams.maxChange" placeholder="最高" type="number" step="0.01" />
            </div>
          </div>
        </div>
        
        <!-- 列显示控制 -->
        <div class="column-control">
          <h4>显示列设置</h4>
          <div class="column-grid">
            <label v-for="col in availableColumns" :key="col.key" class="column-checkbox">
              <input 
                type="checkbox" 
                v-model="visibleColumns" 
                :value="col.key"
              >
              {{ col.label }}
            </label>
          </div>
        </div>
        
        <div class="search-actions">
          <button @click="handleSearch" class="btn btn-primary">
            <i class="icon-search"></i>
            搜索
          </button>
          <button @click="resetSearch" class="btn btn-secondary">
            <i class="icon-reset"></i>
            重置
          </button>
          <button @click="refreshData" class="btn btn-refresh" :disabled="loading">
            <i class="icon-refresh" :class="{ 'spinning': loading }"></i>
            刷新
          </button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section" v-if="filteredStocks.length > 0">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalStocks }}</div>
          <div class="stat-label">总股票数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number up">{{ upCount }}</div>
          <div class="stat-label">上涨股票</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" :class="{ 'up': upRatio > 50, 'down': upRatio < 50 }">
            {{ upRatio.toFixed(1) }}%
          </div>
          <div class="stat-label">上涨比例</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ avgTurnoverRate }}</div>
          <div class="stat-label">平均换手率</div>
        </div>

        <div class="stat-card">
          <div class="stat-number" :class="{ 'up': avgChange60Day > 0, 'down': avgChange60Day < 0 }">
            {{ avgChange60Day > 0 ? '+' : '' }}{{ avgChange60Day.toFixed(2) }}%
          </div>
          <div class="stat-label">平均60日涨跌</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" :class="{ 'up': avgChangeYTD > 0, 'down': avgChangeYTD < 0 }">
            {{ avgChangeYTD > 0 ? '+' : '' }}{{ avgChangeYTD.toFixed(2) }}%
          </div>
          <div class="stat-label">平均年初至今涨跌</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ avgPERatio.toFixed(2) }}</div>
          <div class="stat-label">平均市盈率</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ avgPBRatio.toFixed(2) }}</div>
          <div class="stat-label">平均市净率</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ formatAmount(totalAmount) }}</div>
          <div class="stat-label">总成交额</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" :class="{ 'up': avgChangePercent > 0, 'down': avgChangePercent < 0 }">
            {{ avgChangePercent > 0 ? '+' : '' }}{{ avgChangePercent.toFixed(2) }}%
          </div>
          <div class="stat-label">平均涨跌幅</div>
        </div>
      </div>
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
        <table class="stock-table" v-if="paginatedStocks.length > 0">
          <thead>
            <tr>
              <th v-for="col in availableColumns.filter(c => visibleColumns.includes(c.key))" 
                  :key="col.key" 
                  @click="sortBy(col.key)" 
                  class="sortable">
                {{ col.label }}
                <span class="sort-icon" :class="getSortIcon(col.key)"></span>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stock in paginatedStocks" :key="stock.code" 
                :class="{ 'up-row': stock.change_percent > 0, 'down-row': stock.change_percent < 0 }">
              <td v-if="visibleColumns.includes('code')" class="code">{{ stock.code }}</td>
              <td v-if="visibleColumns.includes('name')" class="name">{{ stock.name }}</td>
              <td v-if="visibleColumns.includes('latest_price')" class="price">{{ stock.latest_price.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('change_percent')" class="change" :class="{ 'up': stock.change_percent > 0, 'down': stock.change_percent < 0 }">
                {{ stock.change_percent > 0 ? '+' : '' }}{{ stock.change_percent.toFixed(2) }}%
              </td>
              <td v-if="visibleColumns.includes('change_amount')" class="change-amount" :class="{ 'up': stock.change_amount > 0, 'down': stock.change_amount < 0 }">
                {{ stock.change_amount > 0 ? '+' : '' }}{{ stock.change_amount.toFixed(2) }}
              </td>
              <td v-if="visibleColumns.includes('volume')" class="volume">{{ formatVolume(stock.volume) }}</td>
              <td v-if="visibleColumns.includes('amount')" class="amount">{{ formatAmount(stock.amount) }}</td>
              <td v-if="visibleColumns.includes('amplitude')" class="amplitude">{{ stock.amplitude.toFixed(2) }}%</td>
              <td v-if="visibleColumns.includes('high')" class="price">{{ stock.high.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('low')" class="price">{{ stock.low.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('open')" class="price">{{ stock.open.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('close')" class="price">{{ stock.close.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('volume_ratio')" class="volume-ratio">{{ stock.volume_ratio.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('turnover_rate')" class="turnover">{{ stock.turnover_rate.toFixed(2) }}%</td>
              <td v-if="visibleColumns.includes('pe_ratio')" class="pe-ratio">{{ stock.pe_ratio.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('pb_ratio')" class="pb-ratio">{{ stock.pb_ratio.toFixed(2) }}</td>
              <td v-if="visibleColumns.includes('total_market_cap')" class="market-cap">{{ formatMarketCap(stock.total_market_cap) }}</td>
              <td v-if="visibleColumns.includes('circulation_market_cap')" class="market-cap">{{ formatMarketCap(stock.circulation_market_cap) }}</td>
              <td v-if="visibleColumns.includes('speed')" class="speed" :class="{ 'up': stock.speed > 0, 'down': stock.speed < 0 }">
                {{ stock.speed > 0 ? '+' : '' }}{{ stock.speed.toFixed(2) }}%
              </td>
              <td v-if="visibleColumns.includes('change_5min')" class="change" :class="{ 'up': stock.change_5min > 0, 'down': stock.change_5min < 0 }">
                {{ stock.change_5min > 0 ? '+' : '' }}{{ stock.change_5min.toFixed(2) }}%
              </td>
              <td v-if="visibleColumns.includes('change_60day')" class="change" :class="{ 'up': stock.change_60day > 0, 'down': stock.change_60day < 0 }">
                {{ stock.change_60day > 0 ? '+' : '' }}{{ stock.change_60day.toFixed(2) }}%
              </td>
              <td v-if="visibleColumns.includes('change_ytd')" class="change" :class="{ 'up': stock.change_ytd > 0, 'down': stock.change_ytd < 0 }">
                {{ stock.change_ytd > 0 ? '+' : '' }}{{ stock.change_ytd.toFixed(2) }}%
              </td>
              <td class="actions">
                <button @click="viewDetails(stock.code)" class="btn btn-small">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-text">暂无数据</div>
          <div class="empty-desc">{{ error || '请调整搜索条件或刷新数据' }}</div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn-page">首页</button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page">上一页</button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['btn-page', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>
        
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page">下一页</button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn-page">末页</button>
        
        <div class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载股票数据...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Stock {
  code: string
  name: string
  latest_price: number
  change_percent: number
  change_amount: number
  volume: number
  amount: number
  amplitude: number
  high: number
  low: number
  open: number
  close: number
  volume_ratio: number
  turnover_rate: number
  pe_ratio: number
  pb_ratio: number
  total_market_cap: number
  circulation_market_cap: number
  speed: number
  change_5min: number
  change_60day: number
  change_ytd: number
  timestamp: string
}

interface SearchParams {
  code: string
  name: string
  minPrice: string
  maxPrice: string
  minTurnover: string
  maxTurnover: string
  minMarketCap: string
  maxMarketCap: string
  minChange: string
  maxChange: string
}

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
  minTurnover: '',
  maxTurnover: '',
  minMarketCap: '',
  maxMarketCap: '',
  minChange: '',
  maxChange: ''
})

// 计算属性
const filteredStocks = computed(() => {
  let result = [...stocks.value]

  // 搜索筛选
  if (searchParams.value.code) {
    result = result.filter(stock => stock.code.includes(searchParams.value.code))
  }
  if (searchParams.value.name) {
    result = result.filter(stock => stock.name.includes(searchParams.value.name))
  }
  if (searchParams.value.minPrice) {
    result = result.filter(stock => stock.latest_price >= parseFloat(searchParams.value.minPrice))
  }
  if (searchParams.value.maxPrice) {
    result = result.filter(stock => stock.latest_price <= parseFloat(searchParams.value.maxPrice))
  }
  if (searchParams.value.minTurnover) {
    result = result.filter(stock => stock.turnover_rate >= parseFloat(searchParams.value.minTurnover))
  }
  if (searchParams.value.maxTurnover) {
    result = result.filter(stock => stock.turnover_rate <= parseFloat(searchParams.value.maxTurnover))
  }
  if (searchParams.value.minMarketCap) {
    result = result.filter(stock => stock.circulation_market_cap >= parseFloat(searchParams.value.minMarketCap))
  }
  if (searchParams.value.maxMarketCap) {
    result = result.filter(stock => stock.circulation_market_cap <= parseFloat(searchParams.value.maxMarketCap))
  }
  if (searchParams.value.minChange) {
    result = result.filter(stock => stock.change_percent >= parseFloat(searchParams.value.minChange))
  }
  if (searchParams.value.maxChange) {
    result = result.filter(stock => stock.change_percent <= parseFloat(searchParams.value.maxChange))
  }

  

  // 排序
  if (sortField.value) {
    result.sort((a, b) => {
      const aVal = a[sortField.value as keyof Stock] as number
      const bVal = b[sortField.value as keyof Stock] as number
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    })
  }

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

const totalStocks = computed(() => filteredStocks.value.length)
const totalPages = computed(() => Math.ceil(filteredStocks.value.length / pageSize.value))

const upCount = computed(() => filteredStocks.value.filter(s => s.change_percent > 0).length)
const downCount = computed(() => filteredStocks.value.filter(s => s.change_percent < 0).length)
const avgTurnoverRate = computed(() => {
  const stocks = filteredStocks.value
  if (stocks.length === 0) return 0
  return (stocks.reduce((sum, s) => sum + s.turnover_rate, 0) / stocks.length).toFixed(2)
})

// 添加上涨股票比例计算
const upRatio = computed(() => {
  const total = totalStocks.value
  if (total === 0) return 0
  return (upCount.value / total * 100)
})

// // 在现有的计算属性下方添加新的统计指标计算
// const avgChange60Day = computed(() => {
//   const stocks = filteredStocks.value
//   if (stocks.length === 0) return 0
//   return stocks.reduce((sum, s) => sum + s.change_60day, 0) / stocks.length
// })

// const avgChangeYTD = computed(() => {
//   const stocks = filteredStocks.value
//   if (stocks.length === 0) return 0
//   return stocks.reduce((sum, s) => sum + s.change_ytd, 0) / stocks.length
// })

// const avgPERatio = computed(() => {
//   const stocks = filteredStocks.value.filter(s => s.pe_ratio > 0)
//   if (stocks.length === 0) return 0
//   return stocks.reduce((sum, s) => sum + s.pe_ratio, 0) / stocks.length
// })

// const avgPBRatio = computed(() => {
//   const stocks = filteredStocks.value.filter(s => s.pb_ratio > 0)
//   if (stocks.length === 0) return 0
//   return stocks.reduce((sum, s) => sum + s.pb_ratio, 0) / stocks.length
// })

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisible = 7
  
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, current - half)
  let end = Math.min(total, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 方法
const fetchStocks = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('http://localhost:5001/api/sh-a/realtime')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    if (data.code === 200) {
      stocks.value = data.data.stocks
    } else {
      throw new Error(data.message || '获取数据失败')
    }
  } catch (err) {
    console.error('获取股票数据失败:', err)
    error.value = err instanceof Error ? err.message : '获取数据失败'
    // 模拟数据用于演示
    stocks.value = generateMockData()
  } finally {
    loading.value = false
  }
}

const generateMockData = (): Stock[] => {
  const mockStocks: Stock[] = []
  const stockNames = [
    '浦发银行', '华夏银行', '民生银行', '招商银行', '兴业银行', '平安银行', '工商银行',
    '建设银行', '农业银行', '中国银行', '交通银行', '中信银行', '光大银行', '北京银行',
    '南京银行', '宁波银行', '江苏银行', '杭州银行', '上海银行', '贵阳银行', '成都银行',
    '郑州银行', '长沙银行', '西安银行', '青岛银行', '重庆银行', '苏州银行', '紫金银行',
    '青岛农商银行', '无锡银行', '江阴银行', '张家港行', '常熟银行', '苏农银行', '吴江银行',
    '瑞丰银行', '齐鲁银行', '沪农商行', '重庆农商银行', '广州农商银行', '九台农商银行'
  ]

  for (let i = 0; i < 50; i++) {
    const basePrice = 5 + Math.random() * 50
    const changePercent = (Math.random() - 0.5) * 20
    
    mockStocks.push({
      code: `600${String(i + 1).padStart(3, '0')}`,
      name: stockNames[i] || `测试股票${i + 1}`,
      latest_price: basePrice,
      change_percent: changePercent,
      change_amount: basePrice * changePercent / 100,
      volume: Math.floor(Math.random() * 10000000),
      amount: Math.floor(Math.random() * 1000000000),
      amplitude: Math.random() * 10,
      high: basePrice * (1 + Math.random() * 0.1),
      low: basePrice * (1 - Math.random() * 0.1),
      open: basePrice * (1 + (Math.random() - 0.5) * 0.05),
      close: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      volume_ratio: 0.5 + Math.random() * 2,
      turnover_rate: 0.1 + Math.random() * 10,
      pe_ratio: 5 + Math.random() * 30,
      pb_ratio: 0.5 + Math.random() * 3,
      total_market_cap: 10 + Math.random() * 1000,
      circulation_market_cap: 10 + Math.random() * 1000,
      speed: (Math.random() - 0.5) * 2,
      change_5min: (Math.random() - 0.5) * 5,
      change_60day: (Math.random() - 0.5) * 30,
      change_ytd: (Math.random() - 0.5) * 50,
      timestamp: new Date().toISOString()
    })
  }
  
  return mockStocks
}

const handleSearch = () => {
  currentPage.value = 1
}

// 在searchParams定义之后添加
const visibleColumns = ref<string[]>([
  'code', 'name', 'latest_price', 'change_percent', 'change_amount', 
  'volume', 'amount', 'turnover_rate', 'circulation_market_cap'
])

const availableColumns = [
  { key: 'code', label: '股票代码' },
  { key: 'name', label: '股票名称' },
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
    minTurnover: '',
    maxTurnover: '',
    minMarketCap: '',
    maxMarketCap: '',
    minChange: '',
    maxChange: ''
  }
  visibleColumns.value = [
    'code', 'name', 'latest_price', 'change_percent', 'change_amount', 
    'volume', 'amount', 'turnover_rate', 'circulation_market_cap'
  ]
  currentPage.value = 1
}

const refreshData = () => {
  fetchStocks()
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return ''
  return sortOrder.value === 'asc' ? 'asc' : 'desc'
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const viewDetails = (code: string) => {
  router.push(`/analysis/technical?code=${code}`)
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
watch([searchParams], () => {
  currentPage.value = 1
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
  padding: 20px;
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-card h3 {
  margin-bottom: 20px;
  color: #1a1a1a;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.search-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
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

.range-input span {
  color: #666;
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
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  color: #666;
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

.table-container {
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table th,
.stock-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.stock-table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
}

.stock-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.stock-table th.sortable:hover {
  background: #f5f5f5;
}

.sort-icon {
  display: inline-block;
  margin-left: 4px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}

.sort-icon.asc {
  border-bottom: 4px solid #1890ff;
}

.sort-icon.desc {
  border-top: 4px solid #1890ff;
}

.stock-table tr:hover {
  background: #fafafa;
}

.stock-table tr.up-row {
  background: #fff2f0;
}

.stock-table tr.down-row {
  background: #f6ffed;
}

.stock-table .code {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #1890ff;
}

.stock-table .name {
  font-weight: 500;
}

.stock-table .price {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.stock-table .change {
  font-weight: bold;
}

.stock-table .volume,
.stock-table .amount,
.stock-table .turnover,
.stock-table .pe-ratio,
.stock-table .pb-ratio,
.stock-table .market-cap {
  font-family: 'Courier New', monospace;
}

.stock-table .actions {
  text-align: center;
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
  flex-wrap: wrap;
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #666;
  min-width: 36px;
  text-align: center;
}

.btn-page:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-page:disabled {
  cursor: not-allowed;
  opacity: 0.4;
  background: #f5f5f5;
}

.btn-page.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
  font-weight: 600;
}

.page-numbers {
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-info {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .pagination {
    gap: 8px;
    margin: 16px 0;
  }
  
  .btn-page {
    padding: 6px 12px;
    font-size: 13px;
    min-width: 32px;
  }
  
  .page-numbers {
    order: 0;
    gap: 2px;
  }
  
  .page-info {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
    font-size: 13px;
  }
  
  .pagination {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pagination {
    gap: 6px;
  }
  
  .btn-page {
    padding: 5px 10px;
    font-size: 12px;
    min-width: 28px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-info {
    font-size: 12px;
  }
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
</style>