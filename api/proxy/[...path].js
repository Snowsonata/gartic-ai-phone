// Vercel serverless proxy for DashScope API
//
// Routes:  /dashscope/:path*  →  https://dashscope.aliyuncs.com/api/v1/:path*
//
// Set DASHSCOPE_API_KEY in the Vercel project dashboard under
// Settings → Environment Variables. It is never sent to the browser.

export const config = {
  api: {
    // Tell Vercel not to pre-parse the body — we read it as raw text so we
    // can forward it verbatim without any JSON re-serialisation rounding.
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  // ── 1. Auth key ────────────────────────────────────────────────────────
  const key = process.env.DASHSCOPE_API_KEY
  if (!key) {
    return res.status(500).json({
      error: 'DASHSCOPE_API_KEY is not set in Vercel environment variables.',
    })
  }

  // ── 2. Reconstruct the upstream URL ────────────────────────────────────
  // req.query.path is a string[] from the [...path] catch-all filename.
  // e.g. /dashscope/services/aigc/text2image/image-synthesis
  //   → ['services', 'aigc', 'text2image', 'image-synthesis']
  // e.g. /dashscope/tasks/<task_id>
  //   → ['tasks', '<task_id>']
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean)

  if (segments.length === 0) {
    return res.status(400).json({ error: 'Missing path segments.' })
  }

  const target = `https://dashscope.aliyuncs.com/api/v1/${segments.join('/')}`

  // ── 3. Forward headers ─────────────────────────────────────────────────
  const forwardHeaders = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Authorization': `Bearer ${key}`,
  }
  // X-DashScope-Async: enable is required by the POST /image-synthesis call
  if (req.headers['x-dashscope-async']) {
    forwardHeaders['X-DashScope-Async'] = req.headers['x-dashscope-async']
  }

  // ── 4. Read body (bodyParser is disabled, so stream it manually) ───────
  const fetchOptions = { method: req.method, headers: forwardHeaders }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const rawBody = await new Promise((resolve, reject) => {
      const chunks = []
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', reject)
    })
    if (rawBody) fetchOptions.body = rawBody
  }

  // ── 5. Call DashScope and relay the response ───────────────────────────
  let upstream
  try {
    upstream = await fetch(target, fetchOptions)
  } catch (err) {
    console.error('[proxy] fetch error:', err)
    return res.status(502).json({ error: 'Failed to reach DashScope API.', detail: String(err) })
  }

  // Relay status + body verbatim so the client sees DashScope's real errors
  const text = await upstream.text()
  res.status(upstream.status)
    .setHeader('Content-Type', 'application/json')
    .send(text)
}
