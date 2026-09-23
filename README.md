# Relay — Frontend

Paper-ledger style frontend for Relay, the future-settling promise/claim network.
Frontend-only prototype: all data lives in one `useState` in `src/App.jsx` /
`src/state/initialState.js`, so the backend can be wired in by replacing the
`setState` calls with real API calls — the components don't need to change.

## Setup

```bash
npm install
npm run dev
```

Opens on http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Structure

```
src/
  App.jsx                 — top-level state + layout (home view, bubble nav, panels)
  index.css                — Tailwind directives + the few custom keyframes/utilities
  lib/format.js             — currency formatter (₦)
  state/initialState.js     — dummy starting data (promises, transactions, payer promises)
  components/
    Dot.jsx                 — health status dot
    KV.jsx                  — key/value row used in detail panels
    Btn.jsx                 — primary/secondary button
    Field.jsx / TextInput.jsx — form field + input
    Panel.jsx / PanelTitle.jsx — bottom sheet used for every overlay
    Toast.jsx                — bottom toast
    PromiseRow.jsx            — claim row on the home list
    SplitVisual.jsx           — claim-splitting animation (before/after)
    ChainSvg.jsx               — claim lineage diagram
```

## Where things stand (see the concept doc / UI spec for full context)

- Home: Available balance + Relay claims, tap a claim to open it
- Claim detail → Transfer/Spend: animates the claim splitting into two pieces
- Chain view: SVG tree of a claim's lineage, tap nodes/edges for detail
- "Settle now (demo)": resolves the chain FIFO into settled transactions
- Liquidity: enter min/target, "Let Relay search," offers drift in, accept sells the claim for cash
- Payers: issue a new promise to a beneficiary

Everything is dummy/in-memory — no network calls. Swap `state/initialState.js`
and the mutation functions in `App.jsx` for real API calls when the backend's ready.
