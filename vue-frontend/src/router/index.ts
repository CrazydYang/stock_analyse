import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
        }
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
        }
      ]
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: { title: '投资组合' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: '系统设置' }
    }
  ],
})

export default router
