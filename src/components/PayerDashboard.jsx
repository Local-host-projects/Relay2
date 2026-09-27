import { useState } from 'react'
import IssuePipeline from './IssuePipeline'
import Dot from './Dot'
import { fmt } from '../lib/format'

export default function PayerDashboard({ state, onIssue }) {
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState('')

  const issued = state.payerPromises
  const totalIssued = issued.reduce((s, p) => s + p.amount, 0)
  const byKind = (k) => issued.filter((p) => p.kind === k)

  const visible = issued.filter((p) => {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    return ((p.to || '') + ' ' + (p.phone || '') + ' ' + (p.issuerName || '') + ' ' + (p.kind || '')).toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { l: 'Issued', v: fmt(totalIssued) },
          { l: 'Batches', v: String(issued.length) },
          { l: 'Escrow', v: String(byKind('escrow').length) },
        ].map((s) => (
          <div key={s.l} className="glass-card rounded-3xl p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{s.l}</div>
            <div className="font-bold text-[17px] tabular-nums tracking-tight mt-1 truncate">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Issue */}
      <div className="glass-card rounded-[28px] p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <i className="ph-bold ph-plus text-lg"></i>
          </div>
          <div>
            <h3 className="font-bold text-[16px] tracking-tight">New issuance</h3>
            <p className="text-[12px] text-slate-500">Employer · bank · merchant — bulk ready</p>
          </div>
        </div>
        <IssuePipeline onIssue={onIssue} />
      </div>

      {/* Issued list */}
      <div className="glass-card rounded-[28px] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[16px] tracking-tight">Issued ({issued.length})</h3>
          <button onClick={() => setShowSearch((s) => !s)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
            <i className={`ph-bold ${showSearch ? 'ph-x' : 'ph-magnifying-glass'} text-lg`}></i>
          </button>
        </div>
        {showSearch && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, kind…"
            className="anim-drift-in w-full h-[48px] px-4 mb-3 rounded-2xl border border-slate-200 bg-white/70 text-[14px] font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-slate-900"
          />
        )}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto no-scrollbar">
          {visible.slice(0, 20).map((pp) => (
            <div key={pp.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-slate-100">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] tabular-nums">{fmt(pp.amount)}</div>
                <div className="text-[12px] text-slate-500 truncate">To {pp.to}{pp.phone ? ' · ' + pp.phone : ''}</div>
                <div className="text-[11px] text-slate-400 truncate">{pp.issuerName || ''} · {pp.kind || ''} · {pp.settlement}</div>
              </div>
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
                <Dot health="healthy" />
                {pp.status}
              </span>
            </div>
          ))}
          {visible.length === 0 && <div className="text-[13px] text-slate-400 py-3 text-center">No matches.</div>}
        </div>
      </div>
    </div>
  )
}
