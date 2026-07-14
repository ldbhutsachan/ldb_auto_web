import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Load environment variables from .env.[mode]
  const env = loadEnv(mode, process.cwd(), '')

  // Compute backend API target for Vite dev proxy
  const apiTarget = env.VITE_API_URL
    ? (env.VITE_API_URL.startsWith('http') ? env.VITE_API_URL : `http://${env.VITE_API_URL}`)
    : 'http://10.0.4.102:31852'

  return {
    base: '/',
    plugins: [
      vue(),
      ui({
        ui: {
          colors: {
            primary: 'blue',
            neutral: 'zinc',
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        // Proxy API calls to backend (avoids CORS in dev)
        '/auto': { target: apiTarget, changeOrigin: true },
        '/auth': { target: apiTarget, changeOrigin: true },
        '/reports': { target: apiTarget, changeOrigin: true },
        '/transactions': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
