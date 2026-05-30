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
      note="You'll see a secret word. Write an image prompt that captures it — WITHOUT using any of its letters/characters. The AI will draw your prompt."
    >
      <div className="card blue reveal">
        <p className="eyebrow">Stage 1 · {category}</p>
        <h1 className="title-xl">Your secret word is…</h1>
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
          Write a text prompt that makes an AI draw this — but you may not use any
          character that appears in the word. Describe it sideways: shapes, vibes,
          scenes, feelings.
        </p>

        <label className="field">
          <span>
            Your image prompt
            <i className="counter">{prompt.length}/300</i>
          </span>
          <textarea
            value={prompt}
            maxLength={300}
            placeholder="e.g. a small striped creature napping beside a wooden post in a sunny field…"
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        {forbidden.length > 0 && (
          <div className="err">
            ✕ Remove these — they're part of the secret word:{' '}
            <b>{forbidden.map((c) => `"${c}"`).join('  ')}</b>
          </div>
        )}
        {forbidden.length === 0 && prompt.trim().length > 0 && (
          <div className="hint" style={{ color: 'var(--blue-deep)' }}>
            ✓ Clean prompt — no forbidden characters.
          </div>
        )}

        <div className="btn-row">
          <button
            className="btn primary"
            disabled={!valid}
            onClick={() => onSubmit(prompt.trim())}
          >
            Generate Image A →
          </button>
        </div>
      </div>
    </PassDevice>
  )
}
