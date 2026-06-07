import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:3001'

  return {
    plugins: [react()],
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: ['odbito-client-production.up.railway.app', '.railway.app', 'www.odbito.fun', 'odbito.fun'],
    },
    server: {
      port: 5173,
      host: '127.0.0.1',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/webhooks': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
