import { useState } from 'react'
import PassDevice from './PassDevice'

export default function StageD({ playerName, imageC, onSubmit }) {
  const [guess, setGuess] = useState('')
  const valid = guess.trim().length > 0

  return (
    <PassDevice
      role="D"
      name={playerName}
      note="你会看到一张AI生成的图片。猜猜最初的那个神秘词汇是什么。不用有压力。"
    >
      <div className="card reveal">
        <p className="eyebrow">第四阶段：最终幻想</p>
        <h1 className="title-xl">答案是什么？</h1>
        <p className="lead">
          最终版本的图像，仔细观察，得出最终答案
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
          <span>你的猜测</span>
          <input
            type="text"
            value={guess}
            placeholder="输入最初的词语或成语…"
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && valid) onSubmit(guess.trim()) }}
          />
        </label>

        <div className="btn-row">
          <button className="btn primary" disabled={!valid} onClick={() => onSubmit(guess.trim())}>
            确定答案
          </button>
        </div>
      </div>
    </PassDevice>
  )
}
