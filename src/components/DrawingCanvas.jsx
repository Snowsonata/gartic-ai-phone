import {
  forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback,
} from 'react'

const PALETTE = ['#14183a', '#1f4cff', '#ff5a3c', '#ffb020', '#1aa37a', '#8e44ad', '#ffffff']
const SIZES = [3, 6, 12, 24]
const CANVAS_PX = 1024 // internal resolution (square)

/**
 * A self-contained drawing board.
 * Tools: color palette, brush sizes, eraser, clear.
 * Export: parent calls ref.current.exportPNG() -> Base64 data URL (toDataURL).
 *         ref.current.isBlank() -> whether anything was drawn.
 */
const DrawingCanvas = forwardRef(function DrawingCanvas(_props, ref) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const dirty = useRef(false)

  const [color, setColor] = useState(PALETTE[0])
  const [size, setSize] = useState(SIZES[1])
  const [eraser, setEraser] = useState(false)

  // ---- set up the canvas + white background once ----
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = CANVAS_PX
    canvas.height = CANVAS_PX
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX) // opaque white so PNG isn't transparent
    ctxRef.current = ctx
  }, [])

  // map a pointer event to canvas-internal coordinates
  const pos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = CANVAS_PX / rect.width
    const scaleY = CANVAS_PX / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const start = useCallback((e) => {
    e.preventDefault()
    canvasRef.current.setPointerCapture?.(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }, [pos])

  const move = useCallback((e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = ctxRef.current
    const p = pos(e)
    ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over'
    // eraser paints transparency, but we want white -> use source-over white instead
    if (eraser) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = '#ffffff'
    } else {
      ctx.strokeStyle = color
    }
    ctx.lineWidth = eraser ? size * 2.2 : size
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    dirty.current = true
  }, [color, size, eraser, pos])

  const end = useCallback(() => { drawing.current = false }, [])

  const clear = useCallback(() => {
    const ctx = ctxRef.current
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_PX, CANVAS_PX)
    dirty.current = false
  }, [])

  useImperativeHandle(ref, () => ({
    // Export the canvas as a Base64 data URL.
    exportPNG: () => canvasRef.current.toDataURL('image/png'),
    isBlank: () => !dirty.current,
    clear,
  }), [clear])

  return (
    <div>
      <div className="toolbar">
        <div className="swatches">
          {PALETTE.map((c) => (
            <button
              key={c}
              className={`swatch ${!eraser && color === c ? 'on' : ''}`}
              style={{ background: c }}
              onClick={() => { setColor(c); setEraser(false) }}
              aria-label={`color ${c}`}
            />
          ))}
        </div>

        <div className="tool">
          <span>粗细</span>
          {SIZES.map((s) => (
            <button
              key={s}
              className={`tool-btn ${!eraser && size === s ? 'on' : ''}`}
              onClick={() => { setSize(s); }}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          className={`tool-btn ${eraser ? 'on' : ''}`}
          onClick={() => setEraser((v) => !v)}
        >
          ⌫ 橡皮擦
        </button>
        <button className="tool-btn" onClick={clear}>↺ 清空</button>
      </div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="canvas-el"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
      </div>
    </div>
  )
})

export default DrawingCanvas
