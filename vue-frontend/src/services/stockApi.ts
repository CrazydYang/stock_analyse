// 股票数据API服务

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
  industry?: string
}

export interface StocksApiResponse {
  code: number
  message: string
  data: {
    total: number
    stocks: Stock[]
  }
}

export interface SearchParams {
  code: string
  name: string
  minPrice: string
  maxPrice: string
  minPE: string
  maxPE: string
  minMarketCap: string
  maxMarketCap: string
  minChange: string
  maxChange: string
}

export interface StockTypeInfo {
  code: string
  name: string
  industry: string
  sector: string
  board: string
  market: string
  list_date: string
  total_shares: number
  circulating_shares: number
  timestamp: string
}

export interface StockTypeApiResponse {
  code: number
  message: string
  data: StockTypeInfo
}

export interface StockValueData {
  "PE(TTM)": number
  "PE(静)": number
  "PEG值": number
  date: string
  市净率: number
  市现率: number
  市销率: number
  当日收盘价: number
  当日涨跌幅: number
  总市值: number
  总股本: number
  数据日期: number
  流通市值: number
  流通股本: number
}

export interface StockValueApiResponse {
  code: number
  message: string
  data: StockValueData[]
  timestamp: string
}

export interface StockFundFlowData {
  date: string
  "中单净流入-净占比": number
  "中单净流入-净额": number
  "主力净流入-净占比": number
  "主力净流入-净额": number
  "大单净流入-净占比": number
  "大单净流入-净额": number
  "小单净流入-净占比": number
  "小单净流入-净额": number
  "收盘价": number
  "日期": number
  "涨跌幅": number
  "超大单净流入-净占比": number
  "超大单净流入-净额": number
}

export interface StockFundFlowApiResponse {
  code: number
  message: string
  data: StockFundFlowData[]
  timestamp: string
}

// API基础URL
const API_BASE_URL = '/api'

/**
 * 获取单个股票的估值数据
 * @param code 股票代码
 * @returns Promise<StockValueData[]> 股票估值数据
 */
export async function fetchStockValueData(code: string): Promise<StockValueData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sh-a/stock/${code}/stock_value_em`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: StockValueApiResponse = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.message || '获取股票估值数据失败')
    }
    
    return result.data
  } catch (error) {
    console.error(`获取股票 ${code} 估值数据失败:`, error)
    throw error
  }
}

/**
 * 获取单个股票的行业信息
 * @param code 股票代码
 * @returns Promise<StockTypeInfo> 股票行业信息
 */
export async function fetchStockTypeInfo(code: string): Promise<StockTypeInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/sh-a/stock/${code}/type`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: StockTypeApiResponse = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.message || '获取股票行业信息失败')
    }
    
    return result.data
  } catch (error) {
    console.error(`获取股票 ${code} 行业信息失败:`, error)
    throw error
  }
}

/**
 * 获取单个股票的资金流向数据
 * @param code 股票代码
 * @returns Promise<StockFundFlowData[]> 股票资金流向数据
 */
export async function fetchStockFundFlowData(code: string): Promise<StockFundFlowData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sh-a/stock/${code}/stock_individual_fund_flow`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: StockFundFlowApiResponse = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.message || '获取股票资金流向数据失败')
    }
    
    return result.data
  } catch (error) {
    console.error(`获取股票 ${code} 资金流向数据失败:`, error)
    throw error
  }
}

/**
 * 获取沪A股票实时数据
 * @returns Promise<Stock[]> 股票数据数组
 */
export async function fetchStocksData(): Promise<Stock[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sh-a/realtime`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: StocksApiResponse = await response.json()
    
    if (data.code === 200) {
      return data.data.stocks
    } else {
      throw new Error(data.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取股票数据失败:', error)
    throw error
  }
}

/**
 * 获取股票数据并补充行业信息
 * @returns Promise<Stock[]> 包含行业信息的股票数据数组
 */
/**
 * 为指定的股票列表获取行业信息
 * @param stocks 股票数据数组
 * @returns Promise<Stock[]> 包含行业信息的股票数据数组
 */
export async function enrichStocksWithIndustryData(stocks: Stock[]): Promise<Stock[]> {
  const stocksWithIndustry = await Promise.all(
    stocks.map(async (stock) => {
      // 如果已经有行业信息，直接返回
      if (stock.industry && stock.industry !== '加载中...') {
        return stock
      }
      
      try {
        const typeInfo = await fetchStockTypeInfo(stock.code)
        return { ...stock, industry: typeInfo.industry }
      } catch (error) {
        console.warn(`获取股票 ${stock.code} 行业信息失败:`, error)
        return { ...stock, industry: '未知' }
      }
    })
  )
  
  return stocksWithIndustry
}

export async function fetchStocksWithIndustryData(): Promise<Stock[]> {
  try {
    const stocks = await fetchStocksData()
    
    // 为所有股票设置初始的行业信息为"加载中..."
    const stocksWithPlaceholder = stocks.map(stock => ({ ...stock, industry: '加载中...' }))
    
    return stocksWithPlaceholder
  } catch (error) {
    console.error('获取股票数据失败:', error)
    throw error
  }
}

/**
 * 根据搜索参数过滤股票数据
 * @param stocks 股票数据数组
 * @param searchParams 搜索参数
 * @returns 过滤后的股票数据
 */
export function filterStocks(stocks: Stock[], searchParams: SearchParams): Stock[] {
  let result = [...stocks]

  // 搜索筛选
  if (searchParams.code) {
    result = result.filter(stock => stock.code.includes(searchParams.code))
  }
  if (searchParams.name) {
    result = result.filter(stock => stock.name.includes(searchParams.name))
  }
  if (searchParams.minPrice) {
    result = result.filter(stock => stock.latest_price >= parseFloat(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    result = result.filter(stock => stock.latest_price <= parseFloat(searchParams.maxPrice))
  }
  if (searchParams.minPE) {
    result = result.filter(stock => stock.pe_ratio >= parseFloat(searchParams.minPE))
  }
  if (searchParams.maxPE) {
    result = result.filter(stock => stock.pe_ratio <= parseFloat(searchParams.maxPE))
  }
  if (searchParams.minMarketCap) {
    result = result.filter(stock => stock.circulation_market_cap >= parseFloat(searchParams.minMarketCap))
  }
  if (searchParams.maxMarketCap) {
    result = result.filter(stock => stock.circulation_market_cap <= parseFloat(searchParams.maxMarketCap))
  }
  if (searchParams.minChange) {
    result = result.filter(stock => stock.change_percent >= parseFloat(searchParams.minChange))
  }
  if (searchParams.maxChange) {
    result = result.filter(stock => stock.change_percent <= parseFloat(searchParams.maxChange))
  }

  return result
}

/**
 * 对股票数据进行排序
 * @param stocks 股票数据数组
 * @param sortField 排序字段
 * @param sortOrder 排序方向
 * @returns 排序后的股票数据
 */
export function sortStocks(stocks: Stock[], sortField: string, sortOrder: 'asc' | 'desc'): Stock[] {
  if (!sortField) return stocks

  return [...stocks].sort((a, b) => {
    const aValue = (a as any)[sortField]
    const bValue = (b as any)[sortField]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })
}

/**
 * 计算股票统计数据
 * @param stocks 股票数据数组
 * @returns 统计数据对象
 */
export function calculateStockStats(stocks: Stock[]) {
  const total = stocks.length
  const upCount = stocks.filter(stock => stock.change_percent > 0).length
  const downCount = stocks.filter(stock => stock.change_percent < 0).length
  const flatCount = stocks.filter(stock => stock.change_percent === 0).length
  const upRatio = total > 0 ? (upCount / total * 100) : 0

  return {
    total,
    upCount,
    downCount,
    flatCount,
    upRatio
  }
}

/**
 * 格式化数值显示
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '--'
  return value.toFixed(decimals)
}

/**
 * 格式化市值显示
 * @param value 市值（元）
 * @returns 格式化后的字符串
 */
export function formatMarketCap(value: number): string {
  if (isNaN(value) || value === 0) return '--'
  
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`
  } else {
    return value.toString()
  }
}

/**
 * 格式化成交量显示
 * @param value 成交量
 * @returns 格式化后的字符串
 */
export function formatVolume(value: number): string {
  if (isNaN(value) || value === 0) return '--'
  
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`
  } else {
    return value.toString()
  }
}