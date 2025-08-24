<template>
  <div class="industry-analysis">

    <!-- 统计概览 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalIndustries }}</div>
          <div class="stat-label">行业总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalStocks }}</div>
          <div class="stat-label">股票总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ avgStocksPerIndustry }}</div>
          <div class="stat-label">平均行业股票数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ largestIndustry?.count || 0 }}</div>
          <div class="stat-label">最大行业股票数</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-card">
        <div class="search-row">
          <div class="search-item search-input-item">
            <label>行业搜索</label>
            <div class="search-input-wrapper">
              <input 
                v-model="searchKeyword" 
                placeholder="输入行业名称搜索..." 
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
          </div>
          <div class="search-item">
            <label>最小股票数</label>
            <input 
              v-model.number="minStockCount" 
              type="number" 
              placeholder="最小股票数" 
              class="search-input"
              min="0"
            />
          </div>
          <div class="search-item">
            <label>排序方式</label>
            <select v-model="sortBy" class="search-select">
              <option value="count">按股票数量</option>
              <option value="name">按行业名称</option>
              <option value="change">按涨跌幅排序</option>
            </select>
          </div>
          <div class="search-item">
            <label>排序顺序</label>
            <select v-model="sortOrder" class="search-select">
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>
        <div class="search-actions">
          <button @click="refreshData" class="btn btn-primary" :disabled="loading">
            <span class="icon-refresh" :class="{ spinning: loading }">↻</span>
            刷新数据
          </button>
          <button @click="resetSearch" class="btn btn-secondary">重置筛选</button>
          <button @click="exportData" class="btn btn-outline">导出数据</button>
        </div>
      </div>
    </div>

    <!-- 行业列表 -->
    <div class="list-section">
      <div class="list-header">
        <h2>行业分类详情</h2>
        <div class="list-actions">
          <span class="result-count">
            共找到 {{ filteredIndustries.length }} 个行业
          </span>
        </div>
      </div>

      <div class="table-container">
        <table class="industry-table">
          <thead>
            <tr>
              <th class="col-industry">行业名称</th>
              <th class="col-count">股票数量</th>
              <th class="col-percentage">市场占比</th>
              <th class="col-change">行业平均涨跌幅</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="industry in paginatedIndustries" 
              :key="industry.industry"
              class="table-row"
            >
              <td class="col-industry">
                <div class="industry-info">
                  <span class="industry-name">{{ industry.industry }}</span>
                </div>
              </td>
              <td class="col-count">
                <span class="count-badge">{{ industry.count }}</span>
              </td>
              <td class="col-percentage">
                <span class="percentage-value">{{ calculatePercentage(industry.count) }}%</span>
              </td>
              <td class="col-change">
                <span 
                  class="change-value" 
                  :class="{
                    'positive': industry.avgChangePercent > 0,
                    'negative': industry.avgChangePercent < 0,
                    'neutral': industry.avgChangePercent === 0
                  }"
                >
                  {{ formatChangePercent(industry.avgChangePercent) }}
                </span>
              </td>
              <td class="col-actions">
                <button 
                  class="btn-view"
                  @click="showIndustryDetail(industry)"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 空状态 -->
        <div v-if="filteredIndustries.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-text">暂无行业数据</div>
          <div class="empty-desc">请尝试刷新数据或调整搜索条件</div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="goToPage(1)" 
          :disabled="currentPage === 1" 
          class="btn-page"
        >
          首页
        </button>
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="btn-page"
        >
          上一页
        </button>
        
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
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="btn-page"
        >
          下一页
        </button>
        <button 
          @click="goToPage(totalPages)" 
          :disabled="currentPage === totalPages" 
          class="btn-page"
        >
          末页
        </button>
        
        <div class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </div>
      </div>
    </div>

    <!-- 行业详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedIndustry?.industry }} - 行业详情</h3>
          <button class="modal-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-stats">
            <div class="detail-item">
              <span class="label">行业名称:</span>
              <span class="value">{{ selectedIndustry?.industry }}</span>
            </div>
            <div class="detail-item">
              <span class="label">股票总数:</span>
              <span class="value">{{ selectedIndustry?.count }}只</span>
            </div>
            <div class="detail-item">
              <span class="label">市场占比:</span>
              <span class="value">{{ calculatePercentage(selectedIndustry?.count || 0) }}%</span>
            </div>
          </div>
          
          <div class="stock-list-detail">
            <h4>股票列表</h4>
            <div class="stock-table">
              <div class="table-header">
                <div class="table-cell">股票代码</div>
                <div class="table-cell">股票名称</div>
              </div>
              <div class="table-body">
                <div 
                  v-for="stock in selectedIndustry?.stocks" 
                  :key="stock.code"
                  class="table-row"
                >
                  <div class="table-cell">{{ stock.code }}</div>
                  <div class="table-cell">{{ stock.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载行业数据...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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

interface Industry {
  industry: string
  count: number
  stocks: Stock[]
}

interface ApiResponse {
  code: number
  message: string
  data: {
    total: number
    industries: Industry[]
  }
}

// 响应式数据
const industries = ref<Industry[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const minStockCount = ref<number>(0)
const sortBy = ref<'count' | 'name' | 'change'>('count')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = ref(12)
const showDetailModal = ref(false)
const selectedIndustry = ref<Industry | null>(null)

// 计算属性
const totalIndustries = computed(() => industries.value.length)
const totalStocks = computed(() => 
  industries.value.reduce((sum, industry) => sum + industry.count, 0)
)
const avgStocksPerIndustry = computed(() => 
  totalIndustries.value > 0 ? Math.round(totalStocks.value / totalIndustries.value) : 0
)
const largestIndustry = computed(() => 
  industries.value.reduce((max, industry) => 
    industry.count > max.count ? industry : max, 
    { industry: '', count: 0, stocks: [] }
  )
)

const filteredIndustries = computed(() => {
  let filtered = industries.value

  // 搜索过滤
  if (searchKeyword.value) {
    filtered = filtered.filter(industry => 
      industry.industry.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 最小股票数过滤
  if (minStockCount.value > 0) {
    filtered = filtered.filter(industry => industry.count >= minStockCount.value)
  }

  // 排序
  filtered.sort((a, b) => {
    let compareValue = 0
    if (sortBy.value === 'count') {
      compareValue = b.count - a.count
    } else if (sortBy.value === 'change') {
      // 处理可能的undefined或null值
      const aChange = a.avgChangePercent ?? 0
      const bChange = b.avgChangePercent ?? 0
      compareValue = bChange - aChange
    } else {
      compareValue = a.industry.localeCompare(b.industry)
    }
    return sortOrder.value === 'desc' ? compareValue : -compareValue
  })

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredIndustries.value.length / pageSize.value)
)

const paginatedIndustries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredIndustries.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 方法
const fetchIndustries = async () => {
  loading.value = true
  
  try {
    // 获取行业数据
    const response = await fetch('http://localhost:5001/api/sh-a/industries')
    const data: ApiResponse = await response.json()
    
    if (data.code === 200 && data.data && data.data.industries) {
      // 获取行业数据
      const industriesData = data.data.industries
      
      // 获取实时股票数据，用于计算涨跌幅
      const stocksResponse = await fetch('http://localhost:5001/api/sh-a/realtime')
      const stocksData = await stocksResponse.json()
      
      if (stocksData.code === 200 && stocksData.data && stocksData.data.stocks) {
        // 创建股票代码到股票数据的映射
        const stockMap = new Map()
        stocksData.data.stocks.forEach((stock: any) => {
          stockMap.set(stock.code, stock)
        })
        
        // 为每个行业计算平均涨跌幅
        industriesData.forEach((industry: Industry) => {
          let totalChangePercent = 0
          let validStocksCount = 0
          
          // 使用行业中的股票列表计算平均涨跌幅
          industry.stocks.forEach((stock: Stock) => {
            const stockData = stockMap.get(stock.code)
            if (stockData && typeof stockData.change_percent === 'number') {
              totalChangePercent += stockData.change_percent
              validStocksCount++
            }
          })
          
          // 计算平均值
          if (validStocksCount > 0) {
            industry.avgChangePercent = totalChangePercent / validStocksCount
          } else {
            industry.avgChangePercent = 0
          }
        })
      }
      
      industries.value = industriesData
    } else {
      console.error('获取行业数据失败:', data.message)
    }
  } catch (error) {
    console.error('获取行业数据错误:', error)
  } finally {
    loading.value = false
  }
}

const calculatePercentage = (count: number) => {
  return totalStocks.value > 0 ? ((count / totalStocks.value) * 100).toFixed(1) : '0.0'
}

// 格式化涨跌幅
const formatChangePercent = (percent: number | undefined) => {
  if (percent === undefined || percent === null) return '0.00%'
  const formattedValue = percent.toFixed(2)
  return percent > 0 ? `+${formattedValue}%` : `${formattedValue}%`
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetSearch = () => {
  searchKeyword.value = ''
  minStockCount.value = 0
  sortBy.value = 'count'
  sortOrder.value = 'desc'
  currentPage.value = 1
}

const refreshData = () => {
  fetchIndustries()
}

const handleSearch = () => {
  currentPage.value = 1
}

const exportData = () => {
  try {
    const dataToExport = filteredIndustries.value.map(industry => ({
      '行业名称': industry.industry,
      '股票数量': industry.count,
      '市场占比': calculatePercentage(industry.count) + '%',
      '代表股票': industry.stocks.slice(0, 5).map(stock => `${stock.name}(${stock.code})`).join(', ')
    }))
    
    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `行业分析数据_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出数据失败，请重试')
  }
}

const showIndustryDetail = (industry: Industry) => {
  selectedIndustry.value = industry
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedIndustry.value = null
}

// 生命周期
onMounted(() => {
  fetchIndustries()
})
</script>

<style scoped>
.industry-analysis {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 统计概览 */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 32px;
}

.search-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.search-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  align-items: end;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-item label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.search-input,
.search-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-input:focus,
.search-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

.search-input::placeholder {
  color: #999;
}

.search-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: end;
  flex-wrap: wrap;
}

/* 搜索输入框样式优化 */
.search-input-item {
  flex: 1;
  min-width: 250px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper .search-input {
  padding-right: 40px;
}

.search-icon {
  position: absolute;
  right: 12px;
  color: #999;
  pointer-events: none;
  font-size: 16px;
}

.search-input:focus + .search-icon {
  color: #1890ff;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff, #1890ff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #666;
  border: 2px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #d9d9d9;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #52c41a;
  border: 2px solid #52c41a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-outline:hover {
  background: #52c41a;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.icon-refresh.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 行业列表 */
.list-section {
  margin-bottom: 32px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.result-count {
  font-size: 14px;
  color: #666;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.table-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.industry-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.industry-table th,
.industry-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.industry-table th {
  background: linear-gradient(180deg, #fafafa, #f5f5f5);
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
  border-bottom: 2px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 10;
}

.industry-table .table-row {
  transition: all 0.2s ease;
}

.industry-table .table-row:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 列宽设置 */
.col-industry {
  width: 25%;
}

.col-count {
  width: 12%;
  text-align: center;
}

.col-percentage {
  width: 18%;
}

.col-stocks {
  width: 30%;
}

.col-actions {
  width: 15%;
  text-align: center;
}

/* 行业名称 */
.industry-info {
  display: flex;
  align-items: center;
}

.industry-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

/* 数量徽章 */
.count-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 百分比值 */
.percentage-value {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 涨跌幅值 */
.change-value {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.change-value.negative {
  background: #f0f9eb;
  color: #67C23A;
}

.change-value.positive {
  background: #fef0f0;
  color: #F56C6C;
}

.change-value.neutral {
  background: #f4f4f5;
  color: #909399;
}

/* 股票标签 */
.stock-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stock-tag {
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e8e8e8;
}

.more-stocks {
  background: #fafafa;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px dashed #ddd;
}

/* 操作按钮 */
.btn-view {
  padding: 8px 16px;
  background: transparent;
  color: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-view:hover {
  background: #1890ff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-input-item {
    grid-column: 1 / -1;
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .search-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .search-actions {
    justify-content: center;
    gap: 8px;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .industry-table {
    min-width: 600px;
  }
  
  .industry-table th,
  .industry-table td {
    padding: 12px 8px;
    font-size: 14px;
  }
  
  .col-industry {
    width: 30%;
  }
  
  .col-count {
    width: 15%;
  }
  
  .col-percentage {
    width: 20%;
  }
  
  .col-stocks {
    width: 25%;
  }
  
  .col-actions {
    width: 10%;
  }
  
  .stock-tags {
    gap: 4px;
  }
  
  .stock-tag {
    font-size: 11px;
    padding: 2px 6px;
  }
  
  .btn-view {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .industry-table th,
  .industry-table td {
    padding: 10px 6px;
    font-size: 13px;
  }
  
  .col-industry {
    width: 35%;
  }
  
  .col-count {
    width: 12%;
  }
  
  .col-percentage {
    display: none;
  }
  
  .col-stocks {
    width: 30%;
  }
  
  .col-actions {
    width: 15%;
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.empty-desc {
  font-size: 14px;
  color: #999;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 32px 0;
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

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-close:hover {
  color: #666;
}

.modal-body {
  padding: 24px;
}

.detail-stats {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 600;
  color: #333;
}

.detail-item .value {
  color: #666;
}

.stock-list-detail h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.stock-table {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.stock-table .table-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f5f5f5;
  font-weight: 600;
}

.stock-table .table-body {
  max-height: 300px;
  overflow-y: auto;
}

.stock-table .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.stock-table .table-cell {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.stock-table .table-row:nth-child(even) {
  background: #fafafa;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .industry-analysis {
    padding: 16px;
  }
  
  .header h1 {
    font-size: 28px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .search-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .industry-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    gap: 8px;
  }
  
  .btn-page {
    padding: 6px 12px;
    font-size: 13px;
    min-width: 32px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.industry-table {
  width: 100%;
  border-collapse: collapse;
}

.industry-table th,
.industry-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.industry-table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.industry-table .table-row:hover {
  background: #f8f9fa;
}

/* 列宽设置 */
.col-industry {
  width: 25%;
}

.col-count {
  width: 12%;
  text-align: center;
}

.col-percentage {
  width: 18%;
}

.col-stocks {
  width: 30%;
}

.col-actions {
  width: 15%;
  text-align: center;
}

/* 行业名称 */
.industry-info {
  display: flex;
  align-items: center;
}

.industry-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

/* 数量徽章 */
.count-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 已移除进度条样式，改为使用百分比值 */

.percentage-value {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

/* 股票标签 */
.stock-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stock-tag {
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e8e8e8;
}

.more-stocks {
  background: #fafafa;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px dashed #ddd;
}

/* 操作按钮 */
.btn-view {
  padding: 8px 16px;
  background: transparent;
  color: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-view:hover {
  background: #1890ff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}


/* 响应式表格 */
  @media (max-width: 768px) {
    .table-container {
      overflow-x: auto;
    }
    
    .industry-table {
      min-width: 600px;
    }
    
    .industry-table th,
    .industry-table td {
      padding: 12px 8px;
      font-size: 14px;
    }
    
    .col-industry {
      width: 30%;
    }
    
    .col-count {
      width: 15%;
    }
    
    .col-percentage {
      width: 20%;
    }
    
    .col-stocks {
      width: 25%;
    }
    
    .col-actions {
      width: 10%;
    }
    
    .stock-tags {
      gap: 4px;
    }
    
    .stock-tag {
      font-size: 11px;
      padding: 2px 6px;
    }
    
    .btn-view {
      padding: 6px 12px;
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .industry-table th,
    .industry-table td {
      padding: 10px 6px;
      font-size: 13px;
    }
    
    .col-industry {
      width: 35%;
    }
    
    .col-count {
      width: 12%;
    }
    
    .col-percentage {
      display: none;
    }
    
    .col-stocks {
      width: 30%;
    }
    
    .col-actions {
      width: 15%;
    }
  }
  </style>