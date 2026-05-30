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
      <h1 className="title-xl">神秘小环节.</h1>
      <p className="lead">
        系统会随机选出一个词语，玩家A看到后写出一个提示词（prompt），AI根据这个提示词画出一张图，玩家B根据这张图画出一张图，玩家C根据玩家B的图写出一个描述，玩家D根据玩家C的描述猜出最初的词语是什么。每个玩家在自己的回合开始前都需要点击“我是 XXX，开始我的回合”来确认自己是当前玩家，确保游戏的公平性和趣味性。
      </p>

      <div className="player-grid">
        {ROLES.map((r) => (
          <div className="player-card" key={r}>
            <div className={`tag ${TAG[r]}`}>{r}</div>
            <label className="field" style={{ marginBottom: 0 }}>
              <span>玩家 {r} 名称</span>
              <input
                type="text"
                value={players[r]}
                placeholder={`e.g. ${['胡文涛', '王婧娇', '张锦添', '刘欣颐'][ROLES.indexOf(r)]}`}
                onChange={(e) => setName(r, e.target.value)}
                maxLength={20}
              />
            </label>
          </div>
        ))}
      </div>

      <label className="field">
        <span>词库</span>
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
        {allNamed ? '开始游戏 →' : '各自取名准备开始'}
      </button>
    </div>
  )
}
