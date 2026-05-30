import { useReducer, useCallback } from 'react'

// The whole game lives in local React state. No server, no sockets.
// Phases form the state machine:
//   LOBBY -> STAGE_A -> STAGE_B -> STAGE_C -> STAGE_D -> RESULT
export const PHASES = {
  LOBBY: 'LOBBY',
  STAGE_A: 'STAGE_A',
  STAGE_B: 'STAGE_B',
  STAGE_C: 'STAGE_C',
  STAGE_D: 'STAGE_D',
  RESULT: 'RESULT',
}

// Linear order used to advance the machine.
const ORDER = [
  PHASES.LOBBY,
  PHASES.STAGE_A,
  PHASES.STAGE_B,
  PHASES.STAGE_C,
  PHASES.STAGE_D,
  PHASES.RESULT,
]

const initialState = {
  phase: PHASES.LOBBY,
  players: { A: '', B: '', C: '', D: '' },
  targetWord: '',
  category: '',
  // Relay payloads, in chain order:
  promptA: '', // Player A's text prompt
  imageA: '', // AI image generated from promptA
  imageB: '', // Player B's hand-drawn canvas (Base64 data URL)
  descriptionC: '', // Player C's text description of imageB
  imageC: '', // AI image generated from descriptionC
  guessD: '', // Player D's final guess
  // UX:
  loading: false,
  loadingStatus: '', // DashScope task status surfaced to the overlay
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        phase: PHASES.STAGE_A,
        players: action.players,
        targetWord: action.targetWord,
        category: action.category,
      }

    case 'SET_LOADING':
      return { ...state, loading: action.loading, error: action.loading ? null : state.error }

    case 'SET_STATUS':
      return { ...state, loadingStatus: action.status }

    case 'SET_ERROR':
      return { ...state, loading: false, error: action.error }

    case 'SUBMIT_A':
      return { ...state, promptA: action.promptA }
    case 'SET_IMAGE_A':
      return { ...state, imageA: action.imageA, loading: false, phase: PHASES.STAGE_B }

    case 'SUBMIT_B':
      return { ...state, imageB: action.imageB, phase: PHASES.STAGE_C }

    case 'SUBMIT_C':
      return { ...state, descriptionC: action.descriptionC }
    case 'SET_IMAGE_C':
      return { ...state, imageC: action.imageC, loading: false, phase: PHASES.STAGE_D }

    case 'SUBMIT_D':
      return { ...state, guessD: action.guessD, phase: PHASES.RESULT }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function useGameMachine() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const stepIndex = ORDER.indexOf(state.phase)

  // Did Player D get it right? Case-insensitive, trimmed, punctuation-tolerant.
  const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, '').replace(/[.,!?。，！？]/g, '')
  const isCorrect = state.phase === PHASES.RESULT &&
    normalize(state.guessD) === normalize(state.targetWord)

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, dispatch, stepIndex, isCorrect, reset, PHASES, ORDER }
}
