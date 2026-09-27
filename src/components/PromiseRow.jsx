import { fmt } from '../lib/format'
import Dot from './Dot'

export default function PromiseRow({ p, onClick }) {
  return (
    <div
      className="glass-card rounded-3xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-all hover:-translate-y-0.5 active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
        <i className={`ph-fill ${p.kind === 'trusted' ? 'ph-bank' : p.kind === 'escrow' ? 'ph-vault' : 'ph-airplane-tilt'} text-xl`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[17px] tabular-nums tracking-tight">{fmt(p.remaining)}</div>
        <div className="text-[12.5px] text-slate-500 mt-0.5 truncate">
          {p.label || 'From ' + p.from}
          {p.remaining !== p.amount ? ' · remaining' : ''}
        </div>
        <div className="text-[11.5px] text-slate-400 truncate">{p.settlement}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Dot health={p.health} />
          {p.status}
        </span>
        {p.spendable && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
            Spendable
          </span>
        )}
      </div>
    </div>
  )
}
