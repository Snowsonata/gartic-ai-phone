# RELAY — AI Telephone (Pass &amp; Play)

A single-device, 4-player local relay game: **Gartic Phone × AIGC**. One secret
word mutates through a prompt → an AI image → a hand drawing → a description →
another AI image → a final guess. Everything runs in React local state — no
backend, no sockets.

```
LOBBY → STAGE_A (prompt + AI) → STAGE_B (draw) → STAGE_C (describe + AI) → STAGE_D (guess) → RESULT
```

## Project structure

```
gartic-ai-phone/
├── index.html                 # Vite entry + Google Fonts
├── vite.config.js             # dev server + DashScope proxy (injects key server-side)
├── package.json
├── .env.example               # copy to .env and fill in your key
├── server/
│   └── proxy.mjs              # standalone Express proxy (alternative to the Vite proxy)
└── src/
    ├── main.jsx
    ├── App.jsx                # game-loop controller / state-machine router
    ├── styles.css             # full theme (ink-blue palette, blue-only progress)
    ├── data/wordBank.json     # local word/idiom bank
    ├── api/dashscope.js       # async text-to-image helper (create task + poll)
    ├── hooks/useGameMachine.js# pure reducer: LOBBY→A→B→C→D→RESULT
    └── components/
        ├── Lobby.jsx
        ├── ProgressRail.jsx   # blue stage indicator
        ├── PassDevice.jsx     # "pass the device to X" privacy gate
        ├── LoadingOverlay.jsx # blue AI-wait overlay
        ├── StageA.jsx         # secret word + prompt (strict char validation)
        ├── StageB.jsx         # reference image + canvas
        ├── DrawingCanvas.jsx  # HTML5 canvas: brush/size/eraser/clear + toDataURL
        ├── StageC.jsx         # drawing + description
        ├── StageD.jsx         # final guess
        └── ResultBoard.jsx    # verdict + full evolution chain
```

## Setup

```bash
npm install
cp .env.example .env      # then paste your DashScope API key
npm run dev               # http://localhost:5173
```

Get a key from the Alibaba Cloud Model Studio (百炼) console.

## API key & CORS — read this

Calling DashScope **directly from the browser** has two problems: (1) CORS, and
(2) your API key would be embedded in the shipped JS for anyone to steal. This
project defaults to **proxy mode**, which fixes both:

- **Proxy mode (default, recommended).** Set `DASHSCOPE_API_KEY` (no `VITE_`
  prefix) in `.env`. The browser calls relative paths like `/dashscope/...`;
  the Vite dev proxy attaches the `Authorization` header on the server side and
  forwards to DashScope. The key never reaches the client.
  - Not using Vite's dev server? Run the standalone proxy instead:
    `npm run proxy` (serves `/dashscope/*` on port 8787).
- **Direct mode (throwaway local testing only).** Set
  `VITE_DASHSCOPE_MODE=direct` and `VITE_DASHSCOPE_API_KEY=...`. The browser
  talks to DashScope itself. **The key is exposed in the bundle** — only do this
  with a key you can freely rotate, never in anything you deploy.

## How the image API works (async)

`src/api/dashscope.js` follows the two-request async pattern:

1. `POST /services/aigc/text2image/image-synthesis` with header
   `X-DashScope-Async: enable` → returns `output.task_id`.
2. Poll `GET /tasks/{task_id}` every ~3s until `task_status` is `SUCCEEDED`
   (statuses: `PENDING → RUNNING → SUCCEEDED | FAILED`) → image URL in
   `output.results[0].url` (valid 24h).

Models (`VITE_DASHSCOPE_MODEL`): `wanx2.1-t2i-turbo` (default, fast),
`wanx2.1-t2i-plus` (higher quality), `wanx2.0-t2i-turbo`, or `wanx-v1`.
Sizes via `VITE_IMAGE_SIZE`, e.g. `1024*1024`.

## Notes

- **Strict prompt rule (Stage A):** the prompt may not contain *any* character
  that appears in the secret word (works per-character for Chinese idioms and
  per-letter for English). Validation is live in `StageA.jsx`.
- **Privacy:** each stage is gated behind a "pass the device to Player X"
  screen so the next player can't see prior answers until they tap to start.
- **Color rule:** all progress/loading UI is blue (`--blue` / `--blue-bright`);
  there are no green progress bars anywhere.
