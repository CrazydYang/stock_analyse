// 行业换手率分位数API服务
import axios from './axiosConfig';

// API基础URL
const API_BASE_URL = '/django/api/strategy';

// 行业换手率分位数项接口定义
export interface IndustryTurnoverPercentileItem {
  date: string
  sector_code: string
  sector_name: string
  total_amount: number
  daily_total_amount: number
  turnover_ratio: number
  turnover_ratio_percentile: number
}

// API响应接口定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  timestamp: string
  data?: T
}

// 行业换手率分位数响应接口定义
export interface IndustryTurnoverPercentileResponse {
  code: number
  message: string
  data: {
    total: number
    data: IndustryTurnoverPercentileItem[]
  }
}

/**
 * 获取行业换手率分位数数据
 * @param startDate 开始日期，格式：YYYY-MM-DD
 * @param endDate 结束日期，格式：YYYY-MM-DD
 * @returns Promise<IndustryTurnoverPercentileResponse> 行业换手率分位数数据
 */
export async function fetchIndustryTurnoverPercentile(startDate: string, endDate: string): Promise<IndustryTurnoverPercentileResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/industry-turnover-percentile/`, {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    })
    
    return response.data
  } catch (error) {
    console.error('获取行业换手率分位数数据失败:', error)
    throw error
  }
}