import { useState } from 'react'

const ROLE_TAG = { A: 'tag-A', B: 'tag-B', C: 'tag-C', D: 'tag-D' }

/**
 * Privacy gate. Renders a full-screen overlay telling the group to hand the
 * device to `name` (Player `role`). The stage content is only revealed AFTER
 * this player taps "I'm ready" — so the previous player's answer is hidden
 * during the hand-off.
 */
export default function PassDevice({ role, name, note, children }) {
  const [ready, setReady] = useState(false)

  if (ready) return children

  return (
    <div className="pass">
      <div className="pass-inner">
        <div className="pass-eyebrow">传递给——</div>
        <div className={`tag ${ROLE_TAG[role]}`} style={{
          width: 56, height: 56, margin: '0 auto 18px', borderRadius: '50%',
          display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: 28,
          color: role === 'C' ? 'var(--ink)' : '#fff',
          background: role === 'A' ? 'var(--blue)' : role === 'B' ? 'var(--coral)' : role === 'C' ? 'var(--marigold)' : 'var(--paper)',
        }}>
          {role}
        </div>
        <h1 className="pass-name">{name || `Player ${role}`}</h1>
        <div className="pass-role">玩家 {role}</div>
        <p className="pass-note">{note}</p>
        <button className="btn primary" onClick={() => setReady(true)}>
          我是 {name || `Player ${role}`} — 开始我的回合 →
        </button>
      </div>
    </div>
  )
}
