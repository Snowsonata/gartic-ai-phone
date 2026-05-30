import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Loads ALL env vars (including ones WITHOUT the VITE_ prefix) so the secret
  // DASHSCOPE_API_KEY stays on the Node side and never enters the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // The browser calls relative paths like:
        //   POST /dashscope/services/aigc/text2image/image-synthesis
        //   GET  /dashscope/tasks/<task_id>
        // Vite forwards them to DashScope and attaches the Authorization
        // header here, on the server, so the key is never shipped to the client.
        '/dashscope': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dashscope/, '/api/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.DASHSCOPE_API_KEY
              if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`)
            })
          },
        },
      },
    },
  }
})
