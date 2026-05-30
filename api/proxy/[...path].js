// Vercel serverless proxy for DashScope API
//
// Routes:  /dashscope/*  →  https://dashscope.aliyuncs.com/api/v1/*
//
// The DASHSCOPE_API_KEY environment variable must be set in the Vercel
// project dashboard (Settings → Environment Variables). It is never
// exposed to the browser.

export default async function handler(req, res) {
  const key = process.env.DASHSCOPE_API_KEY
  if (!key) {
    return res.status(500).json({
      error: 'DASHSCOPE_API_KEY is not configured on the server.',
    })
  }

  // req.query.path is an array of segments from the catch-all route,
  // e.g. ['services', 'aigc', 'text2image', 'image-synthesis']
  //   or ['tasks', '<task_id>']
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path]
  const target = `https://dashscope.aliyuncs.com/api/v1/${segments.join('/')}`

  // Forward headers the client set (Content-Type, X-DashScope-Async, etc.)
  // but override Authorization with the server-side key.
  const forwardHeaders = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Authorization': `Bearer ${key}`,
  }
  if (req.headers['x-dashscope-async']) {
    forwardHeaders['X-DashScope-Async'] = req.headers['x-dashscope-async']
  }

  const fetchOptions = { method: req.method, headers: forwardHeaders }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await new Promise((resolve) => {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    })
    fetchOptions.body = body
  }

  const upstream = await fetch(target, fetchOptions)
  const data = await upstream.json()

  res.status(upstream.status).json(data)
}
