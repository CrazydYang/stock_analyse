// 股票历史数据API服务
import axios from 'axios'

// API基础URL
const API_BASE_URL = '/django/api/individual_stock'

// 类型定义
export interface StockHistoryDataItem {
  stock_code: string
  stock_name: string
  date: string
  open_price: number
  close_price: number
  high_price: number
  low_price: number
  change_percent: number
  change_amount: number
  volume: number
  amount: number
  amplitude: number
  turnover_rate: number
  created_at: string
}

export interface StockHistoryApiResponse {
  code: number
  message: string
  data: StockHistoryDataItem[]
}

export interface StockInfoItem {
  code: string
  name: string
  industry: string
  total_shares: number
  circulating_shares: number
  list_date: string
  pe_ratio: number
  pb_ratio: number
  total_market_cap: number
  circulating_market_cap: number
  created_at: string
  updated_at: string
}

export interface StockInfoApiResponse {
  code: number
  message: string
  data: StockInfoItem
}

/**
 * 获取股票历史行情数据
 * @param stockCode 股票代码
 * @param startDate 开始日期，格式：YYYYMMDD
 * @param endDate 结束日期，格式：YYYYMMDD
 * @param adjust 复权类型，""为不复权，"qfq"为前复权，"hfq"为后复权
 * @returns Promise<StockHistoryDataItem[]> 股票历史数据
 */
export async function fetchStockHistoryData(
  stockCode: string,
  startDate?: string,
  endDate?: string,
  adjust: string = ''
): Promise<StockHistoryDataItem[]> {
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    if (adjust) params.append('adjust', adjust)
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const url = `${API_BASE_URL}/stocks/${stockCode}/history/${queryString}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: StockHistoryApiResponse = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.message || '获取股票历史数据失败')
    }
    
    return result.data
  } catch (error) {
    console.error(`获取股票 ${stockCode} 历史数据失败:`, error)
    throw error
  }
}

/**
 * 获取股票详细信息
 * @param stockCode 股票代码
 * @returns Promise<StockInfoItem> 股票详细信息
 */
export async function fetchStockInfo(stockCode: string): Promise<StockInfoItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${stockCode}/info/`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: StockInfoApiResponse = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.message || '获取股票详细信息失败')
    }
    
    return result.data
  } catch (error) {
    console.error(`获取股票 ${stockCode} 详细信息失败:`, error)
    throw error
  }
}

/**
 * 获取股票列表
 * @param page 页码
 * @param pageSize 每页记录数
 * @returns Promise<{total: number, data: StockInfoItem[]}> 股票列表数据
 */
export async function fetchStockList(
  page: number = 1,
  pageSize: number = 20
): Promise<{total: number, data: StockInfoItem[]}> {
  try {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('page_size', pageSize.toString())
    
    const response = await fetch(`${API_BASE_URL}/stocks/?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.code !== 200) {
      throw new Error(result.message || '获取股票列表失败')
    }
    
    return {
      total: result.data.total,
      data: result.data.data
    }
  } catch (error) {
    console.error('获取股票列表失败:', error)
    throw error
  }
}

/**
 * 格式化日期为YYYYMMDD格式
 * @param date Date对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}${month}${day}`
}

/**
 * 获取N天前的日期
 * @param days 天数
 * @returns Date对象
 */
export function getDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}