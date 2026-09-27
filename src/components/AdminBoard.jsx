import Btn from './Btn'
import { fmt } from '../lib/format'
import { deliveryStatus } from '../lib/notify'

export default function AdminBoard({ state, onApprove, onReject, onApproveBusiness, busyId }) {
  const pending = state.requests.filter((r) => r.status === 'pending')
  const done = state.requests.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { l: 'Pending', v: String(pending.length) },
          { l: 'Approved', v: String(state.requests.filter((r) => r.status === 'approved').length) },
          { l: 'Rejected', v: String(state.requests.filter((r) => r.status === 'rejected').length) },
        ].map((s) => (
          <div key={s.l} className="glass-card rounded-3xl p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{s.l}</div>
            <div className="font-bold text-[19px] tabular-nums tracking-tight mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl px-4 py-3 text-[12px] font-semibold bg-slate-900 text-white flex items-center gap-2">
        <i className="ph-fill ph-paper-plane-tilt"></i>
        Delivery rail — SMS {deliveryStatus.sms === 'live' ? 'live via Termii' : 'demo mode (add Termii key)'} · Email {deliveryStatus.email === 'live' ? 'live' : 'demo mode'}
      </div>

      {state.business.name && !state.business.verified && (
        <div className="glass-card rounded-[28px] p-5">
          <h3 className="font-bold text-[15px] tracking-tight">Business verification</h3>
          <p className="text-[13px] text-slate-500 mt-1">{state.business.name} · RC {state.business.rc || '—'} · {state.business.type}</p>
          <div className="mt-3"><Btn onClick={onApproveBusiness}>Verify business</Btn></div>
        </div>
      )}

      <div className="glass-card rounded-[28px] p-5">
        <h3 className="font-bold text-[16px] tracking-tight mb-1">Verification queue</h3>
        <p className="text-[12px] text-slate-500 mb-3">Approve to issue the promise and notify by SMS + email.</p>
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[16px] tabular-nums">{fmt(r.amount)}</p>
                  <p className="text-[12.5px] text-slate-600">To {r.to}{r.phone ? ' · ' + r.phone : ''}{r.email ? ' · ' + r.email : ''}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">{r.issuerName} ({r.issuerType}) · {r.kind}{r.ref ? ' · ref ' + r.ref : ''}{r.escrowRef ? ' · escrow ' + r.escrowRef : ''}</p>
                  <p className="text-[11.5px] text-slate-400">Settles {r.settlement}{r.note ? ' · ' + r.note : ''}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0">pending</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Btn onClick={() => onApprove(r.id)} className={busyId === r.id ? 'opacity-50 pointer-events-none' : ''}>
                  {busyId === r.id ? 'Issuing…' : 'Approve & issue'}
                </Btn>
                <Btn variant="secondary" onClick={() => onReject(r.id)}>Reject</Btn>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-[13px] text-slate-400 text-center py-2">Queue is clear.</p>}
        </div>
      </div>

      {done.length > 0 && (
        <div className="glass-card rounded-[28px] p-5">
          <h3 className="font-bold text-[15px] tracking-tight mb-2">Decided</h3>
          {done.slice(0, 10).map((r) => (
            <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0 text-[13px]">
              <span className="truncate">{fmt(r.amount)} → {r.to}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
