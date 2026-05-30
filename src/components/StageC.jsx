import { useState } from 'react'
import PassDevice from './PassDevice'

export default function StageC({ playerName, imageB, onSubmit }) {
  const [desc, setDesc] = useState('')
  const valid = desc.trim().length >= 3

  return (
    <PassDevice
      role="C"
      name={playerName}
      note="你会看到一幅手绘图片。用简单的语言描述你认为它画的是什么。AI将会根据你的描述生成一张新的图片。"
    >
      <div className="card blue reveal">
        <p className="eyebrow">第三阶段：再回想</p>
        <h1 className="title-xl">你觉得这是何物</h1>
        <p className="lead">
          你的描述将传递给ai再次生成图片，最后一位玩家将根据这张图猜出最初的词语是什么，仔细观察，发挥想象，写下你的描述吧
        </p>

        <div className="split">
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>PLAYER B'S DRAWING</div>
            <img className="pane-img" src={imageB} alt="Hand drawing to describe" />
          </div>
          <div>
            <label className="field">
              <span>
                你的描述：
                <i className="counter">{desc.length}/300</i>
              </span>
              <textarea
                value={desc}
                maxLength={300}
                placeholder="自行发挥…"
                onChange={(e) => setDesc(e.target.value)}
                style={{ minHeight: 220 }}
              />
            </label>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn primary" disabled={!valid} onClick={() => onSubmit(desc.trim())}>
            生成图片 →
          </button>
        </div>
      </div>
    </PassDevice>
  )
}
