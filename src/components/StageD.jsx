import { useState } from 'react'
import PassDevice from './PassDevice'

export default function StageD({ playerName, imageC, onSubmit }) {
  const [guess, setGuess] = useState('')
  const valid = guess.trim().length > 0

  return (
    <PassDevice
      role="D"
      name={playerName}
      note="You'll see ONE AI image. Guess the original secret word that started the whole chain. No pressure."
    >
      <div className="card reveal">
        <p className="eyebrow">Stage 4 · Final guess</p>
        <h1 className="title-xl">What was the original word?</h1>
        <p className="lead">
          This image is the end of a long game of telephone. Work backwards and guess
          the word that started it all.
        </p>

        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}>
          <img
            className="pane-img"
            style={{ maxWidth: 380 }}
            src={imageC}
            alt="Final AI image to guess from"
          />
        </div>

        <label className="field">
          <span>Your guess</span>
          <input
            type="text"
            value={guess}
            placeholder="Type the original word or idiom…"
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && valid) onSubmit(guess.trim()) }}
          />
        </label>

        <div className="btn-row">
          <button className="btn primary" disabled={!valid} onClick={() => onSubmit(guess.trim())}>
            Lock in guess & reveal →
          </button>
        </div>
      </div>
    </PassDevice>
  )
}
