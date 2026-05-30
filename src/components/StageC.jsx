import { useState } from 'react'
import PassDevice from './PassDevice'

export default function StageC({ playerName, imageB, onSubmit }) {
  const [desc, setDesc] = useState('')
  const valid = desc.trim().length >= 3

  return (
    <PassDevice
      role="C"
      name={playerName}
      note="You'll see a hand drawing. Describe what you think it shows in plain words. The AI will then draw YOUR description."
    >
      <div className="card blue reveal">
        <p className="eyebrow">Stage 3 · Describe the drawing</p>
        <h1 className="title-xl">What is this, exactly?</h1>
        <p className="lead">
          Look at the drawing and describe it as a text-to-image prompt. Whatever you
          write becomes the next AI image — so be vivid.
        </p>

        <div className="split">
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>PLAYER B'S DRAWING</div>
            <img className="pane-img" src={imageB} alt="Hand drawing to describe" />
          </div>
          <div>
            <label className="field">
              <span>
                Your description / prompt
                <i className="counter">{desc.length}/300</i>
              </span>
              <textarea
                value={desc}
                maxLength={300}
                placeholder="e.g. a fluffy orange animal balancing on a fence at sunset…"
                onChange={(e) => setDesc(e.target.value)}
                style={{ minHeight: 220 }}
              />
            </label>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn primary" disabled={!valid} onClick={() => onSubmit(desc.trim())}>
            Generate Image C →
          </button>
        </div>
      </div>
    </PassDevice>
  )
}
