import axios from 'axios';

// API基础URL
const API_BASE_URL = '/api';

// 用户接口定义
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  inviteCode: string;
}

// 登录请求接口
export interface LoginRequest {
  email: string;
  password: string;
}

// 认证响应接口
export interface AuthResponse {
  token: string;
  user: User;
}

// 邀请码验证响应
export interface InviteCodeResponse {
  valid: boolean;
  message: string;
}

/**
 * 用户注册
 * @param data 注册信息
 * @returns 认证响应
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
}

/**
 * 用户登录
 * @param data 登录信息
 * @returns 认证响应
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 验证邀请码
 * @param inviteCode 邀请码
 * @returns 邀请码验证响应
 */
export async function validateInviteCode(inviteCode: string): Promise<InviteCodeResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/invite-code/validate`, {
      params: { code: inviteCode }
    });
    return response.data;
  } catch (error) {
    console.error('邀请码验证失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 检查用户是否已认证
 * @returns 是否已认证
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * 登出
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}