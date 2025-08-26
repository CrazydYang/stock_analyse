import { ref, reactive } from 'vue';
import type { User } from './userApi';
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from './userApi';

// 创建响应式状态
const currentUser = ref<User | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// 初始化函数，从localStorage加载用户信息
export function initAuth() {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      currentUser.value = JSON.parse(userJson);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('user');
    }
  }
}

// 登录函数
export async function login(email: string, password: string) {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await apiLogin({ email, password });
    
    // 保存token和用户信息到localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // 更新当前用户
    currentUser.value = response.user;
    
    return response;
  } catch (e: any) {
    error.value = e.response?.data?.message || '登录失败，请检查您的凭据';
    throw e;
  } finally {
    isLoading.value = false;
  }
}

// 注册函数
export async function register(username: string, email: string, password: string, inviteCode: string) {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await apiRegister({ username, email, password, inviteCode });
    
    // 保存token和用户信息到localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // 更新当前用户
    currentUser.value = response.user;
    
    return response;
  } catch (e: any) {
    error.value = e.response?.data?.message || '注册失败，请稍后再试';
    throw e;
  } finally {
    isLoading.value = false;
  }
}

// 获取当前用户信息
export async function fetchCurrentUser() {
  isLoading.value = true;
  error.value = null;
  
  try {
    const user = await getCurrentUser();
    currentUser.value = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (e: any) {
    error.value = e.response?.data?.message || '获取用户信息失败';
    logout(); // 如果获取用户信息失败，则登出
    throw e;
  } finally {
    isLoading.value = false;
  }
}

// 登出函数
export function logout() {
  apiLogout();
  currentUser.value = null;
}

// 检查是否已认证
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// 导出状态
export { currentUser, isLoading, error };