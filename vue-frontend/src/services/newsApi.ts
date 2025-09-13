// CCTV新闻API服务
import axios from './axiosConfig';

// API基础URL
const API_BASE_URL = '/django/api/news';

// 新闻项接口定义
export interface NewsItem {
  id: number
  title: string
  content: string
  ai_content: string
  publish_date: string
  created_at: string
  updated_at: string
}

// API响应接口定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  timestamp: string
  data?: T
}

interface NewsListResponse {
  total: number
  news: NewsItem[]
  limit: number
  offset: number
}

// 获取新闻列表
export async function getNewsList(limit: number = 10, offset: number = 0, keyword?: string): Promise<NewsListResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, {
      params: {
        limit,
        offset,
        keyword
      }
    })
    return response.data
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    throw error
  }
}

// 获取新闻详情
export async function getNewsDetail(id: number | string): Promise<NewsItem> {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error('获取新闻详情失败:', error)
    throw error
  }
}

// 获取最新新闻
export async function getLatestNews(limit: number = 5): Promise<ApiResponse<{total: number, items: NewsItem[]}>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest`, {
      params: {
        limit
      }
    })
    return response.data
  } catch (error) {
    console.error('获取最新新闻失败:', error)
    throw error
  }
}

// 搜索新闻
export async function searchNews(keyword: string, limit: number = 20): Promise<ApiResponse<{total: number, keyword: string, items: NewsItem[]}>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: {
        keyword,
        limit
      }
    })
    return response.data
  } catch (error) {
    console.error('搜索新闻失败:', error)
    throw error
  }
}