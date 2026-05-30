// =====================================================================
//  server/server.js — Alibaba Cloud ECS standalone DashScope proxy
//
//  Forwards /dashscope/* → https://dashscope.aliyuncs.com/api/v1/*
//  and injects the Authorization header server-side so the API key
//  never reaches the browser.
//
//  Environment variables (set in ECS, never commit these):
//    DASHSCOPE_API_KEY   your DashScope API key (required)
//    PORT                listening port          (default: 3000)
//    CORS_ORIGIN         allowed frontend origin (default: *)
//                        Set to your exact GitHub Pages URL in prod:
//                        https://<your-username>.github.io
//
//  Run:
//    node server/server.js
//  Or with PM2 for auto-restart:
//    pm2 start server/server.js --name dashscope-proxy
// =====================================================================

import express from 'express'

const PORT        = process.env.PORT        || 3000
const KEY         = process.env.DASHSCOPE_API_KEY
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const UPSTREAM    = 'https://dashscope.aliyuncs.com/api/v1'

if (!KEY) {
  console.error('[proxy] FATAL: DASHSCOPE_API_KEY is not set. Exiting.')
  process.exit(1)
}

const app = express()

// ── Body parsing ────────────────────────────────────────────────────
// Raise limit well above DashScope's typical payload size.
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── CORS ────────────────────────────────────────────────────────────
// Restrict to your GitHub Pages origin in production via CORS_ORIGIN.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  CORS_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-DashScope-Async',
  )
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── DashScope proxy ─────────────────────────────────────────────────
// Matches:
//   POST /dashscope/services/aigc/text2image/image-synthesis
//   GET  /dashscope/tasks/<task_id>
app.use('/dashscope', async (req, res) => {
  // req.url is the path AFTER the /dashscope mount point, e.g.:
  //   /services/aigc/text2image/image-synthesis
  //   /tasks/<task_id>
  const target = `${UPSTREAM}${req.url}`

  console.log(`[proxy] ${req.method} ${target}`)

  const headers = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${KEY}`,
  }
  if (req.headers['x-dashscope-async']) {
    headers['X-DashScope-Async'] = req.headers['x-dashscope-async']
  }

  const fetchOptions = {
    method:  req.method,
    headers,
    // Only attach a body for mutating requests; express.json() has already
    // parsed it into req.body, so re-serialise it for the upstream call.
    body: ['POST', 'PUT', 'PATCH'].includes(req.method)
      ? JSON.stringify(req.body)
      : undefined,
  }

  try {
    const upstream = await fetch(target, fetchOptions)
    const text     = await upstream.text()

    res
      .status(upstream.status)
      .setHeader(
        'Content-Type',
        upstream.headers.get('content-type') || 'application/json',
      )
      .send(text)
  } catch (err) {
    console.error('[proxy] upstream fetch error:', err)
    res.status(502).json({ error: 'Proxy request failed.', detail: String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`[proxy] DashScope proxy running on http://0.0.0.0:${PORT}`)
  console.log(`[proxy] CORS origin: ${CORS_ORIGIN}`)
})
