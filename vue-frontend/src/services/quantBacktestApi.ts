import axios from './axiosConfig'

/**
 * 量化回测相关API接口
 * 功能：
 * 1. 获取策略列表
 * 2. 创建回测任务
 * 3. 运行回测任务
 * 4. 获取回测任务状态
 * 5. 获取回测结果
 */

// 策略接口类型定义
export interface Strategy {
  name: string
  description: string
  params?: Record<string, {
    type: 'int' | 'float' | 'string' | 'boolean'
    description: string
    default: any
  }>
}

// 回测任务创建参数
export interface BacktestCreateParams {
  strategy_name: string
  stock_code: string
  start_date: string
  end_date: string
  initial_cash: number
  strategy_params: Record<string, any>
}

// 回测任务信息
export interface BacktestTask {
  task_id: string
  status: 'created' | 'running' | 'completed' | 'failed'
}

// 回测结果
export interface BacktestResult {
  task_info: {
    task_id: string
    strategy_name: string
    stock_code: string
    stock_name: string
    start_date: string
    end_date: string
    initial_cash: number
    commission: number
    strategy_params: Record<string, any>
    created_at: string
    completed_at: string
  }
  performance: {
    initial_value: number
    final_value: number
    total_return: number
    annual_return: number
    sharpe_ratio: number | null
    max_drawdown: number
    volatility: number | null
    total_trades: number
    winning_trades: number
    losing_trades: number
    win_rate: number | null
  }
  detailed_data: {
    daily_returns: any[]
    portfolio_values: Array<{
      date: string
      value: number
    }>
    trade_records: Array<{
      size: number
      type: 'buy' | 'sell'
      price: number
      value: number
      datetime: string
      commission: number
    }>
  }
  // 保持向后兼容性
  portfolio_value?: Array<{
    date: string
    value: number
  }>
  trades?: Array<{
    date: string
    action: 'buy' | 'sell'
    price: number
    quantity: number
    amount: number
  }>
}

/**
 * 获取策略列表
 * @returns Promise<Strategy[]> 策略列表
 */
export const getStrategies = async (): Promise<Strategy[]> => {
  const response = await axios.get('/django/api/quant/strategies/')
  return response.data.strategies
}

/**
 * 创建回测任务
 * @param params 回测任务创建参数
 * @returns Promise<BacktestTask> 回测任务信息
 */
export const createBacktestTask = async (params: BacktestCreateParams): Promise<BacktestTask> => {
  const response = await axios.post('/django/api/quant/backtest/create/', params)
  return response.data
}

/**
 * 运行回测任务
 * @param taskId 任务ID
 * @returns Promise<BacktestTask> 回测任务信息
 */
export const runBacktestTask = async (taskId: string): Promise<BacktestTask> => {
  const response = await axios.post(`/django/api/quant/backtest/${taskId}/run/`)
  return response.data
}

/**
 * 获取回测任务状态
 * @param taskId 任务ID
 * @returns Promise<BacktestTask> 回测任务状态
 */
export const getBacktestStatus = async (taskId: string): Promise<BacktestTask> => {
  const response = await axios.get(`/django/api/quant/backtest/${taskId}/status/`)
  return response.data
}

/**
 * 获取回测结果
 * @param taskId 任务ID
 * @returns Promise<BacktestResult> 回测结果
 */
export const getBacktestResult = async (taskId: string): Promise<BacktestResult> => {
  const response = await axios.get(`/django/api/quant/backtest/${taskId}/result/`)
  return response.data
}