import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (including non-VITE_ ones) so DASHSCOPE_API_KEY
  // can be read here on the Node side for the dev proxy — it never enters
  // the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // './' produces relative asset paths so the built index.html works
    // when opened via file:// by double-clicking (no server needed).
    // viteSingleFile inlines all JS + CSS into index.html anyway, so
    // there are no separate chunk files to reference.
    base: './',

    plugins: [react(), viteSingleFile()],

    build: {
      // Force every asset to be inlined regardless of size.
      // viteSingleFile needs this to guarantee nothing escapes into
      // a separate file that file:// can't load cross-origin.
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false,
    },

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
