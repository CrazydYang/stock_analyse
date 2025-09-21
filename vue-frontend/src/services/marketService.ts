/**
 * 股票市场数据服务
 * 提供获取股票市场每日概况、指数数据等市场数据的方法
 */
import axios from './axiosConfig';

// 上海证券交易所每日概况数据接口
export interface SSEDailyOverviewData {
  单日情况: string;
  股票: number;
  主板A: number;
  主板B: number;
  科创板: number;
  股票回购: number;
}

// 市场指数数据接口
export interface MarketIndexData {
  index_name: string;
  index_code: string;
  latest_value: number;
  change_percent: number;
  volume: number;
}

// 市场每日概况响应结构
export interface MarketDailyOverviewResponse {
  code: number;
  message: string;
  data: MarketDailyOverviewData;
}

// 市场每日概况数据
export interface MarketDailyOverviewData {
  date: string;
  shanghai: MarketIndexData;
  shenzhen: MarketIndexData;
  hs300: MarketIndexData;
  sz50: MarketIndexData;
}

// 市场指数变化数据（用于前端展示）
export interface MarketIndexChange {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

/**
 * 获取股票市场每日概况数据
 * @param date 查询日期，格式为YYYYMMDD，不传则获取最近一个交易日数据
 * @returns 市场每日概况数据
 */
export const getMarketDailyOverview = async (date?: string): Promise<MarketDailyOverviewData> => {
  try {
    const url = '/django/api/market/sse-daily-overview/';
    const params = date ? { date } : {};
    const response = await axios.get<MarketDailyOverviewData>(url, { params });
    return response.data;
  } catch (error) {
    console.error('获取股票市场每日概况数据失败:', error);
    return {
      date: '',
      shanghai: createEmptyMarketIndexData('上证指数', '000001'),
      shenzhen: createEmptyMarketIndexData('深证成指', '399001'),
      hs300: createEmptyMarketIndexData('沪深300', '000300'),
      sz50: createEmptyMarketIndexData('上证50', '000016')
    };
  }
};

/**
 * 创建空的市场指数数据对象
 * @param name 指数名称
 * @param code 指数代码
 * @returns 空的市场指数数据对象
 */
const createEmptyMarketIndexData = (name: string, code: string): MarketIndexData => {
  return {
    index_name: name,
    index_code: code,
    latest_value: 0,
    change_percent: 0,
    volume: 0,
  };
};

/**
 * 获取市场指数变化数据（用于前端展示）
 * @returns 市场指数变化数据数组
 */
export const getMarketIndices = async (): Promise<MarketIndexChange[]> => {
  try {
    const marketData = await getMarketDailyOverview();
    
    // 将API返回的数据转换为前端展示所需的格式
    return [
      {
        name: marketData.shanghai.index_name,
        value: marketData.shanghai.latest_value,
        change: 0, // API中没有直接提供change值，只有change_percent
        changePercent: marketData.shanghai.change_percent
      },
      {
        name: marketData.shenzhen.index_name,
        value: marketData.shenzhen.latest_value,
        change: 0,
        changePercent: marketData.shenzhen.change_percent
      },
      {
        name: marketData.hs300.index_name,
        value: marketData.hs300.latest_value,
        change: 0,
        changePercent: marketData.hs300.change_percent
      },
      {
        name: marketData.sz50.index_name,
        value: marketData.sz50.latest_value,
        change: 0,
        changePercent: marketData.sz50.change_percent
      }
    ];
  } catch (error) {
    console.error('获取市场指数变化数据失败:', error);
    return [];
  }
};