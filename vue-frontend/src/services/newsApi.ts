// CCTV新闻API服务

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
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface NewsListResponse {
  total: number
  items: NewsItem[]
  limit: number
  offset: number
}

// 获取新闻列表
export async function getNewsList(limit: number = 10, offset: number = 0, keyword?: string): Promise<ApiResponse<NewsListResponse>> {
  try {
    const url = `/api/cctv_news/?limit=${limit}&offset=${offset}`
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    throw error
  }
}

// 获取新闻详情
export async function getNewsDetail(id: number | string): Promise<ApiResponse<NewsItem>> {
  try {
    const response = await fetch(`/api/cctv_news/${id}`)
    return await response.json()
  } catch (error) {
    console.error('获取新闻详情失败:', error)
    throw error
  }
}

// 获取最新新闻
export async function getLatestNews(limit: number = 5): Promise<ApiResponse<{total: number, items: NewsItem[]}>> {
  try {
    const response = await fetch(`http://127.0.0.1:5001/api/cctv_news/latest?limit=${limit}`)
    return await response.json()
  } catch (error) {
    console.error('获取最新新闻失败:', error)
    throw error
  }
}

// 搜索新闻
export async function searchNews(keyword: string, limit: number = 20): Promise<ApiResponse<{total: number, keyword: string, items: NewsItem[]}>> {
  try {
    const response = await fetch(`http://127.0.0.1:5001/api/cctv_news/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`)
    return await response.json()
  } catch (error) {
    console.error('搜索新闻失败:', error)
    throw error
  }
}