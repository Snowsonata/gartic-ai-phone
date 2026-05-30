function Connector() {
  return (
    <div className="connector">
      <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
        <path d="M11 0 V26" stroke="var(--ink)" strokeWidth="2.5" strokeDasharray="4 4" />
        <path d="M4 22 L11 32 L18 22" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

const WHO_BG = { A: 'var(--blue)', B: 'var(--coral)', C: 'var(--marigold)', D: 'var(--ink)' }

function Step({ who, role, what, children }) {
  return (
    <div className="chain-step reveal">
      <div className="chain-card">
        <div className="chain-meta">
          {who && (
            <span className="who" style={{ background: WHO_BG[role], color: role === 'C' ? 'var(--ink)' : '#fff' }}>
              {who}
            </span>
          )}
          <span className="what">{what}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function ResultBoard({ state, isCorrect, onReset }) {
  const { players, targetWord, promptA, imageA, imageB, descriptionC, imageC, guessD } = state

  return (
    <div>
      <div className="verdict reveal">
        <div className={`badge ${isCorrect ? 'win' : 'lose'}`}>
          {isCorrect ? 'NAILED IT! 🎯' : 'NOT QUITE 😵'}
        </div>
        <p>
          {players.D || 'Player D'} guessed <b>“{guessD}”</b> · the secret word was{' '}
          <b>“{targetWord}”</b>
        </p>
      </div>

      <Step what="The secret word">
        <div className="chain-text big">{targetWord}</div>
      </Step>
      <Connector />

      <Step who={players.A || 'Player A'} role="A" what="wrote the prompt">
        <div className="chain-text">“{promptA}”</div>
      </Step>
      <Connector />

      <Step who="AI · 通义万相" role="A" what="generated Image A">
        <img className="chain-img" src={imageA} alt="Image A" />
      </Step>
      <Connector />

      <Step who={players.B || 'Player B'} role="B" what="drew it by hand (Image B)">
        <img className="chain-img" src={imageB} alt="Image B drawing" />
      </Step>
      <Connector />

      <Step who={players.C || 'Player C'} role="C" what="described the drawing">
        <div className="chain-text">“{descriptionC}”</div>
      </Step>
      <Connector />

      <Step who="AI · 通义万相" role="C" what="generated Image C">
        <img className="chain-img" src={imageC} alt="Image C" />
      </Step>
      <Connector />

      <Step who={players.D || 'Player D'} role="D" what="guessed">
        <div className="chain-text big" style={{ color: isCorrect ? 'var(--blue-deep)' : 'var(--coral)' }}>
          {guessD}
        </div>
      </Step>

      <div className="btn-row" style={{ justifyContent: 'center', marginTop: 30 }}>
        <button className="btn primary" onClick={onReset}>Play again ↺</button>
      </div>
    </div>
  )
}
