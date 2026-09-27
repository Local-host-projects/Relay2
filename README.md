# Relay — Frontend

**Making confirmed future money spendable now — and forwardable, before it ever settles.**

Frontend-only prototype for Relay, built for the StacStart "Borderless Bytes" hackathon (Aethercode). All data lives in one `useState` in `src/App.jsx` / `src/state/initialState.js`, so the backend can be wired in later by replacing the `setState` calls with real API calls — the components don't need to change.

---

## The problem

Money that's confirmed but not yet settled is, for all practical purposes, dead money. A bank has agreed to pay it, a merchant has confirmed it, a payroll system has scheduled it — but until it physically lands in an account, the person it belongs to can't touch it.

This shows up in a few disguises:

- **Network downtime** — a transfer is sent while the network is down. The money has left the sender's account, but the recipient can't spend it until connectivity returns and the transfer lands.
- **International settlement delay** — cross-border payments and some merchant payouts are confirmed immediately but settle days later.
- **Salary timing** — a salary is contractually guaranteed at month-end, but unavailable until payday itself, no matter how certain everyone is that it's coming.

In every case, the uncertainty is already resolved — the transaction is verified and its outcome is known. What's missing isn't trust, it's liquidity: a way to use money you already, provably, have coming.

> "Most financial stress isn't about having too little money overall — it's about having money in the wrong time slot."

## The core mechanism

Relay turns a confirmed future transaction into a **promise unit** — a spendable claim the recipient can use immediately, before the underlying money has actually settled.

The moment a transfer is confirmed (even if it hasn't landed), the recipient is notified that the amount is available to spend as a pending balance. They don't wait for settlement — they spend the claim itself.

### Forwarding — the part that makes this more than "pending"

Every transfer app shows a pending state. None of them let you spend it onward. Relay does — a recipient can pay other people directly out of their pending balance, and the system tracks each onward payment as a claim against the original transfer.

| Step | Event |
|---|---|
| 1 | A sends ₦5,000 to B. The transfer is confirmed but not yet settled (e.g. network is down). |
| 2 | B immediately receives a spendable ₦5,000 promise unit — no waiting. |
| 3 | B spends ₦2,000 of it to C, and ₦1,000 to D, while the remaining ₦2,000 stays with B. |
| 4 | When A's original ₦5,000 transfer finally settles, Relay forwards the money directly: ₦2,000 to C, ₦1,000 to D, ₦2,000 to B — rather than routing everything through B first. |

### Settlement order — FIFO, not LIFO

Because a claim can split and move through several hands before the real money arrives, Relay needs a rule for exactly which downstream payment a given inbound settlement corresponds to. Relay resolves this chronologically at each layer — first transaction in is the first one paid out, the same logic as a queue. This keeps the chain auditable: at any point, it's possible to trace exactly who is owed what, and why.

## How it works, end to end

1. **Issuing a promise unit** — a merchant or bank notifies Relay (and the recipient) that a future settlement is coming and verified. Relay issues the promise unit; the recipient can accept or decline it.
2. **Onboarding — no app required to receive money** — the recipient's phone number doubles as their account number (the same pattern OPay and PalmPay use). If they don't already have a Relay account, one is created automatically the first time they receive a promise unit: SMS with a link, set a PIN or use 2FA, and they're in.
3. **Spending and forwarding** — once a user holds a promise unit, they can transfer any portion of it to anyone else, who can do the same in turn. The chain can extend indefinitely; Relay's job is to track who owns which portion at every step.
4. **Instant liquidity (liquidity provider layer)** — not everyone wants to hold a claim and wait. Liquidity providers buy promise units outright, at a discount to face value — same logic as discount pricing in bond markets. A holder who wants cash now can sell to a provider and exit the system immediately.
5. **Architecture — an open API, not a single bank integration** — any party (bank, merchant, employer, remittance provider) can connect and issue promise units against their own verified future transactions. Funds can be secured through an escrow partner, or, for sufficiently trusted counterparties, taken on trust without escrow.

## How this differs from adjacent categories

| Category | What it does | How Relay differs |
|---|---|---|
| Invoice factoring / marketplaces | A factor advances real capital against a single verified invoice, then collects later. Requires a balance sheet. | No capital fronted by default — the claim moves peer-to-peer with nothing financed unless someone specifically wants instant liquidity via a provider. |
| Earned Wage Access apps | The provider advances cash from its own funds, then recoups it from payroll. A financing product. | Not payroll-specific, and nothing is advanced from a provider's balance sheet — the employee spends a claim directly, not an advance. |
| Plain "pending" transfers | Shows a pending state and makes the recipient wait for settlement. | Lets the pending balance be spent — and re-forwarded — before it ever settles. |
| Informal IOUs / rotating credit circles | Already let people spend against a trusted future promise, informally, between people who know each other. | Formalizes this with a system-verified promise (bank- or merchant-confirmed), so it works between strangers and scales past a personal network. |

> Factoring and EWA finance a claim by fronting capital against it. Relay doesn't finance the claim — it lets the claim itself keep moving, peer to peer, until real money catches up to it.

## Wider vision — what this could mean at scale

"Any verified future transaction becomes instantly spendable and forwardable" is closer to a historical pattern than a new idea — it resembles what **bills of exchange** did in medieval and early-modern trade: a merchant's verified IOU circulated hand to hand as a substitute for cash, long before formal banking existed to clear it centrally. Relay is a modern, phone-number-native version of the same idea.

At meaningful scale, this could plausibly:
- Increase monetary velocity for people currently locked out of formal credit — money that's already theirs but stuck in transit becomes usable immediately.
- Displace high-interest short-term credit (payday loans, predatory advances), since people would be spending confirmed income rather than borrowing against uncertain future income.
- Matter disproportionately in **African remittance corridors**, where money sent home can take days and cost real fees.

### What would need to be true for this to work responsibly

Scale introduces real problems a hackathon prototype isn't expected to solve, but a mature Relay eventually would:

- **Cascading default risk** — if a root claim fails to settle after forwarding several hops deep, the failure ripples through everyone holding a piece of it, similar to a bounced check or defaulted commercial paper. A mature system needs a clearinghouse function to contain this.
- **Fraud in trust-based mode** — skipping escrow for "sufficiently trusted" counterparties works in a closed, personally-vetted network. It does not survive a fully open, anyone-can-connect API without additional safeguards.
- **Fair pricing in the liquidity layer** — if a small number of liquidity providers dominate the discount-buying market, the mechanism built to displace predatory credit could reproduce it.

None of this argues against the idea — it argues for treating it the way negotiable instruments eventually were: powerful, and in need of a stabilizing layer (settlement guarantees, fraud containment, rate transparency) once it moves beyond a closed, trusted network.

## What's actually being built for this hackathon

The vision above is the ambition, not the current build. For StacStart, the goal is narrow and deliberate: **prove that a claim on a future, verified transaction can move peer-to-peer and settle correctly when the real money lands — nothing more.**

**In scope for the demo:**
- One concrete, closed-loop scenario (a single sender/issuer and a small set of recipients)
- The core claim → forward → settle loop, built end to end and working live
- FIFO settlement resolving correctly across at least a two-hop chain
- Trust-based fund security for the demo (no live escrow-partner integration required)

**Explicitly out of scope for this build:**
- The fully open "anyone can connect" API surface
- Real escrow-partner integrations
- The liquidity-provider marketplace and discount-pricing engine
- Any of the systemic-risk safeguards above — these are product-maturity concerns, not hackathon-weekend problems

Fresh code is being written for this submission rather than reusing the earlier Wema/ALAT-integrated build from Hackaholics 7.0, so the GitHub history reflects work done specifically for this event.

---

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
  App.jsx                    — top-level state + layout (home view, bubble nav, panels)
  index.css                  — Tailwind directives + the few custom keyframes/utilities
  lib/format.js               — currency formatter (₦)
  state/initialState.js       — dummy starting data (promises, transactions, payer promises)
  components/
    Dot.jsx                   — health status dot
    KV.jsx                    — key/value row used in detail panels
    Btn.jsx                    — primary/secondary button
    Field.jsx / TextInput.jsx  — form field + input
    Panel.jsx / PanelTitle.jsx — bottom sheet used for every overlay
    Toast.jsx                  — bottom toast
    PromiseRow.jsx              — claim row on the home list
    SplitVisual.jsx              — claim-splitting animation (before/after)
    ChainSvg.jsx                  — claim lineage diagram
```

## Where the prototype stands

This frontend demonstrates the core scoped scenario above (claim → forward → settle, FIFO, one issuer/small recipient set), entirely with in-memory dummy state — no network calls yet:

- **Home** — available balance + Relay claims; tap a claim to open it
- **Claim detail → Transfer/Spend** — animates the claim splitting into two pieces
- **Chain view** — SVG tree of a claim's lineage; tap nodes/edges for detail
- **"Settle now (demo)"** — resolves the chain FIFO into settled transactions
- **Liquidity** — enter min/target, "Let Relay search," offers drift in, accept sells the claim for cash *(demo of the liquidity-provider concept — the real discount-pricing engine is out of scope for this build)*
- **Payers** — issue a new promise to a beneficiary

Swap `state/initialState.js` and the mutation functions in `App.jsx` for real API calls when the backend — issuance, forwarding, FIFO settlement, phone-number-based onboarding — is ready to plug in.
