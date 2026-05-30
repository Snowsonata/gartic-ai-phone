// =====================================================================
//  server/proxy.mjs — minimal standalone proxy for DashScope.
//
//  Use this when you are NOT running the Vite dev server (e.g. you built
//  the app with `npm run build` and serve dist/ behind this), or if you
//  just prefer an explicit Node process. It mirrors the Vite dev proxy:
//
//    /dashscope/*  ->  https://dashscope.aliyuncs.com/api/v1/*
//
//  It attaches "Authorization: Bearer <DASHSCOPE_API_KEY>" on the server
//  so the key never reaches the browser. Run with:  npm run proxy
// =====================================================================

import express from 'express'

const PORT = process.env.PROXY_PORT || 8787
const KEY = process.env.DASHSCOPE_API_KEY
const UPSTREAM = 'https://dashscope.aliyuncs.com/api/v1'

if (!KEY) {
  console.warn('[proxy] WARNING: DASHSCOPE_API_KEY is not set. Requests will 401.')
}

const app = express()
app.use(express.json({ limit: '4mb' }))

// CORS for the Vite dev origin (only needed if you run this on a different port).
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-DashScope-Async')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Generic passthrough for everything under /dashscope.
app.use('/dashscope', async (req, res) => {
  const target = `${UPSTREAM}${req.url}` // req.url already strips the /dashscope mount
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEY}`,
        // Forward the async flag the client set on the create call.
        ...(req.headers['x-dashscope-async']
          ? { 'X-DashScope-Async': req.headers['x-dashscope-async'] }
          : {}),
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
    })
    const text = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    res.send(text)
  } catch (err) {
    console.error('[proxy] error:', err)
    res.status(502).json({ error: 'Proxy request failed', detail: String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`[proxy] DashScope proxy listening on http://localhost:${PORT}/dashscope`)
})
