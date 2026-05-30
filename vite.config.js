import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (including non-VITE_ ones) so DASHSCOPE_API_KEY
  // can be read here on the Node side for the dev proxy — it never enters
  // the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Must match your GitHub repository name so asset paths resolve
    // correctly on https://<user>.github.io/<repo>/
    // For local dev and file:// this is overridden by the dev server.
    base: '/gartic-ai-phone/',

    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        // In local development the browser calls relative paths like:
        //   POST /dashscope/services/aigc/text2image/image-synthesis
        //   GET  /dashscope/tasks/<task_id>
        //
        // Vite forwards them to DashScope and injects the Authorization
        // header here on the Node side — the key never reaches the browser.
        //
        // In production (GitHub Pages) there is no Vite server; the built
        // JS uses the absolute VITE_ECS_PROXY_URL instead (see dashscope.js).
        '/dashscope': {
          target:      'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          rewrite:     (path) => path.replace(/^\/dashscope/, '/api/v1'),
          configure:   (proxy) => {
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
