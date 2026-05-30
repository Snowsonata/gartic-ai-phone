import { useMemo, useState } from 'react'
import PassDevice from './PassDevice'

/**
 * Strict client-side validation: the prompt must NOT contain ANY character
 * that appears in the target word (case-insensitive, whitespace ignored).
 * Works for both Chinese idioms (per-Han-character) and English words/phrases.
 * Returns the array of forbidden characters the prompt illegally used.
 */
function findForbidden(prompt, targetWord) {
  const banned = new Set(
    [...targetWord.toLowerCase()].filter((ch) => ch.trim().length > 0)
  )
  const used = new Set()
  for (const ch of prompt.toLowerCase()) {
    if (banned.has(ch)) used.add(ch)
  }
  return [...used]
}

export default function StageA({ playerName, targetWord, category, onSubmit }) {
  const [prompt, setPrompt] = useState('')

  const forbidden = useMemo(
    () => findForbidden(prompt, targetWord),
    [prompt, targetWord]
  )
  const valid = prompt.trim().length >= 3 && forbidden.length === 0

  return (
    <PassDevice
      role="A"
      name={playerName}
      note="你会看到一个神秘小词汇。你的任务是写出一个图片生成提示词，让AI根据它画出一张图。提示词里不能包含原词汇里的任何字母或汉字。仔细思考，发挥想象，写下你的提示词吧"
    >
      <div className="card blue reveal">
        <p className="eyebrow">第一阶段： {category}</p>
        <h1 className="title-xl">本轮词汇是...</h1>
        <div
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(36px, 8vw, 64px)', letterSpacing: '-.03em',
            color: 'var(--blue-deep)', margin: '4px 0 20px', lineHeight: 1,
          }}
        >
          {targetWord}
        </div>
        <p className="lead">
          这是一个神秘小词语，只有你能看到。你的任务是写出一个图片生成提示词（prompt），让AI根据它画出一张图。提示词里<strong>不能包含其中的任何字母或汉字</strong>。仔细思考，发挥想象，写下你的提示词吧
        </p>

        <label className="field">
          <span>
            你的描述
            <i className="counter">{prompt.length}/300</i>
          </span>
          <textarea
            value={prompt}
            maxLength={300}
            placeholder="自行发挥…"
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        {forbidden.length > 0 && (
          <div className="err">
            ✕ 你的描述里不能有原词汇里的字眼{' '}
            <b>{forbidden.map((c) => `"${c}"`).join('  ')}</b>
          </div>
        )}
        {forbidden.length === 0 && prompt.trim().length > 0 && (
          <div className="hint" style={{ color: 'var(--blue-deep)' }}>
            ✓ 成功的描述，AI将据其生成图片
          </div>
        )}

        <div className="btn-row">
          <button
            className="btn primary"
            disabled={!valid}
            onClick={() => onSubmit(prompt.trim())}
          >
            生成图片 →
          </button>
        </div>
      </div>
    </PassDevice>
  )
}
