import axios from './axiosConfig'
import type { AxiosResponse } from 'axios'

// API基础URL
export const API_BASE_URL = '/django/api/forum'

// 论坛帖子类型定义
export interface Post {
  id: number
  title: string
  content?: string
  author: string
  created_at: string
  updated_at?: string
  comment_count?: number
}

// 评论类型定义
export interface Comment {
  id: number
  content: string
  author: string
  created_at: string
}

// 分页信息类型定义
export interface PageInfo {
  current: number
  total_pages: number
  total_items: number
  has_next: boolean
  has_previous: boolean
}

// 帖子列表响应类型
export interface PostListResponse {
  posts: Post[]
  page: PageInfo
}

// 帖子详情响应类型
export interface PostDetailResponse {
  post: Post
  comments: Comment[]
}

// 获取帖子列表
export const getPostList = async (page: number = 1, per_page: number = 10): Promise<PostListResponse> => {
  // 这行代码使用axios发送GET请求获取帖子列表
  // axios.get<请求数据类型, 响应数据类型>
  // 第一个泛型参数any表示请求体类型(GET请求通常为空)
  // 第二个泛型参数PostListResponse指定了返回数据的类型
  const response = await axios.get(`${API_BASE_URL}/posts/`, {
    params: { page, per_page }
  })
  return response.data
}

// 获取帖子详情
export const getPostDetail = async (postId: number): Promise<PostDetailResponse> => {
  const response = await axios.get(`${API_BASE_URL}/posts/${postId}/`)
  return response.data
}

// 创建帖子
export const createPost = async (title: string, content: string): Promise<Post> => {
  interface CreatePostResponse { post: Post }

  // 后端会从认证信息中获取当前用户，不需要在请求中携带用户名
  const response = await axios.post<any, CreatePostResponse>(`${API_BASE_URL}/posts/create/`, {
    title,
    content,
  })
  return response.post
}

// 删除帖子
export const deletePost = async (postId: number): Promise<{ message: string }> => {
  const response = await axios.delete<any, { message: string }>(`${API_BASE_URL}/posts/${postId}/delete/`)
  return response
}

// 添加评论
export const addComment = async (postId: number, content: string): Promise<{ message: string, comment: Comment }> => {
  const response = await axios.post<any, AxiosResponse<{ message: string, comment: Comment }>>(`${API_BASE_URL}/posts/${postId}/comment/`, {
    content
  })
  return response.data
}