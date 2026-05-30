import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Loads ALL env vars (including ones WITHOUT the VITE_ prefix) so the secret
  // DASHSCOPE_API_KEY stays on the Node side and never enters the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // './' ensures asset paths work when opened via file:// without a server.
    // viteSingleFile inlines all JS and CSS directly into index.html so there
    // are no separate chunks to load — no CORS issues when double-clicking the file.
    base: './',
    plugins: [react(), viteSingleFile()],
    build: {
      // viteSingleFile requires all assets to be inlined; raise the inline limit
      // so nothing escapes into a separate file.
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false,
    },
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
