import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' }
    },
    {
      path: '/stock-picker',
      name: 'stock-picker',
      component: () => import('../views/StockPickerView.vue'),
      meta: { title: '智能选股' }
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
