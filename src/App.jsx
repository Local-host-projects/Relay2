import { useRef, useState } from 'react'
import { fmt } from './lib/format'
import { initialState } from './state/initialState'

import Dot from './components/Dot'
import KV from './components/KV'
import Btn from './components/Btn'
import Field from './components/Field'
import TextInput from './components/TextInput'
import Panel from './components/Panel'
import PanelTitle from './components/PanelTitle'
import Toast from './components/Toast'
import PromiseRow from './components/PromiseRow'
import SplitVisual from './components/SplitVisual'
import ChainSvg from './components/ChainSvg'

export default function App() {
  const [state, setState] = useState(initialState())
  const [activePanel, setActivePanel] = useState(null) // 'claim' | 'transfer' | 'chain' | 'liquidity' | 'payers' | 'health' | 'transactions'
  const [activeClaimId, setActiveClaimId] = useState(null)
  const [transferMode, setTransferMode] = useState('transfer')
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [chainDetail, setChainDetail] = useState(null)
  const [liquidityClaimId, setLiquidityClaimId] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toastTimer = useRef(null)

  function showToast(msg) {
    setToastMsg(msg)
    setToastShow(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastShow(false), 2200)
  }

  function closePanel() {
    setActivePanel(null)
  }

  const activeClaim = state.promises.find((p) => p.id === activeClaimId)

  /* ---- Transfer ---- */
  const [splitStage, setSplitStage] = useState('before')
  const [pendingAmt, setPendingAmt] = useState(0)
  const [pendingRecipient, setPendingRecipient] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [recipientInput, setRecipientInput] = useState('')
  const [showSplit, setShowSplit] = useState(false)

  function openTransfer(id, mode) {
    setActiveClaimId(id)
    setTransferMode(mode)
    const p = state.promises.find((x) => x.id === id)
    setRecipientInput(p.id === 'p-8472' && (!p.chain || p.chain.edges.length === 0) ? 'C' : p.id === 'p-8472' ? 'D' : '')
    setAmountInput('')
    setShowSplit(false)
    setActivePanel('transfer')
  }

  function confirmTransfer() {
    const p = state.promises.find((x) => x.id === activeClaimId)
    const amt = parseFloat(amountInput)
    const recipient = recipientInput.trim() || '—'
    if (!amt || amt <= 0 || amt > p.remaining) {
      showToast('Enter an amount up to ' + fmt(p.remaining))
      return
    }
    setPendingAmt(amt)
    setPendingRecipient(recipient)
    setSplitStage('before')
    setShowSplit(true)
    setTimeout(() => setSplitStage('after'), 150)
    setTimeout(() => {
      setState((prev) => {
        const promises = prev.promises.map((pr) => {
          if (pr.id !== activeClaimId) return pr
          const updated = { ...pr, remaining: pr.remaining - amt }
          if (pr.id === 'p-8472') {
            const edges = pr.chain ? pr.chain.edges.slice() : []
            const from = edges.length === 0 ? 'B (you)' : edges[edges.length - 1].to
            edges.push({ from, to: recipient, amount: amt })
            updated.chain = { root: 'A', edges }
          }
          return updated
        })
        return { ...prev, promises }
      })
      showToast(fmt(amt) + ' sent to ' + recipient + ' — spendable now, before settlement')
      setTimeout(() => {
        closePanel()
      }, 700)
    }, 800)
  }

  /* ---- Settle ---- */
  function settleChain() {
    closePanel()
    showToast('Settling…')
    setTimeout(() => {
      setState((prev) => {
        const p = prev.promises.find((x) => x.id === 'p-8472')
        const edges = p.chain ? p.chain.edges : []
        let totalForwarded = 0
        const newTx = edges.map((e) => {
          totalForwarded += e.amount
          return { amount: e.amount, desc: e.to + ' received (forwarded from Promise #8472)' }
        })
        const toYou = p.amount - totalForwarded
        newTx.unshift({ amount: toYou, desc: 'You received — remaining balance of Promise #8472' })
        const promises = prev.promises.map((pr) => (pr.id === 'p-8472' ? { ...pr, remaining: 0 } : pr))
        showToast('Settled — ' + fmt(p.amount) + ' resolved across ' + (edges.length + 1) + ' recipients, FIFO')
        return {
          ...prev,
          promises,
          transactions: [...newTx, ...prev.transactions],
          available: prev.available + toYou,
        }
      })
    }, 900)
  }

  /* ---- Liquidity / Auction ---- */
  const [auctionStage, setAuctionStage] = useState('idle') // idle | searching | offers
  const [offers, setOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [lqMin, setLqMin] = useState(0)
  const [lqTarget, setLqTarget] = useState(0)

  function openLiquidity(claimId) {
    const target = claimId ? state.promises.find((x) => x.id === claimId) : state.promises.find((x) => x.remaining > 0)
    setLiquidityClaimId(target ? target.id : null)
    setAuctionStage('idle')
    setSelectedOffer(null)
    if (target) {
      setLqMin(Math.round(target.remaining * 0.94))
      setLqTarget(Math.round(target.remaining * 0.985))
    }
    setActivePanel('liquidity')
  }

  function runAuction() {
    const target = state.promises.find((x) => x.id === liquidityClaimId)
    setAuctionStage('searching')
    setTimeout(() => {
      const providers = [
        { name: 'Provider A', amount: Math.round(target.remaining * 0.964) },
        { name: 'Provider B', amount: Math.round(target.remaining * 0.978) },
        { name: 'Provider C', amount: Math.round(target.remaining * 0.958) },
      ]
      setOffers(providers)
      setAuctionStage('offers')
    }, 900)
  }

  function acceptOffer(pr) {
    setState((prev) => ({
      ...prev,
      available: prev.available + pr.amount,
      promises: prev.promises.map((p) => (p.id === liquidityClaimId ? { ...p, remaining: 0 } : p)),
    }))
    closePanel()
    showToast('Sold to ' + pr.name + ' for ' + fmt(pr.amount))
  }

  /* ---- Payers ---- */
  const [pyName, setPyName] = useState('')
  const [pyAmount, setPyAmount] = useState('')
  const [pyDate, setPyDate] = useState('')

  function createPromise() {
    if (!pyName.trim() || !pyAmount) {
      showToast('Fill in beneficiary and amount')
      return
    }
    const amt = parseFloat(pyAmount)
    setState((prev) => ({
      ...prev,
      payerPromises: [
        { id: 'pp' + Date.now(), amount: amt, to: pyName.trim(), settlement: pyDate.trim() || 'Pending', status: 'verified' },
        ...prev.payerPromises,
      ],
    }))
    showToast('Promise created — ' + fmt(amt) + ' spendable by ' + pyName.trim() + ' now')
    setPyName('')
    setPyAmount('')
    setPyDate('')
  }

  /* ---- Nav ---- */
  function summon(target) {
    setBubbleOpen(false)
    setActiveSection(target)
    if (target === 'home') {
      closePanel()
      return
    }
    if (target === 'chain') {
      setChainDetail(null)
      setActivePanel('chain')
      return
    }
    if (target === 'liquidity') {
      openLiquidity(null)
      return
    }
    if (target === 'payers') {
      setActivePanel('payers')
      return
    }
    if (target === 'transactions') {
      setActivePanel('transactions')
      return
    }
  }

  const relayTotal = state.promises.reduce((s, p) => s + p.remaining, 0)
  const p8472 = state.promises.find((p) => p.id === 'p-8472')

  const chainSummaryText = (() => {
    if (!p8472.chain || p8472.chain.edges.length === 0) return 'A → B (you) · not yet forwarded'
    const names = ['A', 'B'].concat(p8472.chain.edges.map((e) => e.to))
    return names.join(' → ')
  })()

  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'chain', label: 'Chain' },
    { key: 'liquidity', label: 'Liquidity' },
    { key: 'payers', label: 'Payers' },
    { key: 'transactions', label: 'Transactions' },
  ]

  return (
    <div>
      <div className="max-w-[560px] mx-auto min-h-screen bg-paper dark:bg-dpaper px-[22px] pt-7 pb-[140px] relative shadow-[0_0_60px_rgba(0,0,0,0.15)]">
        {/* Masthead */}
        <div className="flex items-baseline justify-between border-b-2 border-ink dark:border-dink pb-2.5 mb-1">
          <div className="font-serif font-semibold text-[26px] tracking-tight">Relay</div>
          <div className="text-[12px] text-inkSoft dark:text-dinkSoft tabular-nums">
            {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div className="text-[11.5px] text-inkFaint dark:text-dinkFaint tracking-wide mb-6 uppercase">
          Money that's confirmed, spendable before it settles
        </div>

        {/* Available */}
        <div className="text-[11px] tracking-wide text-inkFaint dark:text-dinkFaint mb-3.5">Available</div>
        <div className="font-serif font-semibold text-[44px] leading-none tabular-nums my-0.5">{fmt(state.available)}</div>
        <div className="text-[13px] text-inkSoft dark:text-dinkSoft">Settled — yours to spend freely</div>

        <hr className="border-t border-ruleStrong dark:border-druleStrong my-6" />

        {/* Relay */}
        <div className="flex justify-between items-center text-[11px] tracking-wide text-inkFaint dark:text-dinkFaint mb-3.5">
          <span>Relay</span>
          <span>{fmt(relayTotal)}</span>
        </div>
        <div>
          {state.promises
            .filter((p) => p.remaining > 0)
            .map((p) => (
              <PromiseRow
                key={p.id}
                p={p}
                onClick={() => {
                  setActiveClaimId(p.id)
                  setActivePanel('claim')
                }}
              />
            ))}
        </div>

        <hr className="border-t border-ruleStrong dark:border-druleStrong my-6" />

        {/* Chain */}
        <div className="text-[11px] tracking-wide text-inkFaint dark:text-dinkFaint mb-3.5">Chain</div>
        <div className="font-mono text-[13px] text-inkSoft dark:text-dinkSoft">{chainSummaryText}</div>
        <div className="text-[13px] text-inkSoft dark:text-dinkSoft mt-1.5">Tap the bubble below, then Chain, to trace it</div>

        <hr className="border-t border-ruleStrong dark:border-druleStrong my-6" />

        {/* Transactions */}
        <div className="text-[11px] tracking-wide text-inkFaint dark:text-dinkFaint mb-3.5">Transactions</div>
        {state.transactions.length === 0 ? (
          <div className="text-[13px] text-inkFaint dark:text-dinkFaint py-2.5">Nothing has settled yet.</div>
        ) : (
          state.transactions.map((t, i) => (
            <div key={i} className="flex items-start justify-between py-4 px-1 border-b border-rule dark:border-drule last:border-b-0">
              <div>
                <div className="font-serif font-semibold text-[21px] tabular-nums">{fmt(t.amount)}</div>
                <div className="text-[12.5px] text-inkSoft dark:text-dinkSoft mt-1">{t.desc}</div>
              </div>
              <div className="text-[10.5px] tracking-wide uppercase text-inkSoft dark:text-dinkSoft flex items-center">
                <Dot health="healthy" />
                Settled
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bubble nav */}
      <div
        className="fixed right-5 z-[60] flex flex-col-reverse items-end gap-2.5"
        style={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          className={`flex flex-col items-end gap-2 mb-1 transition-all duration-150 ${
            bubbleOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {navItems.map((item) => (
            <div
              key={item.key}
              onClick={() => summon(item.key)}
              className={`bg-paper dark:bg-dpaper border ${
                activeSection === item.key ? 'border-ink dark:border-dink' : 'border-ruleStrong dark:border-druleStrong'
              } text-ink dark:text-dink text-[13px] px-4 py-2 rounded-full cursor-pointer shadow-md whitespace-nowrap flex items-center gap-2`}
            >
              {item.label}
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeSection === item.key ? 'bg-verified dark:bg-dverified' : 'bg-ruleStrong dark:bg-druleStrong'
                }`}
              ></span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setBubbleOpen((o) => !o)}
          className="w-[54px] h-[54px] rounded-full bg-ink dark:bg-dink text-paper dark:text-dpaper flex items-center justify-center font-serif text-xl shadow-lg active:scale-95 transition-transform border-none"
        >
          ●
        </button>
      </div>

      {/* Scrim */}
      <div
        className={`fixed inset-0 bg-black/40 z-[70] transition-opacity duration-200 ${
          activePanel ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closePanel}
      ></div>

      {/* Claim panel */}
      <Panel open={activePanel === 'claim'} onClose={closePanel}>
        {activeClaim && (
          <div>
            <PanelTitle>{fmt(activeClaim.remaining)}</PanelTitle>
            <KV k="From" v={activeClaim.from} />
            <KV k="To" v={activeClaim.to} />
            <KV
              k="Status"
              v={
                <span className="flex items-center">
                  <Dot health={activeClaim.health} />
                  {activeClaim.status}
                </span>
              }
            />
            <KV k="Settlement" v={activeClaim.settlement} />
            <KV k="Available now" v={fmt(activeClaim.remaining)} />
            <div className="flex gap-2 flex-wrap mt-4.5 mb-1.5">
              <Btn onClick={() => openTransfer(activeClaim.id, 'transfer')}>Transfer</Btn>
              <Btn variant="secondary" onClick={() => openTransfer(activeClaim.id, 'spend')}>
                Spend
              </Btn>
              <Btn
                variant="secondary"
                onClick={() => {
                  closePanel()
                  setTimeout(() => openLiquidity(activeClaim.id), 250)
                }}
              >
                Sell for cash
              </Btn>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Btn
                variant="secondary"
                onClick={() => {
                  setChainDetail(null)
                  setActivePanel('chain')
                }}
              >
                View chain
              </Btn>
              <Btn variant="secondary" onClick={() => setActivePanel('health')}>
                Health
              </Btn>
              {activeClaim.id === 'p-8472' && (
                <Btn variant="secondary" onClick={settleChain}>
                  Settle now (demo)
                </Btn>
              )}
            </div>
          </div>
        )}
      </Panel>

      {/* Transfer panel */}
      <Panel open={activePanel === 'transfer'} onClose={closePanel}>
        {activeClaim && (
          <div>
            <PanelTitle>
              {transferMode === 'spend' ? 'Spend' : 'Transfer'} from {fmt(activeClaim.remaining)}
            </PanelTitle>
            <Field label="Amount">
              <TextInput type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} placeholder="e.g. 2000" />
            </Field>
            <Field label="Recipient">
              <TextInput type="text" value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} placeholder="e.g. C" />
            </Field>
            {showSplit && (
              <SplitVisual
                total={activeClaim.remaining + (splitStage === 'after' ? pendingAmt : 0)}
                amt={pendingAmt}
                recipient={pendingRecipient}
                stage={splitStage}
              />
            )}
            <Btn className="w-full mt-1" onClick={confirmTransfer}>
              {transferMode === 'spend' ? 'Spend' : 'Split & send'}
            </Btn>
            <div className="text-[13px] text-inkSoft dark:text-dinkSoft mt-2.5">
              {transferMode === 'spend'
                ? "This leaves your merchant's system as settled cash to them; your claim divides the same way as a transfer."
                : 'The claim splits immediately — your recipient can spend or forward it before anything settles.'}
            </div>
          </div>
        )}
      </Panel>

      {/* Chain panel */}
      <Panel open={activePanel === 'chain'} onClose={closePanel}>
        <PanelTitle>Chain</PanelTitle>
        <div className="w-full overflow-x-auto py-1.5 pb-3.5">
          <ChainSvg
            promise={p8472}
            onNode={(name) => {
              const edgesIn = [{ from: 'A', to: 'B (you)', amount: 5000 }].concat(p8472.chain.edges).filter((e) => e.to === name)
              const edgesOut = p8472.chain.edges.filter((e) => e.from === name)
              const received = edgesIn.reduce((s, e) => s + e.amount, 0)
              const sent = edgesOut.reduce((s, e) => s + e.amount, 0)
              setChainDetail({ type: 'node', name, received, sent })
            }}
            onEdge={(from, to, amount) => setChainDetail({ type: 'edge', from, to, amount })}
          />
        </div>
        {!chainDetail && <div className="text-[13px] text-inkFaint dark:text-dinkFaint py-2.5">Tap a node or a line to inspect it.</div>}
        {chainDetail && chainDetail.type === 'node' && (
          <div>
            <div className="text-[11px] tracking-wide uppercase text-inkFaint dark:text-dinkFaint mt-4.5 mb-2">{chainDetail.name}</div>
            <KV k="Received" v={fmt(chainDetail.received)} />
            {chainDetail.sent > 0 && <KV k="Forwarded" v={fmt(chainDetail.sent)} />}
            <KV k="Remaining" v={fmt(chainDetail.received - chainDetail.sent)} />
          </div>
        )}
        {chainDetail && chainDetail.type === 'edge' && (
          <div>
            <div className="text-[11px] tracking-wide uppercase text-inkFaint dark:text-dinkFaint mt-4.5 mb-2">
              {chainDetail.from} → {chainDetail.to}
            </div>
            <KV k="Amount" v={fmt(chainDetail.amount)} />
            <KV k="Parent claim" v="Promise #8472" />
            <KV k="Status" v="Pending settlement" />
          </div>
        )}
      </Panel>

      {/* Liquidity panel */}
      <Panel open={activePanel === 'liquidity'} onClose={closePanel}>
        {(() => {
          const target = state.promises.find((x) => x.id === liquidityClaimId)
          if (!target)
            return (
              <div>
                <PanelTitle>Liquidity</PanelTitle>
                <div className="text-[13px] text-inkFaint dark:text-dinkFaint py-2.5">No spendable claims to sell right now.</div>
              </div>
            )
          return (
            <div>
              <PanelTitle>Get cash now</PanelTitle>
              <KV k="Claim value" v={fmt(target.remaining)} />
              <KV k="Settlement" v={target.settlement} />
              <Field label="Your minimum">
                <TextInput type="number" value={lqMin} onChange={(e) => setLqMin(e.target.value)} />
              </Field>
              <Field label="Your target">
                <TextInput type="number" value={lqTarget} onChange={(e) => setLqTarget(e.target.value)} />
              </Field>
              {auctionStage === 'idle' && (
                <Btn className="w-full" onClick={runAuction}>
                  Let Relay search offers
                </Btn>
              )}
              {auctionStage === 'searching' && (
                <div className="text-[13px] text-inkSoft dark:text-dinkSoft flex items-center gap-2 mt-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-attention dark:bg-dattention anim-pulse-dot"></span>
                  Searching liquidity providers…
                </div>
              )}
              {auctionStage === 'offers' && (
                <div>
                  <div className="text-[11px] tracking-wide uppercase text-inkFaint dark:text-dinkFaint mt-4.5 mb-2">
                    3 providers available
                  </div>
                  <div className="relative h-[150px] my-2.5">
                    {offers.map((pr, i) => {
                      const positions = [
                        { top: 8, left: '6%' },
                        { top: 60, left: '52%' },
                        { top: 100, left: '20%' },
                      ]
                      const isSelected = selectedOffer && selectedOffer.name === pr.name
                      const isReceded = selectedOffer && selectedOffer.name !== pr.name
                      return (
                        <div
                          key={pr.name}
                          onClick={() => setSelectedOffer(pr)}
                          className={`absolute anim-drift-in bg-paper dark:bg-dpaper border rounded-full px-3.5 py-2 text-[13px] cursor-pointer shadow-md transition-all duration-200 ${
                            isSelected
                              ? 'border-ink dark:border-dink bg-accentSoft dark:bg-daccentSoft scale-110 z-10'
                              : 'border-ruleStrong dark:border-druleStrong'
                          } ${isReceded ? 'opacity-25 scale-90' : ''}`}
                          style={{ top: positions[i].top, left: positions[i].left, animationDelay: i * 0.12 + 's' }}
                        >
                          <b className="font-serif">{fmt(pr.amount)}</b> — {pr.name}
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-[13px] text-inkSoft dark:text-dinkSoft">Tap an offer to select it.</div>
                  {selectedOffer && (
                    <div className="mt-3">
                      <KV k="Receive now" v={fmt(selectedOffer.amount)} />
                      <KV k="Claim value" v={fmt(target.remaining)} />
                      <KV k="Difference" v={fmt(target.remaining - selectedOffer.amount)} />
                      <Btn className="w-full mt-3" onClick={() => acceptOffer(selectedOffer)}>
                        Accept {selectedOffer.name}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}
      </Panel>

      {/* Payers panel */}
      <Panel open={activePanel === 'payers'} onClose={closePanel}>
        <PanelTitle>Payer workspace</PanelTitle>
        <div className="text-[13px] text-inkSoft dark:text-dinkSoft mb-3.5">
          Issue a verified future payment — the recipient can spend it before it settles.
        </div>
        <Field label="Beneficiary">
          <TextInput type="text" value={pyName} onChange={(e) => setPyName(e.target.value)} placeholder="e.g. B" />
        </Field>
        <Field label="Amount">
          <TextInput type="number" value={pyAmount} onChange={(e) => setPyAmount(e.target.value)} placeholder="e.g. 150000" />
        </Field>
        <Field label="Settlement date">
          <TextInput type="text" value={pyDate} onChange={(e) => setPyDate(e.target.value)} placeholder="e.g. Sept 30" />
        </Field>
        <Btn className="w-full" onClick={createPromise}>
          Create Relay promise
        </Btn>
        <div className="text-[11px] tracking-wide uppercase text-inkFaint dark:text-dinkFaint mt-5.5 mb-2">Active promises</div>
        {state.payerPromises.map((pp) => (
          <div key={pp.id} className="flex items-start justify-between py-4 px-1 border-b border-rule dark:border-drule last:border-b-0">
            <div>
              <div className="font-serif font-semibold text-[21px] tabular-nums">{fmt(pp.amount)}</div>
              <div className="text-[12.5px] text-inkSoft dark:text-dinkSoft mt-1">To {pp.to}</div>
              <div className="text-[12.5px] text-inkFaint dark:text-dinkFaint">{pp.settlement}</div>
            </div>
            <div className="text-[10.5px] tracking-wide uppercase text-inkSoft dark:text-dinkSoft flex items-center">
              <Dot health="healthy" />
              {pp.status}
            </div>
          </div>
        ))}
      </Panel>

      {/* Health panel */}
      <Panel open={activePanel === 'health'} onClose={closePanel}>
        {activeClaim &&
          (() => {
            const checks =
              activeClaim.health === 'healthy'
                ? ['Obligation verified', 'Issuer verified', 'Settlement source verified', 'Claim chain intact', 'No conflicting assignments']
                : ['Obligation verified', 'Issuer verified', 'Claim chain intact']
            return (
              <div>
                <PanelTitle>Transaction health</PanelTitle>
                <div
                  className={`inline-flex items-center text-[10.5px] tracking-wide uppercase mb-3.5 ${
                    activeClaim.health === 'healthy' ? 'text-verified dark:text-dverified' : 'text-attention dark:text-dattention'
                  }`}
                >
                  <Dot health={activeClaim.health} />
                  {activeClaim.health === 'healthy' ? 'Healthy' : 'Attention'}
                </div>
                {checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 text-[13.5px] border-b border-rule dark:border-drule last:border-b-0">
                    <span className="text-verified dark:text-dverified font-semibold">✓</span>
                    {c}
                  </div>
                ))}
                {activeClaim.health !== 'healthy' && (
                  <div className="text-[13px] text-inkSoft dark:text-dinkSoft mt-2.5">
                    Settlement source is still confirming — nothing you need to act on yet.
                  </div>
                )}
                <div className="mt-3.5">
                  <KV k="Settlement" v={activeClaim.settlement} />
                  <KV k="Last checked" v={new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })} />
                </div>
              </div>
            )
          })()}
      </Panel>

      {/* Transactions panel */}
      <Panel open={activePanel === 'transactions'} onClose={closePanel}>
        <PanelTitle>Transactions</PanelTitle>
        {state.transactions.length === 0 ? (
          <div className="text-[13px] text-inkFaint dark:text-dinkFaint py-2.5">Nothing has settled yet.</div>
        ) : (
          state.transactions.map((t, i) => (
            <div key={i} className="flex items-start justify-between py-4 px-1 border-b border-rule dark:border-drule last:border-b-0">
              <div>
                <div className="font-serif font-semibold text-[21px] tabular-nums">{fmt(t.amount)}</div>
                <div className="text-[12.5px] text-inkSoft dark:text-dinkSoft mt-1">{t.desc}</div>
              </div>
              <div className="text-[10.5px] tracking-wide uppercase text-inkSoft dark:text-dinkSoft flex items-center">
                <Dot health="healthy" />
                Settled
              </div>
            </div>
          ))
        )}
      </Panel>

      <Toast message={toastMsg} show={toastShow} />
    </div>
  )
}
