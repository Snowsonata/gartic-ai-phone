// =====================================================================
//  dashscope.js — Alibaba Cloud DashScope (通义万相 / Tongyi-Wanxiang)
//  text-to-image helper.
//
//  The image API is ASYNCHRONOUS. You make TWO requests:
//    1) POST .../text2image/image-synthesis  (header X-DashScope-Async: enable)
//         -> returns output.task_id
//    2) GET  .../tasks/{task_id}  (poll until task_status is SUCCEEDED/FAILED)
//         -> on success returns output.results[i].url
//
//  Task statuses: PENDING -> RUNNING -> SUCCEEDED | FAILED
//  Generation takes a while, so we poll on an interval (~3s here).
//  Result URLs are valid for 24h — fine for a single local game session.
// =====================================================================

const MODEL = import.meta.env.VITE_DASHSCOPE_MODEL || 'wanx2.1-t2i-turbo'
const SIZE  = import.meta.env.VITE_IMAGE_SIZE       || '1024*1024'

// BASE switches automatically between environments:
//
//   Local dev (npm run dev):
//     VITE_ECS_PROXY_URL is unset → BASE = '/dashscope'
//     Vite's dev-server proxy (vite.config.js) intercepts /dashscope/*,
//     forwards to DashScope, and injects the key from your local .env.
//
//   GitHub Pages build (npm run build in CI):
//     VITE_ECS_PROXY_URL is set via GitHub Actions secret, e.g.:
//       http://1.2.3.4:3000
//     BASE = 'http://1.2.3.4:3000/dashscope'
//     The built JS calls your ECS proxy directly (absolute URL, no proxy).
//
// Set VITE_ECS_PROXY_URL in GitHub → Settings → Secrets and variables →
// Actions, then reference it in .github/workflows/deploy.yml.
const ECS_BASE = import.meta.env.VITE_ECS_PROXY_URL
const BASE     = ECS_BASE ? `${ECS_BASE}/dashscope` : '/dashscope'

const CREATE_PATH = '/services/aigc/text2image/image-synthesis'
const TASK_PATH   = (id) => `/tasks/${id}`

function authHeaders() {
  return {} // Authorization is always injected server-side by the ECS proxy
}

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

/**
 * Generate one image from a text prompt.
 *
 * @param {string} prompt                  The text-to-image prompt.
 * @param {object} [opts]
 * @param {string} [opts.negativePrompt]   Things to avoid.
 * @param {(status:string)=>void} [opts.onStatus]  PENDING/RUNNING/... callback.
 * @param {AbortSignal} [opts.signal]      Cancel polling.
 * @param {number} [opts.pollMs=3000]      Poll interval.
 * @param {number} [opts.timeoutMs=120000] Hard timeout.
 * @returns {Promise<string>} A URL to the generated image.
 */
export async function generateImage(prompt, opts = {}) {
  const {
    negativePrompt,
    onStatus,
    signal,
    pollMs = 3000,
    timeoutMs = 120000,
  } = opts

  if (!prompt || !prompt.trim()) throw new Error('Prompt is empty.')

  // ---- 1) Create the async task --------------------------------------
  onStatus?.('CREATING')
  const createRes = await fetch(`${BASE}${CREATE_PATH}`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable', // REQUIRED to run text2image asynchronously
      ...authHeaders(),
    },
    body: JSON.stringify({
      model: MODEL,
      input: {
        prompt: prompt.trim(),
        ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
      },
      parameters: { size: SIZE, n: 1 },
    }),
  })

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => '')
    throw new Error(`Create task failed (${createRes.status}). ${text}`)
  }

  const created = await createRes.json()
  const taskId = created?.output?.task_id
  if (!taskId) {
    throw new Error(`No task_id returned: ${JSON.stringify(created)}`)
  }

  // ---- 2) Poll the task until it finishes ----------------------------
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await sleep(pollMs, signal)

    const pollRes = await fetch(`${BASE}${TASK_PATH(taskId)}`, {
      method: 'GET',
      signal,
      headers: { ...authHeaders() },
    })

    if (!pollRes.ok) {
      const text = await pollRes.text().catch(() => '')
      throw new Error(`Poll failed (${pollRes.status}). ${text}`)
    }

    const data = await pollRes.json()
    const status = data?.output?.task_status
    onStatus?.(status)

    if (status === 'SUCCEEDED') {
      const url = data?.output?.results?.[0]?.url
      if (!url) throw new Error('Task succeeded but no image URL was returned.')
      return url
    }
    if (status === 'FAILED' || status === 'CANCELED' || status === 'UNKNOWN') {
      throw new Error(`Image task ${status}: ${data?.output?.message || 'no detail'}`)
    }
    // PENDING / RUNNING -> keep polling
  }

  throw new Error('Image generation timed out.')
}

/**
 * Optional convenience: fetch a generated DashScope URL and convert it to a
 * Base64 data URL. Useful if you want the ResultBoard to keep working after
 * the 24h URL expires, or to embed images in an exported recap. CORS on the
 * OSS result bucket usually allows this; if it ever fails, just keep the URL.
 */
export async function urlToDataURL(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
