/**
 * 量化策略API服务
 * 提供与量化策略后端API的交互功能
 */

// 基础URL
const BASE_URL = '/django/api/quant';

/**
 * 策略参数类型定义
 */
export interface StrategyParam {
  type: string;
  default: any;
  description: string;
}

/**
 * 策略信息类型定义
 */
export interface StrategyInfo {
  name: string;
  description: string;
  params: Record<string, StrategyParam>;
}

/**
 * 回测任务类型定义
 */
export interface BacktestTask {
  task_id: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  progress?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string | null;
}

/**
 * 回测性能指标类型定义
 */
export interface BacktestPerformance {
  total_return: number;
  annual_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  win_rate: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
}

/**
 * 投资组合价值类型定义
 */
export interface PortfolioValue {
  date: string;
  value: number;
}

/**
 * 交易记录类型定义
 */
export interface TradeRecord {
  date: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  amount: number;
}

/**
 * 回测结果类型定义
 */
export interface BacktestResult {
  task_id: string;
  strategy_name: string;
  symbol: string;
  period: {
    start_date: string;
    end_date: string;
  };
  performance: BacktestPerformance;
  portfolio_value: PortfolioValue[];
  trades: TradeRecord[];
}

/**
 * 回测历史记录类型定义
 */
export interface BacktestHistoryItem {
  task_id: string;
  strategy_name: string;
  symbol: string;
  status: string;
  total_return: number;
  max_drawdown: number;
  created_at: string;
  completed_at?: string;
}

/**
 * 回测历史查询结果类型定义
 */
export interface BacktestHistoryResult {
  total: number;
  page: number;
  page_size: number;
  results: BacktestHistoryItem[];
}

/**
 * API响应类型定义
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取策略列表
 * @returns 策略列表
 */
export async function fetchStrategyList(): Promise<StrategyInfo[]> {
  try {
    const response = await fetch(`${BASE_URL}/strategies/`);
    const result: ApiResponse<StrategyInfo[]> = await response.json();
    
    if (result.code === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '获取策略列表失败');
    }
  } catch (error) {
    console.error('获取策略列表失败:', error);
    throw error;
  }
}

/**
 * 创建回测任务
 * @param strategyName 策略名称
 * @param symbol 股票代码
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param initialCash 初始资金
 * @param strategyParams 策略参数
 * @returns 回测任务信息
 */
export async function createBacktestTask(
  strategyName: string,
  symbol: string,
  startDate: string,
  endDate: string,
  initialCash: number = 100000,
  strategyParams: Record<string, any> = {}
): Promise<BacktestTask> {
  try {
    const requestData = {
      strategy_name: strategyName,
      symbol,
      start_date: startDate,
      end_date: endDate,
      initial_cash: initialCash,
      strategy_params: strategyParams
    };
    
    const response = await fetch(`${BASE_URL}/backtest/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    const result: ApiResponse<BacktestTask> = await response.json();
    
    if (result.code === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '创建回测任务失败');
    }
  } catch (error) {
    console.error('创建回测任务失败:', error);
    throw error;
  }
}

/**
 * 运行回测任务
 * @param taskId 回测任务ID
 * @returns 回测任务信息
 */
export async function runBacktestTask(taskId: string): Promise<BacktestTask> {
  try {
    const response = await fetch(`${BASE_URL}/backtest/${taskId}/run/`, {
      method: 'POST'
    });
    
    const result: ApiResponse<BacktestTask> = await response.json();
    
    if (result.code === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '运行回测任务失败');
    }
  } catch (error) {
    console.error('运行回测任务失败:', error);
    throw error;
  }
}

/**
 * 查询回测任务状态
 * @param taskId 回测任务ID
 * @returns 回测任务状态信息
 */
export async function fetchBacktestStatus(taskId: string): Promise<BacktestTask> {
  try {
    const response = await fetch(`${BASE_URL}/backtest/${taskId}/status/`);
    const result: ApiResponse<BacktestTask> = await response.json();
    
    if (result.code === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '查询回测任务状态失败');
    }
  } catch (error) {
    console.error('查询回测任务状态失败:', error);
    throw error;
  }
}

/**
 * 获取回测结果
 * @param taskId 回测任务ID
 * @returns 回测结果
 */
export async function fetchBacktestResult(taskId: string): Promise<BacktestResult> {
  try {
    const response = await fetch(`${BASE_URL}/backtest/${taskId}/result/`);
    const result: ApiResponse<BacktestResult> = await response.json();
    
    if (result.code === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '获取回测结果失败');
    }
  } catch (error) {
    console.error('获取回测结果失败:', error);
    throw error;
  }
}

/**
 * 获取回测历史记录
 * @param page 页码
 * @param pageSize 每页数量
 * @param strategyName 策略名称过滤
 * @param symbol 股票代码过滤
 * @param status 状态过滤
 * @returns 回测历史记录
 */
export async function fetchBacktestHistory(
  page: number = 1,
  pageSize: number = 20,
  strategyName?: string,
  symbol?: string,
  status?: string
): Promise<BacktestHistoryResult> {
  try {
    let url = `${BASE_URL}/backtest/history/?page=${page}&page_size=${pageSize}`;
    
    if (strategyName) {
      url += `&strategy_name=${strategyName}`;
    }
    
    if (symbol) {
      url += `&symbol=${symbol}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url);
    const result: ApiResponse<BacktestHistoryResult> = await response.json();
    
    if (result.code === 200 && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || '获取回测历史记录失败');
    }
  } catch (error) {
    console.error('获取回测历史记录失败:', error);
    throw error;
  }
}