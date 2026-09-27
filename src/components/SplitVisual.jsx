import { fmt } from '../lib/format'

export default function SplitVisual({ total, amt, recipient, stage }) {
  const remain = total - amt

  if (stage === 'before') {
    return (
      <div className="flex gap-1.5 my-5">
        <div
          className="split-block flex-1 border border-slate-200 rounded-2xl py-4 px-2.5 text-center bg-white"
          style={{ flexBasis: '100%' }}
        >
          <div className="font-bold text-xl tabular-nums">{fmt(total)}</div>
          <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">You</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 my-5">
      <div
        className="split-block flex-1 border border-slate-200 rounded-2xl py-4 px-2.5 text-center bg-white"
        style={{ flexBasis: (remain / total) * 100 + '%' }}
      >
        <div className="font-bold text-xl tabular-nums">{fmt(remain)}</div>
        <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">You</div>
      </div>
      <div
        className="split-block flex-1 rounded-2xl py-4 px-2.5 text-center bg-slate-900 text-white"
        style={{ flexBasis: (amt / total) * 100 + '%' }}
      >
        <div className="font-bold text-xl tabular-nums">{fmt(amt)}</div>
        <div className="text-[11px] text-slate-300 uppercase tracking-wider mt-1">{recipient}</div>
      </div>
    </div>
  )
}
