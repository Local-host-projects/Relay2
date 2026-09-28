const NAV = [
  { id: 'about', l: 'About' },
  { id: 'how', l: 'How it works' },
  { id: 'solutions', l: 'Solutions' },
  { id: 'product', l: 'Product' },
]

const PRINCIPLES = [
  { icon: 'ph-fill ph-seal-check', t: 'Verified promises', d: 'Every promise is reviewed and approved before it is issued, so what you receive is backed by a confirmed payer.' },
  { icon: 'ph-fill ph-lightning', t: 'Spend before settlement', d: 'Recipients can spend or forward a verified promise immediately instead of waiting days for money to clear.' },
  { icon: 'ph-fill ph-git-branch', t: 'Traceable to origin', d: 'Each transfer splits the claim and is recorded in a chain, so settlement pays whoever holds each piece.' },
]

const STEPS = [
  { n: '1', t: 'A payer confirms', d: 'An employer, bank or merchant registers a payment that is due to someone.' },
  { n: '2', t: 'Relay verifies', d: 'The verification team reviews the details, then approves and issues the promise by SMS and email.' },
  { n: '3', t: 'You spend it now', d: 'The recipient gets a spendable balance today and can pay or forward any part of it.' },
  { n: '4', t: 'Settlement routes money', d: 'On settlement day, funds go directly to whoever holds each piece, first in first out.' },
]

const SOLUTIONS = [
  {
    icon: 'ph-fill ph-bank',
    who: 'Businesses and payers',
    t: 'Pay people the day you commit',
    pts: ['Register a separate business account', 'Issue salary and payout promises in batches', 'Lock funds in escrow and attach receipts', 'Save a business card for escrow and salary runs'],
  },
  {
    icon: 'ph-fill ph-user',
    who: 'Individuals',
    t: 'Use money that is on its way',
    pts: ['Sign in with just your phone number', 'Accept promises from notifications', 'Send, spend or forward part of a promise', 'Cash out early by choosing the best bid'],
  },
  {
    icon: 'ph-fill ph-banknote',
    who: 'Liquidity providers',
    t: 'Earn a discount for providing cash',
    pts: ['Turn on LP mode from a personal account', 'Set your minimum and maximum discount', 'Bid automatically when claims match your range', 'Collect face value at settlement'],
  },
]

const PRODUCT = [
  { icon: 'ph-fill ph-shield-check', t: 'Verification board', d: 'Admins open each promise request, read every detail, then approve or reject.' },
  { icon: 'ph-fill ph-arrows-split', t: 'Split and forward', d: 'Send part of a promise to anyone. The remainder stays with you.' },
  { icon: 'ph-fill ph-gavel', t: 'Cash-out auction', d: 'Providers bid within their own discount range. The fastest, best offers surface first.' },
  { icon: 'ph-fill ph-chat-circle-text', t: 'SMS and email delivery', d: 'Recipients are notified the moment a promise is issued, no app needed to receive.' },
  { icon: 'ph-fill ph-vault', t: 'Escrow', d: 'Lock funds against a condition and issue promises against the lock.' },
  { icon: 'ph-fill ph-paperclip', t: 'Receipts and documents', d: 'Payers upload proof so reviewers can verify quickly.' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing({ onEnter }) {
  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-40 glass-panel border-b border-white/60">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Relay" className="w-9 h-9 rounded-xl" />
            <span className="font-bold text-lg tracking-tight">Relay</span>
          </button>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-[13px] font-semibold text-slate-500 hover:text-slate-900">
                {n.l}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={onEnter} className="hidden sm:block text-[13px] font-bold text-slate-600 px-3 h-10">Sign in</button>
            <button onClick={onEnter} className="h-10 px-5 rounded-full bg-slate-900 text-white text-[13px] font-bold">Get started</button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-24 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 bg-white/70 border border-slate-200 rounded-full px-3 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Promise-based payments
          </p>
          <h1 className="font-bold text-[40px] md:text-[56px] leading-[1.05] tracking-tight">Future money, spendable now.</h1>
          <p className="text-[16px] md:text-[18px] text-slate-500 mt-5 max-w-lg leading-relaxed">
            Relay turns confirmed payments that have not settled yet into verified promises people can spend, forward or cash out today.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button onClick={onEnter} className="h-12 px-7 rounded-full bg-slate-900 text-white text-[14px] font-bold shadow-xl">Get started</button>
            <button onClick={() => scrollTo('how')} className="h-12 px-7 rounded-full bg-white border border-slate-200 text-[14px] font-bold text-slate-700">See how it works</button>
          </div>
        </div>

        <div className="dark-card rounded-[28px] p-6 text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Example - verified promise</p>
          <p className="font-bold text-[36px] tabular-nums tracking-tight mt-2">N250,000</p>
          <p className="text-[13px] text-slate-300">Salary from Aethercode Ltd</p>
          <div className="mt-5 space-y-2.5 text-[13px]">
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-slate-400">Status</span><span className="font-semibold text-emerald-300">Verified</span></div>
            <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-slate-400">Settles</span><span className="font-semibold">Sept 30</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Spendable now</span><span className="font-semibold">N250,000</span></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Illustration of the product experience.</p>
        </div>
      </section>

      <section id="about" className="max-w-6xl mx-auto px-5 py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">About</p>
        <h2 className="font-bold text-[28px] md:text-[36px] tracking-tight max-w-2xl">Money is committed long before it arrives. Relay closes that gap.</h2>
        <p className="text-[15px] text-slate-500 mt-4 max-w-2xl leading-relaxed">
          Salaries, refunds and transfers are often confirmed days before they clear. In that window people wait, borrow or go without. Relay lets a verified promise stand in for the money, with a clear record of who is owed what.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {PRINCIPLES.map((p) => (
            <div key={p.t} className="glass-card rounded-[28px] p-6">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4"><i className={p.icon + ' text-xl'}></i></div>
              <h3 className="font-bold text-[16px] tracking-tight">{p.t}</h3>
              <p className="text-[13.5px] text-slate-500 mt-1.5 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-5 py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">How it works</p>
        <h2 className="font-bold text-[28px] md:text-[36px] tracking-tight">From confirmed to spendable in four steps</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {STEPS.map((s) => (
            <div key={s.n} className="glass-card rounded-[28px] p-6">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[14px] mb-4">{s.n}</div>
              <h3 className="font-bold text-[15px] tracking-tight">{s.t}</h3>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="solutions" className="max-w-6xl mx-auto px-5 py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">Solutions</p>
        <h2 className="font-bold text-[28px] md:text-[36px] tracking-tight">One network, three kinds of account</h2>
        <p className="text-[15px] text-slate-500 mt-3 max-w-2xl">Each account type has its own sign-in and its own dashboard, so a business, a person and the admin team never share one login.</p>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {SOLUTIONS.map((s) => (
            <div key={s.who} className="glass-card rounded-[28px] p-6 flex flex-col">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4"><i className={s.icon + ' text-xl'}></i></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{s.who}</p>
              <h3 className="font-bold text-[18px] tracking-tight mt-1">{s.t}</h3>
              <ul className="mt-4 space-y-2.5 flex-1">
                {s.pts.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[13.5px] text-slate-600">
                    <i className="ph-bold ph-check text-emerald-600 mt-0.5 shrink-0"></i>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="max-w-6xl mx-auto px-5 py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">Product</p>
        <h2 className="font-bold text-[28px] md:text-[36px] tracking-tight">Everything a promise needs, end to end</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {PRODUCT.map((f) => (
            <div key={f.t} className="glass-card rounded-[28px] p-6">
              <i className={f.icon + ' text-2xl text-slate-900'}></i>
              <h3 className="font-bold text-[15px] tracking-tight mt-3">{f.t}</h3>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="dark-card rounded-[28px] p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="font-bold text-[28px] md:text-[36px] tracking-tight relative">Ready to make future money spendable?</h2>
          <p className="text-[14px] text-slate-300 mt-3 relative">Sign in as a person, register a business, or open the admin board.</p>
          <button onClick={onEnter} className="mt-7 h-12 px-8 rounded-full bg-white text-slate-900 text-[14px] font-bold relative">Get started</button>
        </div>
      </section>

      <footer className="border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row gap-3 justify-between text-[12px] text-slate-400">
          <span>Relay - promise-based payments</span>
          <span>Hackathon prototype. Demo data only; no real money moves.</span>
        </div>
      </footer>
    </div>
  )
}
