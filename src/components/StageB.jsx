import { useRef, useState } from 'react'
import PassDevice from './PassDevice'
import DrawingCanvas from './DrawingCanvas'

export default function StageB({ playerName, imageA, onSubmit }) {
  const canvasRef = useRef(null)
  const [warn, setWarn] = useState('')

  const submit = () => {
    if (canvasRef.current.isBlank()) {
      setWarn('画布是空的哦，请至少画一点什么再提交~')
      return
    }
    const dataURL = canvasRef.current.exportPNG() // Base64 (Image b)
    onSubmit(dataURL)
  }

  return (
    <PassDevice
      role="B"
      name={playerName}
      note="你会看到AI生成的图片，并在旁边的画布上用手绘方式尽可能复现它。细节不重要，发挥想象，画出你的版本吧"
    >
      <div className="card reveal">
        <p className="eyebrow">第二阶段：手绘复制</p>
        <h1 className="title-xl">尽你所能复现图片</h1>
        <p className="lead">
          观察AI生成的图片，并在旁边的画布上用手绘方式尽可能复现它。细节不重要，发挥想象，画出你的版本吧
        </p>

        <div className="split">
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>复现</div>
            <img className="pane-img" src={imageA} alt="AI-generated reference" />
          </div>
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>你的画作</div>
            <DrawingCanvas ref={canvasRef} />
          </div>
        </div>

        {warn && <div className="err">{warn}</div>}

        <div className="btn-row">
          <button className="btn primary" onClick={submit}>提交画作 →</button>
        </div>
      </div>
    </PassDevice>
  )
}
