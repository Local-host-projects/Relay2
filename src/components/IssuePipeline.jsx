import { useMemo, useState } from 'react'
import Field from './Field'
import TextInput from './TextInput'
import Btn from './Btn'
import { fmt } from '../lib/format'

const ISSUERS = [
  { k: 'employer', l: 'Employer' },
  { k: 'bank', l: 'Bank' },
  { k: 'merchant', l: 'Merchant' },
  { k: 'remittance', l: 'Remittance' },
  { k: 'other', l: 'Other' },
]
const FUNDING = [
  { k: 'trusted', l: 'Trusted float', d: 'Payer guarantees from cash float. No escrow.' },
  { k: 'escrow', l: 'Escrow locked', d: 'Funds locked conditional via partner.' },
  { k: 'in-transit', l: 'In-transit', d: 'Confirmed transfer, settlement dated out.' },
]

function parseBulk(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const parts = line.split(/[,;\t|]/).map((s) => s.trim()).filter(Boolean)
      if (parts.length === 1) {
        const amt = parseFloat(parts[0].replace(/[^0-9.]/g, ''))
        return { to: 'Recipient ' + (i + 1), phone: '', amount: isNaN(amt) ? '' : amt }
      }
      const amount = parseFloat(parts[parts.length - 1].replace(/[^0-9.]/g, ''))
      const to = parts.slice(0, -1).join(' ') || 'Recipient ' + (i + 1)
      const m = to.match(/(0\d{9,11}|\+?\d{7,15})/)
      return { to, phone: m ? m[0] : '', amount: isNaN(amount) ? '' : amount }
    })
}

export default function IssuePipeline({ onIssue }) {
  const [step, setStep] = useState(1)
  const [issuerType, setIssuerType] = useState('employer')
  const [issuerName, setIssuerName] = useState('')
  const [funding, setFunding] = useState('trusted')
  const [escrowRef, setEscrowRef] = useState('')
  const [settlement, setSettlement] = useState('Sept 30')
  const [note, setNote] = useState('')
  const [mode, setMode] = useState('bulk')
  const [rows, setRows] = useState([{ to: '', phone: '', amount: '' }])
  const [bulkText, setBulkText] = useState('B — 0803 111 2222, 25000\nC — 0803 333 4444, 80000')
  const [err, setErr] = useState('')

  const items = useMemo(() => {
    if (mode === 'bulk') return parseBulk(bulkText)
    return rows
  }, [mode, rows, bulkText])

  const validItems = items.filter((r) => r.to && parseFloat(r.amount) > 0)
  const total = validItems.reduce((s, r) => s + parseFloat(r.amount), 0)

  function next() {
    setErr('')
    if (step === 1 && !issuerName.trim()) {
      setErr('Add issuer name — e.g. Aethercode Ltd, GTB, Shoprite.')
      return
    }
    if (step === 2 && validItems.length === 0) {
      setErr('Add at least one recipient with amount.')
      return
    }
    if (step === 3 && !settlement.trim()) {
      setErr('Add settlement date.')
      return
    }
    if (step === 3 && funding === 'escrow' && !escrowRef.trim()) {
      setErr('Escrow needs a reference / partner lock ID.')
      return
    }
    setStep((s) => Math.min(4, s + 1))
  }

  function issue() {
    onIssue({
      issuerType,
      issuerName: issuerName.trim(),
      kind: funding,
      funding,
      escrowRef: escrowRef.trim(),
      settlement: settlement.trim(),
      note: note.trim(),
      items: validItems.map((r) => ({ to: r.to.trim(), phone: (r.phone || '').trim(), amount: parseFloat(r.amount) })),
    })
    setStep(1)
  }

  return (
    <div>
      <div className="grid grid-cols-4 rounded-2xl bg-slate-100 border border-slate-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] mb-4 overflow-hidden">
        {['Issuer', 'Recipients', 'Terms', 'Review'].map((l, i) => (
          <div key={l} className={`py-2.5 text-center ${step === i + 1 ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{i + 1}. {l}</div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">1 — Who is issuing?</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
            {ISSUERS.map((o) => (
              <button key={o.k} onClick={() => setIssuerType(o.k)} className={`tap-target py-2.5 px-2 rounded-2xl border text-[12px] font-bold uppercase tracking-wide ${issuerType === o.k ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 text-slate-600 btn-invert'}`}>{o.l}</button>
            ))}
          </div>
          <Field label="Issuer name (employer / bank / merchant)">
            <TextInput value={issuerName} onChange={(e) => setIssuerName(e.target.value)} placeholder="e.g. Aethercode Ltd" />
          </Field>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-4 mb-2">Funding — how is it secured?</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FUNDING.map((f) => (
              <button key={f.k} onClick={() => setFunding(f.k)} className={`tap-target text-left p-3.5 rounded-2xl border ${funding === f.k ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 btn-invert'}`}>
                <div className="text-[12px] font-bold uppercase tracking-wide">{f.l}</div>
                <div className="text-[11px] mt-1 opacity-70">{f.d}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">2 — Recipients</div>
            <div className="ml-auto grid grid-cols-2 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase overflow-hidden">
              <button onClick={() => setMode('single')} className={`tap-target px-4 py-2 ${mode === 'single' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Single</button>
              <button onClick={() => setMode('bulk')} className={`tap-target px-4 py-2 ${mode === 'bulk' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Bulk</button>
            </div>
          </div>
          {mode === 'single' ? (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-1 sm:contents gap-2 rounded-2xl sm:rounded-none border border-slate-200 sm:border-0 p-2 sm:p-0">
                  <TextInput value={r.to} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} placeholder="Name / B" />
                  <TextInput value={r.phone} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} placeholder="Phone — auto-creates account" />
                  <TextInput type="number" value={r.amount} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} placeholder="Amount" />
                  <button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="tap-target rounded-2xl border border-slate-200 px-3 btn-invert" disabled={rows.length === 1}>×</button>
                </div>
              ))}
              <button onClick={() => setRows((rs) => [...rs, { to: '', phone: '', amount: '' }])} className="tap-target mt-2 rounded-2xl border-2 border-dashed border-slate-300 py-2.5 text-[12px] font-bold uppercase tracking-wide text-slate-500 sm:col-span-full">+ Add recipient</button>
            </div>
          ) : (
            <div>
              <Field label="Paste roster — one per line: name/phone, amount">
                <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={5} className="w-full text-[13px] px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 focus:outline-none focus:border-slate-900" placeholder={'B — 0803 111 2222, 25000'} />
              </Field>
              <div className="text-[12px] font-semibold text-slate-600">Parsed {validItems.length} · Total {fmt(total)}</div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Field label="Settlement date / rule">
            <TextInput value={settlement} onChange={(e) => setSettlement(e.target.value)} placeholder="e.g. Sept 30 — mid-month spendable" />
          </Field>
          {funding === 'escrow' && (
            <Field label="Escrow reference / partner lock ID">
              <TextInput value={escrowRef} onChange={(e) => setEscrowRef(e.target.value)} placeholder="e.g. ESC-88231" />
            </Field>
          )}
          <div className="md:col-span-2">
            <Field label="SMS note (optional)">
              <TextInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sept salary — spendable now" />
            </Field>
            <div className="rounded-2xl p-3.5 mt-1 text-[12.5px] bg-slate-100 border border-slate-200 break-words text-slate-600">SMS preview: Relay — {validItems[0] ? fmt(validItems[0].amount) : '₦0'} from {issuerName || issuerType} is spendable now. relay.app/c/8472 — set PIN to claim.{note ? ' ' + note : ''}</div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">4 — Review & issue</div>
          <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 text-[13px] overflow-hidden">
            <div className="p-3.5 font-semibold break-words bg-slate-50">{issuerType} · {issuerName} · {funding}{funding === 'escrow' ? ' · ' + escrowRef : ''} · settles {settlement}</div>
            {validItems.slice(0, 8).map((r, i) => (
              <div key={i} className="p-3.5 flex justify-between gap-3 bg-white"><span className="break-all text-slate-600">{r.to}{r.phone ? ' · ' + r.phone : ''}</span><b className="tabular-nums shrink-0">{fmt(r.amount)}</b></div>
            ))}
            {validItems.length > 8 && <div className="p-3.5 bg-white text-slate-500">+ {validItems.length - 8} more</div>}
            <div className="p-3.5 flex justify-between bg-white"><span className="text-slate-500">{validItems.length} recipients</span><b className="tabular-nums">{fmt(total)}</b></div>
          </div>
          <div className="text-[12px] mt-2">Each recipient gets SMS + auto-created account by phone. Accept/decline on first open. FIFO on settle.</div>
        </div>
      )}

      {err && <div className="mt-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-medium text-red-700">{err}</div>}

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        {step > 1 && <Btn variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Btn>}
        {step < 4 ? <Btn onClick={next}>Continue →</Btn> : <Btn onClick={issue}>Issue {validItems.length} promise{validItems.length === 1 ? '' : 's'} — {fmt(total)}</Btn>}
      </div>
    </div>
  )
}
