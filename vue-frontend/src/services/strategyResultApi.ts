/**
 * 策略结果API服务
 * 功能：
 * 1. 获取策略结果列表（支持分页和搜索）
 * 2. 获取单个策略结果详情
 * 3. 创建策略结果
 * 4. 更新策略结果
 * 5. 删除策略结果
 */
import axios from './axiosConfig'

// 策略结果基本信息接口
export interface StrategyResult {
  id: number
  strategy_name: string
  strategy_description: string
  strategy_result: SelectedStock[]
  created_at: string
  updated_at: string
}

// 选股结果接口
export interface SelectedStock {
  stock_code: string
  stock_name: string
  buy_signal: string
  [key: string]: any // 支持其他动态字段
}

// 策略结果列表响应接口
export interface StrategyResultListResponse {
  code: number
  message: string
  timestamp: string
  data: {
    total: number
    page: number
    page_size: number
    total_pages: number
    results: StrategyResult[]
  }
}

// 策略结果详情响应接口
export interface StrategyResultDetailResponse {
  code: number
  message: string
  timestamp: string
  data: StrategyResult
}

// 创建策略结果请求参数
export interface CreateStrategyResultRequest {
  strategy_name: string
  strategy_description: string
  strategy_result: SelectedStock[]
}

// 更新策略结果请求参数
export interface UpdateStrategyResultRequest {
  strategy_name?: string
  strategy_description?: string
  strategy_result?: SelectedStock[]
}

// 分页参数接口
export interface PageParams {
  page?: number
  page_size?: number
}

// 策略结果列表查询参数
export interface StrategyResultListParams extends PageParams {
  strategy_name?: string // 策略名称关键词筛选
}

// API基础URL
const API_BASE_URL = '/django/api/individual_stock/strategy-results'

/**
 * 获取策略结果列表
 * @param params 查询参数
 * @returns Promise<StrategyResultListResponse> 策略结果列表
 */
export const getStrategyResultList = async (params: StrategyResultListParams = {}): Promise<StrategyResultListResponse> => {
  const response = await axios.get<StrategyResultListResponse, StrategyResultListResponse>(`${API_BASE_URL}/`, {
    params: {
      page: params.page || 1,
      page_size: params.page_size || 20,
      strategy_name: params.strategy_name
    }
  })
  return response
}

/**
 * 获取单个策略结果详情
 * @param resultId 策略结果ID
 * @returns Promise<StrategyResultDetailResponse> 策略结果详情
 */
export const getStrategyResultDetail = async (resultId: number): Promise<StrategyResultDetailResponse> => {
  const response = await axios.get<StrategyResultDetailResponse, StrategyResultDetailResponse>(`${API_BASE_URL}/${resultId}/`)
  return response
}

/**
 * 创建策略结果
 * @param data 创建请求数据
 * @returns Promise<StrategyResultDetailResponse> 创建的策略结果
 */
export const createStrategyResult = async (data: CreateStrategyResultRequest): Promise<StrategyResultDetailResponse> => {
  const response = await axios.post<StrategyResultDetailResponse>(`${API_BASE_URL}/`, data)
  return response.data
}

/**
 * 完整更新策略结果
 * @param resultId 策略结果ID
 * @param data 更新请求数据
 * @returns Promise<StrategyResultDetailResponse> 更新后的策略结果
 */
export const updateStrategyResult = async (resultId: number, data: CreateStrategyResultRequest): Promise<StrategyResultDetailResponse> => {
  const response = await axios.put<StrategyResultDetailResponse>(`${API_BASE_URL}/${resultId}/`, data)
  return response.data
}

/**
 * 部分更新策略结果
 * @param resultId 策略结果ID
 * @param data 部分更新请求数据
 * @returns Promise<StrategyResultDetailResponse> 更新后的策略结果
 */
export const patchStrategyResult = async (resultId: number, data: UpdateStrategyResultRequest): Promise<StrategyResultDetailResponse> => {
  const response = await axios.patch<StrategyResultDetailResponse>(`${API_BASE_URL}/${resultId}/`, data)
  return response.data
}

/**
 * 删除策略结果
 * @param resultId 策略结果ID
 * @returns Promise<{code: number, message: string, timestamp: string, data: {deleted_id: number, strategy_name: string}}> 删除结果
 */
export const deleteStrategyResult = async (resultId: number): Promise<{
  code: number
  message: string
  timestamp: string
  data: {
    deleted_id: number
    strategy_name: string
  }
}> => {
  const response = await axios.delete(`${API_BASE_URL}/${resultId}/`)
  return response.data
}