import { useState } from 'react'
import Field from './Field'
import TextInput from './TextInput'
import Btn from './Btn'

const USES = [
  { k: 'escrow', l: 'Fund escrow locks' },
  { k: 'salary', l: 'Automatic salary runs' },
]

export function PaymentsSection({ card, onSave, onRemove }) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [uses, setUses] = useState(['escrow', 'salary'])
  const [err, setErr] = useState('')

  function toggle(k) {
    setUses((u) => (u.includes(k) ? u.filter((x) => x !== k) : [...u, k]))
  }

  function save() {
    const digits = number.replace(/[^0-9]/g, '')
    const parts = expiry.trim().split('/')
    const okExpiry =
      parts.length === 2 &&
      parts[0].length === 2 &&
      parts[1].length === 2 &&
      Number(parts[0]) >= 1 &&
      Number(parts[0]) <= 12 &&
      !isNaN(Number(parts[1]))
    if (!name.trim()) return setErr('Enter the cardholder name.')
    if (digits.length < 12 || digits.length > 19) return setErr('Enter a valid card number.')
    if (!okExpiry) return setErr('Expiry must look like MM/YY.')
    if (uses.length === 0) return setErr('Choose at least one use for this card.')
    setErr('')
    onSave(number, expiry.trim(), name.trim(), uses)
    setNumber('')
    setExpiry('')
    setName('')
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-[28px] p-5">
        <h3 className="font-bold text-[16px] tracking-tight">Business payment card</h3>
        <p className="text-[12px] text-slate-500 mb-3">
          Used to fund escrow locks and automatic salary runs. Only the last 4 digits are kept - never the full number or CVV.
        </p>
        {card ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[14px]">**** **** **** {card.last4}</p>
              <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">On file</span>
              <button onClick={onRemove} className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700">Remove</button>
            </div>
            </div>
            <p className="text-[11.5px] text-slate-400 mt-0.5">{card.name} - Exp {card.expiry}</p>
            <p className="text-[11.5px] text-slate-500 mt-1">
              Used for: {(card.uses || []).map((u) => (u === 'escrow' ? 'escrow' : 'auto salary')).join(', ') || 'nothing yet'}
            </p>
          </div>
        ) : (
          <p className="text-[12.5px] text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-3">
            No card on file - escrow locks and automatic salary runs cannot be funded yet.
          </p>
        )}

        <Field label="Cardholder name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Aethercode Ltd" />
        </Field>
        <Field label="Card number">
          <TextInput value={number} onChange={(e) => setNumber(e.target.value)} placeholder="4111 1111 1111 1111" inputMode="numeric" />
        </Field>
        <Field label="Expiry (MM/YY)">
          <TextInput value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="09/28" />
        </Field>

        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-3 mb-2 px-1">Use this card for</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {USES.map((u) => (
            <button
              key={u.k}
              onClick={() => toggle(u.k)}
              className={
                'tap-target py-2.5 rounded-2xl border text-[12px] font-bold ' +
                (uses.includes(u.k) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500')
              }
            >
              {u.l}
            </button>
          ))}
        </div>

        {err && <div className="mb-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-medium text-red-700">{err}</div>}
        <Btn onClick={save}>{card ? 'Replace card' : 'Save card'}</Btn>
      </div>
    </div>
  )
}

const CATS = ['receipt', 'invoice', 'contract', 'other']
const MAX_BYTES = 2 * 1024 * 1024

export function DocumentsSection({ docs, onAdd, onRemove }) {
  const [category, setCategory] = useState('receipt')
  const [ref, setRef] = useState('')
  const [err, setErr] = useState('')
  const [reading, setReading] = useState(false)

  function pick(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_BYTES) {
      setErr('File is too large. Max 2 MB per upload.')
      return
    }
    setErr('')
    setReading(true)
    const reader = new FileReader()
    reader.onload = () => {
      onAdd({
        id: 'doc' + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        ref: ref.trim(),
        dataUrl: reader.result,
        added: new Date().toLocaleString('en-NG'),
      })
      setRef('')
      setReading(false)
    }
    reader.onerror = () => {
      setErr('Could not read that file.')
      setReading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-[28px] p-5">
        <h3 className="font-bold text-[16px] tracking-tight">Receipts and documents</h3>
        <p className="text-[12px] text-slate-500 mb-3">
          Attach proof for the verification team - transfer receipts, invoices, contracts. Images or PDF, up to 2 MB each.
        </p>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                'tap-target py-2 rounded-2xl border text-[11px] font-bold uppercase tracking-wide ' +
                (category === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500')
              }
            >
              {c}
            </button>
          ))}
        </div>

        <Field label="Reference (optional)">
          <TextInput value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. INTL-2026-991" />
        </Field>

        <label className="tap-target mt-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-900 text-white text-[13px] font-bold cursor-pointer">
          <i className="ph-bold ph-paperclip text-lg"></i>
          {reading ? 'Reading file...' : 'Choose file to upload'}
          <input type="file" accept="image/*,application/pdf" onChange={pick} className="hidden" />
        </label>

        {err && <div className="mt-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-medium text-red-700">{err}</div>}
      </div>

      <div className="glass-card rounded-[28px] p-5">
        <h3 className="font-bold text-[15px] tracking-tight mb-2">Uploaded ({docs.length})</h3>
        {docs.length === 0 && <p className="text-[13px] text-slate-400 text-center py-2">Nothing uploaded yet.</p>}
        <div className="space-y-2.5">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-slate-100">
              {d.type && d.type.indexOf('image/') === 0 ? (
                <img src={d.dataUrl} alt={d.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <i className="ph-fill ph-file-pdf text-2xl"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13.5px] truncate">{d.name}</p>
                <p className="text-[11.5px] text-slate-400 truncate">
                  {d.category}
                  {d.ref ? ' - ref ' + d.ref : ''} - {Math.max(1, Math.round(d.size / 1024))} KB
                </p>
                <p className="text-[11px] text-slate-400">{d.added}</p>
              </div>
              <a href={d.dataUrl} download={d.name} className="tap-target w-9 h-9 rounded-full text-slate-400 hover:text-slate-900 flex items-center justify-center shrink-0" title="Download">
                <i className="ph-bold ph-download-simple"></i>
              </a>
              <button onClick={() => onRemove(d.id)} className="tap-target w-9 h-9 rounded-full text-slate-300 hover:text-red-600 shrink-0" title="Remove">
                <i className="ph-bold ph-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
