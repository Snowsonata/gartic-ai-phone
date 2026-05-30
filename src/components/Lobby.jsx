import { useState } from 'react'
import wordBank from '../data/wordBank.json'

const ROLES = ['A', 'B', 'C', 'D']
const TAG = { A: 'tag-A', B: 'tag-B', C: 'tag-C', D: 'tag-D' }

export default function Lobby({ onStart }) {
  const [players, setPlayers] = useState({ A: '', B: '', C: '', D: '' })
  const [catId, setCatId] = useState(wordBank.categories[0].id)

  const setName = (role, v) => setPlayers((p) => ({ ...p, [role]: v }))
  const allNamed = ROLES.every((r) => players[r].trim().length > 0)

  const start = () => {
    const cat = wordBank.categories.find((c) => c.id === catId)
    const word = cat.words[Math.floor(Math.random() * cat.words.length)]
    onStart({
      players: Object.fromEntries(ROLES.map((r) => [r, players[r].trim()])),
      targetWord: word,
      category: cat.label,
    })
  }

  return (
    <div className="card blue reveal">
      <p className="eyebrow">Local pass-and-play · 4 players · 1 device</p>
      <h1 className="title-xl">Set up the relay.</h1>
      <p className="lead">
        One secret word starts the chain. It mutates through a prompt, an AI image, a
        hand drawing, a description, another AI image — and a final guess. Name your
        four players, pick a deck, and pass the phone around.
      </p>

      <div className="player-grid">
        {ROLES.map((r) => (
          <div className="player-card" key={r}>
            <div className={`tag ${TAG[r]}`}>{r}</div>
            <label className="field" style={{ marginBottom: 0 }}>
              <span>Player {r} name</span>
              <input
                type="text"
                value={players[r]}
                placeholder={`e.g. ${['Mai', 'Leo', 'Ana', 'Kit'][ROLES.indexOf(r)]}`}
                onChange={(e) => setName(r, e.target.value)}
                maxLength={20}
              />
            </label>
          </div>
        ))}
      </div>

      <label className="field">
        <span>Word deck</span>
      </label>
      <div className="cat-pills" style={{ marginBottom: 24 }}>
        {wordBank.categories.map((c) => (
          <button
            key={c.id}
            className={`pill ${catId === c.id ? 'on' : ''}`}
            onClick={() => setCatId(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <button className="btn primary" disabled={!allNamed} onClick={start}>
        {allNamed ? 'Draw a secret word & begin →' : 'Name all four players to start'}
      </button>
    </div>
  )
}
