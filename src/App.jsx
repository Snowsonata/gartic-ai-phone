import { useCallback } from 'react'
import { useGameMachine, PHASES } from './hooks/useGameMachine'
import { generateImage } from './api/dashscope'

import ProgressRail from './components/ProgressRail'
import LoadingOverlay from './components/LoadingOverlay'
import Lobby from './components/Lobby'
import StageA from './components/StageA'
import StageB from './components/StageB'
import StageC from './components/StageC'
import StageD from './components/StageD'
import ResultBoard from './components/ResultBoard'

export default function App() {
  const { state, dispatch, stepIndex, isCorrect, reset } = useGameMachine()
  const { phase, players, loading, loadingStatus, error } = state

  // ---- async bridge: prompt/description -> DashScope -> image, advance phase
  const runGeneration = useCallback(
    async (prompt, { commitText, setImage }) => {
      dispatch(commitText) // store the text immediately (pure)
      dispatch({ type: 'SET_LOADING', loading: true })
      dispatch({ type: 'SET_STATUS', status: 'CREATING' })
      try {
        const url = await generateImage(prompt, {
          onStatus: (status) => dispatch({ type: 'SET_STATUS', status }),
        })
        dispatch({ type: setImage, ...(setImage === 'SET_IMAGE_A' ? { imageA: url } : { imageC: url }) })
      } catch (e) {
        dispatch({ type: 'SET_ERROR', error: e.message || 'Image generation failed.' })
      }
    },
    [dispatch]
  )

  const onSubmitA = useCallback(
    (promptA) => runGeneration(promptA, {
      commitText: { type: 'SUBMIT_A', promptA },
      setImage: 'SET_IMAGE_A',
    }),
    [runGeneration]
  )

  const onSubmitC = useCallback(
    (descriptionC) => runGeneration(descriptionC, {
      commitText: { type: 'SUBMIT_C', descriptionC },
      setImage: 'SET_IMAGE_C',
    }),
    [runGeneration]
  )

  const onSubmitB = useCallback((imageB) => dispatch({ type: 'SUBMIT_B', imageB }), [dispatch])
  const onSubmitD = useCallback((guessD) => dispatch({ type: 'SUBMIT_D', guessD }), [dispatch])

  // The current AI-stage label for the loading overlay.
  const loadingLabel = phase === PHASES.STAGE_A ? '生成图片 A' : '生成图片 C'

  return (
    <div className="app-shell">
      <header className="brandbar">
        <div className="brand">
          RELAY<span className="dot">.</span>
          <small>AI 你画 &amp; 我猜</small>
        </div>
        {phase !== PHASES.LOBBY && (
          <button className="btn ghost sm" onClick={reset}>Quit</button>
        )}
      </header>

      {phase !== PHASES.LOBBY && <ProgressRail stepIndex={stepIndex} />}

      {/* ---- state machine router ---- */}
      {phase === PHASES.LOBBY && (
        <Lobby
          onStart={({ players, targetWord, category }) =>
            dispatch({ type: 'START_GAME', players, targetWord, category })
          }
        />
      )}

      {phase === PHASES.STAGE_A && (
        <StageA
          playerName={players.A}
          targetWord={state.targetWord}
          category={state.category}
          onSubmit={onSubmitA}
        />
      )}

      {phase === PHASES.STAGE_B && (
        <StageB playerName={players.B} imageA={state.imageA} onSubmit={onSubmitB} />
      )}

      {phase === PHASES.STAGE_C && (
        <StageC playerName={players.C} imageB={state.imageB} onSubmit={onSubmitC} />
      )}

      {phase === PHASES.STAGE_D && (
        <StageD playerName={players.D} imageC={state.imageC} onSubmit={onSubmitD} />
      )}

      {phase === PHASES.RESULT && (
        <ResultBoard state={state} isCorrect={isCorrect} onReset={reset} />
      )}

      {/* ---- AI generation wait screen (blue) ---- */}
      {loading && <LoadingOverlay status={loadingStatus} label={loadingLabel} />}

      {/* ---- error toast ---- */}
      {error && (
        <div className="card" style={{ position: 'fixed', left: 20, right: 20, bottom: 20, zIndex: 400, borderColor: 'var(--coral)' }}>
          <div className="err" style={{ marginTop: 0 }}>⚠ {error}</div>
          <div className="btn-row">
            <button className="btn coral sm" onClick={() => dispatch({ type: 'SET_ERROR', error: null })}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
