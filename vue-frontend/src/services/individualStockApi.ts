import axios from './axiosConfig'

/**
 * 个股数据相关API接口
 * 功能：
 * 1. 获取股票列表
 * 2. 获取所有股票实时行情
 * 3. 获取单只股票实时行情
 * 4. 获取股票历史行情数据
 * 5. 获取股票详细信息
 * 6. 手动更新股票数据
 */

// API基础URL
const API_BASE_URL = '/django/api/individual_stock/stocks'

// 股票基本信息接口
export interface StockInfo {
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

// 股票实时行情接口
export interface StockRealtime {
  stock_code: string
  stock_name: string
  latest_price: number
  change_percent: number
  change_amount: number
  volume: number
  amount: number
  amplitude: number
  high: number
  low: number
  open_price: number
  close_price: number
  turnover_rate: number
  timestamp: string
}

// 股票历史行情接口
export interface StockHistory {
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

// 分页查询参数
export interface PageParams {
  page?: number
  page_size?: number
}

// 股票列表响应
export interface StockListResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  data: StockInfo[]
}

// 股票实时行情列表响应
export interface StockRealtimeListResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  data: StockRealtime[]
}

// 股票历史行情查询参数
export interface StockHistoryParams {
  start_date?: string
  end_date?: string
  adjust?: '' | 'qfq' | 'hfq'
}

// 股票数据更新参数
export interface StockUpdateParams {
  stock_code?: string
  update_type?: 'all' | 'realtime' | 'history'
  days?: number
}

// 股票数据更新响应
export interface StockUpdateResponse {
  result: {
    realtime: {
      updated: number
      created: number
      failed: number
    }
    history: {
      updated_stocks: number
      updated_history: number
    }
  }
}

// API响应基础接口
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 获取股票列表
 * @param params 分页参数
 * @returns Promise<StockListResponse> 股票列表
 */
export const getStockList = async (params: PageParams = {}): Promise<StockListResponse> => {
  const { page, page_size } = params
  const queryParams = new URLSearchParams()
  
  if (page !== undefined) {
    queryParams.append('page', page.toString())
  }
  
  if (page_size !== undefined) {
    queryParams.append('page_size', page_size.toString())
  }
  
  const queryString = queryParams.toString()
  const url = queryString ? `${API_BASE_URL}/?${queryString}` : `${API_BASE_URL}/`
  
  const response = await axios.get<StockListResponse>(url)
  return response.data
}

/**
 * 获取所有股票实时行情
 * @param params 分页参数
 * @returns Promise<StockRealtimeListResponse> 股票实时行情列表
 */
export const getAllStockRealtime = async (params: PageParams = {}): Promise<StockRealtimeListResponse> => {
  const response = await axios.get<ApiResponse<StockRealtimeListResponse>>(`${API_BASE_URL}/realtime/`, { params })
  return response.data.data
}

/**
 * 获取单只股票实时行情
 * @param stockCode 股票代码
 * @returns Promise<StockRealtime> 股票实时行情
 */
export const getStockRealtime = async (stockCode: string): Promise<StockRealtime> => {
  const response = await axios.get<StockRealtime>(`${API_BASE_URL}/${stockCode}/realtime/`)
  return response.data
}

/**
 * 获取股票历史行情数据
 * @param stockCode 股票代码
 * @param params 查询参数
 * @returns Promise<StockHistory[]> 股票历史行情数据
 */
export const getStockHistory = async (stockCode: string, params: StockHistoryParams = {}): Promise<StockHistory[]> => {
  const response = await axios.get<StockHistory[]>(`${API_BASE_URL}/${stockCode}/history/`, { params })
  return response.data
}

/**
 * 获取股票详细信息
 * @param stockCode 股票代码
 * @returns Promise<StockInfo> 股票详细信息
 */
export const getStockInfo = async (stockCode: string): Promise<StockInfo> => {
  const response = await axios.get<StockInfo>(`${API_BASE_URL}/${stockCode}/info/`)
  return response.data
}

/**
 * 手动更新股票数据
 * @param params 更新参数
 * @returns Promise<StockUpdateResponse> 更新结果
 */
export const updateStockData = async (params: StockUpdateParams = {}): Promise<StockUpdateResponse> => {
  const response = await axios.post<ApiResponse<StockUpdateResponse>>(`${API_BASE_URL}/update/`, params)
  return response.data.data
}