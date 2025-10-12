/**
 * 行业分析API服务
 * 功能：
 * 1. 获取行业板块列表
 * 2. 获取行业业绩快报汇聚数据
 * 3. 支持多种报告类型和时间范围筛选
 */
import axios from './axiosConfig'

// 行业板块信息接口
export interface IndustrySector {
  code: string
  name: string
  stock_count: number
  latest_price: number
  change_percent: number
}

// 行业板块列表响应接口
export interface IndustrySectorListResponse {
  code: number
  message: string
  timestamp: string
  data: IndustrySectorListData
}


export interface IndustrySectorListData {
  total: number
  sectors: IndustrySector[]
  query_time: string
}

// 行业业绩快报汇聚数据接口
export interface IndustryPerformanceReport {
  report_date: string
  industry: string
  company_count: number
  total_operating_revenue: number
  total_net_profit: number
  avg_earnings_per_share: number
  avg_operating_revenue_growth_rate: number
  avg_net_profit_growth_rate: number
  avg_roe: number
  avg_gross_profit_margin: number
  avg_net_assets_per_share: number
  avg_operating_cash_flow_per_share: number
}

// 行业业绩快报响应接口
export interface IndustryPerformanceReportResponse {
  code: number
  message: string
  timestamp: string
  data: IndustryPerformanceReportData
}

export interface IndustryPerformanceReportData {
  total_records: number
  aggregated_reports: IndustryPerformanceReport[]
  query_params: {
    industry: string | null
    report_type: string | null
    start_date: string | null
    end_date: string | null
  }
}

// 报告类型枚举
export enum ReportType {
  ANNUAL = 'annual',        // 年报
  SEMI_ANNUAL = 'semi_annual', // 中报
  Q1 = 'q1',               // 一季报
  Q3 = 'q3',               // 三季报
  QUARTERLY = 'quarterly'   // 季报（包含一季报和三季报）
}

// 查询参数接口
export interface IndustryPerformanceQueryParams {
  industry?: string
  report_type?: ReportType
  start_date?: string
  end_date?: string
}

// API基础URL
const API_BASE_URL = '/django/api/stock'

/**
 * 获取行业板块列表
 * @param limit 返回行业板块数量限制
 * @param offset 偏移量
 * @returns Promise<IndustrySectorListResponse> 行业板块列表
 */
export const getIndustrySectors = async (
  limit?: number,
  offset?: number
): Promise<IndustrySectorListData> => {
  const params: any = {}
  if (limit !== undefined) params.limit = limit
  if (offset !== undefined) params.offset = offset

  const response = await axios.get<IndustrySectorListData>(
    `${API_BASE_URL}/industry-sectors/`,
    { params }
  )
  return response.data
}

/**
 * 获取行业业绩快报汇聚数据
 * @param params 查询参数
 * @returns Promise<IndustryPerformanceReportResponse> 行业业绩快报数据
 */
export const getIndustryPerformanceReports = async (
  params: IndustryPerformanceQueryParams = {}
): Promise<IndustryPerformanceReportData> => {
  const response = await axios.get<IndustryPerformanceReportData>(
    `${API_BASE_URL}/industry/performance-reports/`,
    { params }
  )
  return response.data
}

/**
 * 获取指定行业的业绩快报数据
 * @param industry 行业名称
 * @param reportType 报告类型
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns Promise<IndustryPerformanceReportResponse> 指定行业的业绩快报数据
 */
export const getIndustryPerformanceByIndustry = async (
  industry: string,
  reportType?: ReportType,
  startDate?: string,
  endDate?: string
): Promise<IndustryPerformanceReportData> => {
  const params: IndustryPerformanceQueryParams = { industry }
  if (reportType) params.report_type = reportType
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  return getIndustryPerformanceReports(params)
}

/**
 * 获取所有行业指定报告类型的业绩快报数据
 * @param reportType 报告类型
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns Promise<IndustryPerformanceReportResponse> 所有行业的业绩快报数据
 */
export const getAllIndustryPerformanceByType = async (
  reportType: ReportType,
  startDate?: string,
  endDate?: string
): Promise<IndustryPerformanceReportData> => {
  const params: IndustryPerformanceQueryParams = { report_type: reportType }
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate

  return getIndustryPerformanceReports(params)
}

// 导出报告类型选项，用于前端选择器
export const REPORT_TYPE_OPTIONS = [
  { value: ReportType.ANNUAL, label: '年报' },
  { value: ReportType.SEMI_ANNUAL, label: '中报' },
  { value: ReportType.Q1, label: '一季报' },
  { value: ReportType.Q3, label: '三季报' },
  { value: ReportType.QUARTERLY, label: '季报' }
]

// 导出指标选项，用于前端选择器
export const METRIC_OPTIONS = [
  { value: 'avg_operating_revenue_growth_rate', label: '营业收入增长率' },
  { value: 'avg_net_profit_growth_rate', label: '净利润增长率' },
  { value: 'avg_roe', label: '净资产收益率' },
  { value: 'avg_gross_profit_margin', label: '毛利率' },
  { value: 'avg_earnings_per_share', label: '每股收益' },
  { value: 'avg_net_assets_per_share', label: '每股净资产' },
  { value: 'avg_operating_cash_flow_per_share', label: '每股经营现金流' }
]