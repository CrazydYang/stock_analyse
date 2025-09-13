// 股票策略API服务
import axios from './axiosConfig'

// 指数RPS强度排名接口类型定义
export interface IndexRpsItem {
  指数代码: string
  指数简称: string
  [key: string]: any // 动态属性，包含不同周期的涨跌幅和RPS值
}
// 独立出来的IndexRps数据结构
export interface IndexRpsData {
  total: number
  data: IndexRpsItem[]
  periods: number[]
  saved_count: number
  errors: string[]
  query_time: string
}

export interface IndexRpsResponse {
  code: number
  message: string
  timestamp: string
  data: IndexRpsData
}

// 历史RPS数据接口类型定义
export interface HistoricalRpsItem {
  index_code: string
  index_name: string
  period: number
  change_percent: number
  rps_value: number
  created_at: string
}

// 独立出来的HistoricalRps数据结构
export interface HistoricalRpsData {
  total: number
  data: HistoricalRpsItem[]
  period: number
  query_time: string
}

export interface HistoricalRpsResponse {
  code: number
  message: string
  timestamp: string
  data: HistoricalRpsData
}

/**
 * 获取实时指数RPS强度排名
 * @param periods 时间周期，多个周期用逗号分隔
 * @param save 是否保存到数据库
 * @returns Promise<IndexRpsResponse>
 */
export async function getIndexRps(periods: string = "5,20,60", save: boolean = false): Promise<IndexRpsData> {
  try {
    const response = await axios.get<IndexRpsData>(
      `/django/api/strategy/index-rps/`,
      {
        params: {
          periods,
          save
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('获取实时指数RPS强度排名失败:', error)
    throw error
  }
}

/**
 * 获取历史RPS数据
 * @param period 时间周期
 * @param limit 返回数量限制
 * @param offset 偏移量
 * @returns Promise<HistoricalRpsResponse>
 */
export async function getHistoricalRps(
  period: number = 20,
  limit: number = 100,
  offset: number = 0
): Promise<HistoricalRpsResponse> {
  try {
    const response = await axios.get<HistoricalRpsResponse>(
      `/django/api/strategy/historical-rps/`,
      {
        params: {
          period,
          limit,
          offset
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('获取历史RPS数据失败:', error)
    throw error
  }
}