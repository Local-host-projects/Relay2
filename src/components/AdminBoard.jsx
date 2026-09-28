import { useEffect, useState } from 'react'
import Btn from './Btn'
import Field from './Field'
import TextInput from './TextInput'
import { fmt } from '../lib/format'
import { fetchStatus, sendSms, sendEmail } from '../lib/notify'

export default function AdminBoard({ state, onApprove, onReject, onApproveBusiness, busyId, showToast }) {
  const [expandedId, setExpandedId] = useState(null)
  const pending = state.requests.filter((r) => r.status === 'pending')
  const done = state.requests.filter((r) => r.status !== 'pending')
  const [rail, setRail] = useState({ sms: '…', email: '…', balance: null })
  const [testPhone, setTestPhone] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)

  async function refresh() {
    try {
      setRail(await fetchStatus())
    } catch {}
  }
  useEffect(() => { refresh() }, [])

  async function testSend(kind) {
    setTesting(true)
    try {
      const r = kind === 'sms'
        ? await sendSms(testPhone, 'Relay test — your SMS rail is live. Sender ' + (rail.sender || '') + '.')
        : await sendEmail(testEmail, 'Relay test email', 'Your Relay email rail is live.')
      const msg = r.demo ? 'Sent in demo mode (no key / no server)' : r.ok ? 'Delivered — check ' + (kind === 'sms' ? testPhone : testEmail) : 'Failed: ' + (r.error || r.data?.message || 'unknown')
      if (showToast) showToast(msg)
      refresh()
    } finally {
      setTesting(false)
    }
  }

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

      <div className="rounded-[20px] p-4 bg-slate-900 text-white">
        <div className="flex items-center gap-2 text-[12px] font-bold">
          <i className="ph-fill ph-paper-plane-tilt"></i>
          Delivery rails
          <button onClick={refresh} className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap-target" title="Refresh status">
            <i className="ph-bold ph-arrows-clockwise"></i>
          </button>
        </div>
        <p className="text-[12px] text-slate-300 mt-1.5">
          SMS {rail.sms && rail.sms.startsWith('live') ? 'live via Termii' + (rail.sender ? ' (' + rail.sender + ', ' + (rail.channel || 'dnd') + ')' : '') : 'demo — add TERMII_API_KEY'}
          {rail.balance && typeof rail.balance.balance !== 'undefined' ? ' · bal ' + rail.balance.balance : ''} · Email {rail.email && rail.email.startsWith('live') ? 'live via Resend' : 'demo — add RESEND_API_KEY'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          <div className="flex gap-2">
            <input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="2348012345678" inputMode="tel"
              className="flex-1 min-w-0 h-11 px-3 rounded-xl bg-white/10 border border-white/15 text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:border-white/40" />
            <button onClick={() => testSend('sms')} disabled={testing || !testPhone.trim()} className="h-11 px-4 rounded-xl bg-white text-slate-900 text-[12px] font-bold disabled:opacity-40 tap-target">Test SMS</button>
          </div>
          <div className="flex gap-2">
            <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@company.com" inputMode="email"
              className="flex-1 min-w-0 h-11 px-3 rounded-xl bg-white/10 border border-white/15 text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:border-white/40" />
            <button onClick={() => testSend('email')} disabled={testing || !testEmail.trim()} className="h-11 px-4 rounded-xl bg-white text-slate-900 text-[12px] font-bold disabled:opacity-40 tap-target">Test email</button>
          </div>
        </div>
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
          {pending.map((r) => {
            const isOpen = expandedId === r.id
            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : r.id)}
                  className="w-full text-left p-4 flex justify-between items-start gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[16px] tabular-nums">{fmt(r.amount)}</p>
                    <p className="text-[12.5px] text-slate-600">To {r.to}{r.phone ? ' - ' + r.phone : ''}{r.email ? ' - ' + r.email : ''}</p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">{r.issuerName} ({r.issuerType}) - {r.kind}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">pending</span>
                    <i className={`ph-bold ph-caret-${isOpen ? 'up' : 'down'} text-slate-400`}></i>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <div className="space-y-1.5 text-[13px]">
                      <div className="flex justify-between"><span className="text-slate-400">Amount</span><span className="font-bold tabular-nums">{fmt(r.amount)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Recipient</span><span className="font-semibold">{r.to}</span></div>
                      {r.phone && <div className="flex justify-between"><span className="text-slate-400">Phone</span><span>{r.phone}</span></div>}
                      {r.email && <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="truncate ml-2">{r.email}</span></div>}
                      <div className="flex justify-between"><span className="text-slate-400">Issuer</span><span>{r.issuerName} ({r.issuerType})</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Kind</span><span>{r.kind}</span></div>
                      {r.ref && <div className="flex justify-between"><span className="text-slate-400">Reference</span><span>{r.ref}</span></div>}
                      {r.escrowRef && <div className="flex justify-between"><span className="text-slate-400">Escrow ref</span><span>{r.escrowRef}</span></div>}
                      <div className="flex justify-between"><span className="text-slate-400">Settlement</span><span>{r.settlement}</span></div>
                      {r.note && <div className="flex justify-between"><span className="text-slate-400">Note</span><span className="text-right ml-2">{r.note}</span></div>}
                      <div className="flex justify-between"><span className="text-slate-400">Submitted</span><span>{r.created}</span></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Btn onClick={() => onApprove(r.id)} className={busyId === r.id ? 'opacity-50 pointer-events-none' : ''}>
                        {busyId === r.id ? 'Issuing...' : 'Approve & issue'}
                      </Btn>
                      <Btn variant="secondary" onClick={() => onReject(r.id)}>Reject</Btn>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
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
