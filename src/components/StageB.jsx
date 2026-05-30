import { useRef, useState } from 'react'
import PassDevice from './PassDevice'
import DrawingCanvas from './DrawingCanvas'

export default function StageB({ playerName, imageA, onSubmit }) {
  const canvasRef = useRef(null)
  const [warn, setWarn] = useState('')

  const submit = () => {
    if (canvasRef.current.isBlank()) {
      setWarn('The canvas is empty — draw something first!')
      return
    }
    const dataURL = canvasRef.current.exportPNG() // Base64 (Image b)
    onSubmit(dataURL)
  }

  return (
    <PassDevice
      role="B"
      name={playerName}
      note="On the left you'll see an AI image. Re-draw it by hand on the right. No words — just your best copy. Then submit."
    >
      <div className="card reveal">
        <p className="eyebrow">Stage 2 · Trace it by hand</p>
        <h1 className="title-xl">Copy the image. By hand.</h1>
        <p className="lead">
          Study the picture and redraw it on the board. It does not need to be good —
          chaos is the point.
        </p>

        <div className="split">
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>REFERENCE — IMAGE A</div>
            <img className="pane-img" src={imageA} alt="AI-generated reference" />
          </div>
          <div>
            <div className="hint" style={{ marginBottom: 8 }}>YOUR DRAWING</div>
            <DrawingCanvas ref={canvasRef} />
          </div>
        </div>

        {warn && <div className="err">{warn}</div>}

        <div className="btn-row">
          <button className="btn primary" onClick={submit}>Submit drawing →</button>
        </div>
      </div>
    </PassDevice>
  )
}
