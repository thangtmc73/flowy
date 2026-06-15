import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEFAULT_SITE_URL =
  'https://endpoint-5d12d628-f18b-46d6-be03-c1da5d44770a.agentbase-runtime.aiplatform.vngcloud.vn'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')

  return {
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-og-site-url',
      transformIndexHtml(html) {
        return html.replaceAll('__SITE_URL__', siteUrl)
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    proxy: {
      // Proxy chat API to production endpoint
      '/api': {
        target: DEFAULT_SITE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/invocations': {
        target: DEFAULT_SITE_URL,
        changeOrigin: true,
      },
    },
  },
  }
})
