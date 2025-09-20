import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { title: '登录', requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { title: '注册', requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/industries',
      name: 'industries',
      component: () => import('../views/analysis/IndustryAnalysis.vue'),
      meta: { title: '行业分析' }
    },
    {
      path: '/industries/:industry',
      name: 'industry-detail',
      component: () => import('../views/analysis/IndustryDetail.vue'),
      meta: { title: '行业详情' }
    },
    {
      path: '/stock-picker',
      name: 'stock-picker',
      meta: { title: '智能选股' },
      children: [
        {
          path: '/stock-viewer',
          name: 'stock-viewer',
          component: () => import('../views/analysis/StockPickerView.vue'),
          meta: { title: '股票分析' }
        },
        {
          path: '/stock-kline',
          name: 'stock-kline',
          component: () => import('../views/indival_stock_data/StockKLineView.vue'),
          meta: { title: '股票K线图分析' }
        }
      ]
    },
    {
      path: '/quant',
      name: 'quant',
      meta: { title: '量化分析' },
      children: [
        {
          path: '/backtest',
          name: 'QuantitativeBacktest',
          component: () => import('@/views/quant/QuantitativeBacktestView.vue'),
          meta: { title: '回测分析' }
        },
        {
          path: '/backtest-strategy',
          name: 'BacktestStrategy',
          component: () => import('@/views/quant/BacktestStrategyView.vue'),
          meta: { title: '创建回测策略' }
        },
        {
          path: '/backtest-history',
          name: 'BacktestHistory',
          component: () => import('@/views/quant/BacktestHistoryView.vue'),
          meta: { title: '回测历史' }
        },
        {
          path: '/strategy-list',
          name: 'StrategyList',
          component: () => import('@/views/quant/StrategyListView.vue'),
          meta: { title: '回测策略列表' }
        },
      ]
    },
    {
      path: '/analysis',
      name: 'analysis',
      meta: { title: '股票分析' },
      children: [
        {
          path: '/analysis/technical',
          name: 'technical',
          component: () => import('../views/analysis/TechnicalAnalysis.vue'),
          meta: { title: '技术分析' }
        },
        {
          path: '/analysis/fundamental',
          name: 'fundamental',
          component: () => import('../views/analysis/FundamentalAnalysis.vue'),
          meta: { title: '基本面分析' }
        },
        {
          path: '/analysis/trend',
          name: 'trend',
          component: () => import('../views/analysis/TrendAnalysis.vue'),
          meta: { title: '趋势分析' }
        },
        {
          path: '/analysis/stock/:code',
          name: 'stock-detail',
          component: () => import('../views/analysis/StockDetail.vue'),
          meta: { title: '股票详情' }
        },
        {
          path: '/analysis/market',
          name: 'market-analysis',
          component: () => import('@/views/analysis/MarketAnalysis.vue'),
          meta: { title: '大盘分析' }
        },
        {
          path: '/analysis/congestion',
          name: 'congestion-heatmap',
          component: () => import('@/views/analysis/CongestionHeatmap.vue'),
          meta: { title: '行业拥挤度热力图' }
        },
        {
          path: '/analysis/news-list',
          name: 'news-list',
          component: () => import('@/views/analysis/NewsList.vue'),
          meta: { title: 'CCTV新闻列表' }
        },
        {
          path: '/analysis/news-detail/:id',
          name: 'news-detail',
          component: () => import('@/views/analysis/NewsDetail.vue'),
          meta: { title: '新闻详情' }
        }
      ]
    },
    {
      path: '/strategy',
      name: 'strategy',
      meta: { title: '策略分析' },
      children: [
        {
          path: '/strategy/index-rps',
          name: 'index-rps',
          component: () => import('@/views/strategy/IndexRpsView.vue'),
          meta: { title: '指数RPS强度排名' }
        },
        {
          path: '/strategy/historical-rps',
          name: 'historical-rps',
          component: () => import('@/views/strategy/HistoricalRpsView.vue'),
          meta: { title: '历史RPS数据分析' }
        }
      ]
    },
    {
      path: '/forum',
      name: 'forum',
      meta: { title: '论坛讨论区' },
      children: [
        {
          path: '/forum/posts',
          name: 'forum-posts',
          component: () => import('@/views/forum/ForumListView.vue'),
          meta: { title: '帖子列表' }
        },
        {
          path: '/forum/posts/:id',
          name: 'post-detail',
          component: () => import('@/views/forum/PostDetailView.vue'),
          meta: { title: '帖子详情' }
        }
      ]
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: { title: '投资组合' }
    },
    {      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: '系统设置', requiresAdmin: true }
    },

  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 股票分析系统` : '股票分析系统'
  
  // 检查路由是否需要认证，默认所有路由都需要认证，除非明确设置requiresAuth为false
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  // 如果路由需要认证且用户未登录，则重定向到登录页面
  if (requiresAuth && !isAuthenticated()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // 检查是否需要管理员权限
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin === true)
  
  // 如果需要管理员权限，检查当前用户是否是管理员
  if (requiresAdmin) {
    const userJson = localStorage.getItem('user')
    if (userJson) {
      const user = JSON.parse(userJson)
      if (!user.is_admin) {
        // 如果不是管理员，重定向到首页
        next({ name: 'home' })
        return
      }
    } else {
      // 如果没有用户信息，重定向到登录页面
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router
