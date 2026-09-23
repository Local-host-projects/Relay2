import { fmt } from '../lib/format'
import Dot from './Dot'

export default function PromiseRow({ p, onClick }) {
  return (
    <div
      className="flex items-start justify-between py-4 px-1 border-b border-rule dark:border-drule last:border-b-0 cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
      onClick={onClick}
    >
      <div className="flex gap-3 items-start">
        <div>
          <div className="font-serif font-semibold text-[21px] tabular-nums">{fmt(p.remaining)}</div>
          <div className="text-[12.5px] text-inkSoft dark:text-dinkSoft mt-1">
            {p.label || 'From ' + p.from}
            {p.remaining !== p.amount ? ' · remaining' : ''}
          </div>
          <div className="text-[12.5px] text-inkFaint dark:text-dinkFaint">{p.settlement}</div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="text-[10.5px] tracking-wide uppercase text-inkSoft dark:text-dinkSoft flex items-center">
          <Dot health={p.health} />
          {p.status}
        </div>
        {p.spendable && (
          <div className="text-[10.5px] text-verified dark:text-dverified border border-verified dark:border-dverified px-1.5 py-0.5 rounded-full">
            Spendable now
          </div>
        )}
      </div>
    </div>
  )
}
