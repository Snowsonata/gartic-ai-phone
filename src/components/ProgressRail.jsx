import { PHASES } from '../hooks/useGameMachine'

const STEPS = [
  { phase: PHASES.STAGE_A, label: 'PROMPT' },
  { phase: PHASES.STAGE_B, label: 'DRAW' },
  { phase: PHASES.STAGE_C, label: 'DESCRIBE' },
  { phase: PHASES.STAGE_D, label: 'GUESS' },
  { phase: PHASES.RESULT, label: 'REVEAL' },
]

export default function ProgressRail({ stepIndex }) {
  // stepIndex comes from ORDER (LOBBY=0). Map to our 5 visible steps.
  const current = stepIndex - 1 // STAGE_A -> 0
  return (
    <div className="rail" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={current + 1}>
      {STEPS.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={s.phase} style={{ display: 'contents' }}>
            <div className="rail-node">
              <div className={`rail-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="rail-bar">
                <i style={{ width: done ? '100%' : '0%' }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
