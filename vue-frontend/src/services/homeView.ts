import { ref } from 'vue'
/**
 * 平台功能迭代列表数据
 * 用于展示平台的功能更新历史和版本信息
 */
export const featureUpdates = ref([
  {
    id: 6,
    date: '2025-08-23',
    version: '0.01',
    title: '搭建股票分析平台前后端',
    description: '使用ai快速实现股票分析平台前后端，可以查看一些简单数据, 增加新闻ai分析能力、行业热力图数据、行业rps数据',
    type: 'guide',
    status: 'info'
  },
  {
    id: 1,
    date: '2025-09-14',
    version: '0.02',
    title: '增加若干功能',
    description: '增加了用户注册、登录功能，回测功能模块、行业模块、个股模块、基本面模块',
    type: 'update',
    status: 'stable'
  },
  {
    id: 2,
    date: '2025-09-27',
    version: '0.03',
    title: '增加策略选股功能',
    description: '该功能主要是用来存储展示不同策略的定期结果产出，可以对策略的不同结果均可存储展示，如果日常使用jupyter notebook也可使用接口存储到平台',
    type: 'update',
    status: 'stable'
  },
  {
    id: 2,
    date: '2025-09-28',
    version: '0.04',
    title: '修复若干问题',
    description: '所有股票数据都清洗为前复权（数据抓取模块修复），k线展示异常修复，回测初始资金默认1000000',
    type: 'update',
    status: 'info'
  },
  {
    id: 4,
    date: '2025-09-29',
    version: '0.05',
    title: '优化量化模块子页面名称，增加布林带量化策略',
    description: '本来计划是每次回测都搞个可视化趋势图，使用backtrade自带的搞了一下午没搞成功，准备尝试其他方案了',
    type: 'update',
    status: 'info'
  },
  {
    id: 5,
    date: '2025-09-30',
    version: '0.06',
    title: '优化回测结果详情页展示内容',
    description: '现在资金、持仓数据正常，交易盈利数据正常，基本指标优化更好看一些，颜色标记进行修改，所有已有策略都增加了过程指标采集',
    type: 'update',
    status: 'info'
  },

])


// 新闻数据
export const recentNews = ref([
  {
    id: 1,
    title: '暂无数据',
    summary: '暂时没有数据',
    time: '2小时前'
  },
])