import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy /api calls to the AgentBase production endpoint during local dev
      '/api': {
        target: 'https://endpoint-5d12d628-f18b-46d6-be03-c1da5d44770a.agentbase-runtime.aiplatform.vngcloud.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
