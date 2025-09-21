import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true, // 监听所有地址，包括局域网和公网地址
    proxy: {
      '/django': {
        // target: 'http://47.120.53.64',
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      }
    }
  },
})
