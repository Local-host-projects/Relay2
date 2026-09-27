import { useState } from 'react'
import TextInput from './TextInput'
import Btn from './Btn'

export default function Auth({ initialPhone, onComplete }) {
  const [step, setStep] = useState('phone') // phone | code | pin
  const [phone, setPhone] = useState(initialPhone || '')
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState('user')
  const [err, setErr] = useState('')

  const DEMO_CODE = '8472'
  const ROLES = [
    { k: 'user', l: 'Personal', d: 'Spend & forward promises', icon: 'ph-fill ph-user' },
    { k: 'payer', l: 'Payer', d: 'Employer / bank issuance', icon: 'ph-fill ph-bank' },
    { k: 'lp', l: 'Liquidity', d: 'Buy claims at discount', icon: 'ph-fill ph-banknote' },
    { k: 'admin', l: 'Admin', d: 'Verification board', icon: 'ph-fill ph-shield-check' },
  ]

  function sendCode() {
    if (phone.replace(/\D/g, '').length < 7) {
      setErr('Enter a valid phone number — it doubles as your Relay account.')
      return
    }
    setErr('')
    setStep('code')
  }

  function verifyCode() {
    if (code.trim() !== DEMO_CODE) {
      setErr('Wrong code. Hint: the demo SMS code is 8472.')
      return
    }
    setErr('')
    setStep('pin')
  }

  function savePin() {
    if (pin.replace(/\D/g, '').length < 4) {
      setErr('Choose at least a 4-digit PIN.')
      return
    }
    onComplete({ phone, pin, role })
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-2xl mb-5">
            <span className="font-bold text-3xl italic">R</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Relay</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center">
            {step === 'phone' && 'Future money, spendable now. Sign in with your phone.'}
            {step === 'code' && 'We sent an SMS — your account is created automatically.'}
            {step === 'pin' && 'Set a PIN to secure your account.'}
          </p>
        </div>

        <div className="glass-card rounded-[28px] p-7">
          {step === 'phone' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2 px-1">Phone number = account number</label>
              <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 123 4567" inputMode="tel" />
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mt-4 mb-2 px-1">Sign in as</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button key={r.k} onClick={() => setRole(r.k)} className={`tap-target text-left p-3 rounded-2xl border flex items-center gap-2.5 ${role === r.k ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-200 btn-invert'}`}>
                    <i className={`${r.icon} text-xl shrink-0`}></i>
                    <span>
                      <span className="block text-[13px] font-bold">{r.l}</span>
                      <span className={`block text-[10.5px] ${role === r.k ? 'text-slate-300' : 'text-slate-400'}`}>{r.d}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4"><Btn onClick={sendCode}>Continue</Btn></div>
              <button onClick={() => onComplete({ phone: phone.trim() || '0803 123 4567', pin: '1234', role })} className="w-full mt-3 text-[13px] font-semibold text-slate-500 hover:text-slate-900">
                Skip — use demo account
              </button>
            </div>
          )}

          {step === 'code' && (
            <div>
              <div className="rounded-2xl p-3.5 mb-4 bg-slate-100 border border-slate-200 font-medium text-[13px] text-slate-700">
                <span className="font-bold">SMS:</span> Relay — {`₦5,000`} from A is spendable now. Code: <b className="tracking-widest">{DEMO_CODE}</b>. relay.app/c/8472
              </div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2 px-1">SMS code</label>
              <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="8472" inputMode="numeric" />
              <div className="mt-4"><Btn onClick={verifyCode}>Verify</Btn></div>
              <button onClick={() => setStep('phone')} className="w-full mt-3 text-[13px] font-semibold text-slate-500 hover:text-slate-900">← Change number</button>
            </div>
          )}

          {step === 'pin' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2 px-1">4-digit PIN (2FA on)</label>
              <TextInput type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" inputMode="numeric" />
              <div className="mt-4"><Btn onClick={savePin}>Secure my account</Btn></div>
            </div>
          )}

          {err && <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-medium text-red-700">{err}</div>}
        </div>

        <p className="text-center mt-6 text-[12px] text-slate-400">No app download needed to receive — SMS onboarding, OPay-style.</p>
      </div>
    </div>
  )
}
