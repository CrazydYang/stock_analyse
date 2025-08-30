// 行业数据API服务

// 类型定义
export interface Stock {
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

export interface Industry {
  industry: string
  count: number
  stocks: Stock[]
  avgChangePercent?: number
  avgPeRatio?: number
  avgPbRatio?: number
  avgChange60Day?: number
  avgChangeYtd?: number
}

export interface ApiResponse {
  code: number
  message: string
  data: {
    total: number
    industries: Industry[]
  }
}

export interface StocksApiResponse {
  code: number
  message: string
  data: {
    total: number
    stocks: Stock[]
  }
}

// API配置
const API_BASE_URL = '/api'

/**
 * 获取行业数据
 */
export async function fetchIndustriesData(): Promise<Industry[]> {
  try {
    // 获取行业数据
    const response = await fetch(`${API_BASE_URL}/sh-a/industries`)
    const data: ApiResponse = await response.json()
    
    if (data.code !== 200 || !data.data || !data.data.industries) {
      throw new Error(data.message || '获取行业数据失败')
    }
    
    const industriesData = data.data.industries
    
    // 获取实时股票数据，用于计算涨跌幅
    const stocksResponse = await fetch(`${API_BASE_URL}/sh-a/realtime`)
    const stocksData: StocksApiResponse = await stocksResponse.json()
    
    if (stocksData.code === 200 && stocksData.data && stocksData.data.stocks) {
      // 创建股票代码到股票数据的映射
      const stockMap = new Map<string, Stock>()
      stocksData.data.stocks.forEach((stock: Stock) => {
        stockMap.set(stock.code, stock)
      })
      
      // 为每个行业计算平均涨跌幅
      industriesData.forEach((industry: Industry) => {
        const stats = calculateIndustryStats(industry, stockMap)
        Object.assign(industry, stats)
      })
    }
    
    return industriesData
  } catch (error) {
    console.error('获取行业数据错误:', error)
    throw error
  }
}

/**
 * 计算行业统计数据
 */
function calculateIndustryStats(industry: Industry, stockMap: Map<string, Stock>) {
  let totalChangePercent = 0
  let totalPeRatio = 0
  let totalPbRatio = 0
  let totalChange60Day = 0
  let totalChangeYtd = 0
  let validStocksCount = 0
  let validPeCount = 0
  let validPbCount = 0
  let valid60DayCount = 0
  let validYtdCount = 0
  
  // 使用行业中的股票列表计算平均值
  industry.stocks.forEach((stock: Stock) => {
    const stockData = stockMap.get(stock.code)
    if (stockData) {
      // 计算涨跌幅平均值
      if (typeof stockData.change_percent === 'number') {
        totalChangePercent += stockData.change_percent
        validStocksCount++
      }
      
      // 计算PE平均值
      if (typeof stockData.pe_ratio === 'number' && stockData.pe_ratio > 0) {
        totalPeRatio += stockData.pe_ratio
        validPeCount++
      }
      
      // 计算PB平均值
      if (typeof stockData.pb_ratio === 'number' && stockData.pb_ratio > 0) {
        totalPbRatio += stockData.pb_ratio
        validPbCount++
      }
      
      // 计算60天涨跌幅平均值
      if (typeof stockData.change_60day === 'number') {
        totalChange60Day += stockData.change_60day
        valid60DayCount++
      }
      
      // 计算年初至今涨跌幅平均值
      if (typeof stockData.change_ytd === 'number') {
        totalChangeYtd += stockData.change_ytd
        validYtdCount++
      }
    }
  })
  
  // 返回计算的平均值
  return {
    avgChangePercent: validStocksCount > 0 ? totalChangePercent / validStocksCount : 0,
    avgPeRatio: validPeCount > 0 ? totalPeRatio / validPeCount : 0,
    avgPbRatio: validPbCount > 0 ? totalPbRatio / validPbCount : 0,
    avgChange60Day: valid60DayCount > 0 ? totalChange60Day / valid60DayCount : 0,
    avgChangeYtd: validYtdCount > 0 ? totalChangeYtd / validYtdCount : 0
  }
}

/**
 * 获取单个行业的详细数据
 */
export async function fetchIndustryDetail(industryName: string): Promise<Industry | null> {
  try {
    const industries = await fetchIndustriesData()
    return industries.find(industry => industry.industry === industryName) || null
  } catch (error) {
    console.error('获取行业详情错误:', error)
    throw error
  }
}