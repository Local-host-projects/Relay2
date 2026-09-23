import { fmt } from '../lib/format'

export default function SplitVisual({ total, amt, recipient, stage }) {
  const remain = total - amt

  if (stage === 'before') {
    return (
      <div className="flex gap-1.5 my-5">
        <div
          className="split-block flex-1 border border-ink dark:border-dink rounded-lg py-4 px-2.5 text-center"
          style={{ flexBasis: '100%' }}
        >
          <div className="font-serif font-semibold text-xl">{fmt(total)}</div>
          <div className="text-[11px] text-inkSoft dark:text-dinkSoft uppercase tracking-wide mt-1">You</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 my-5">
      <div
        className="split-block flex-1 border border-ink dark:border-dink rounded-lg py-4 px-2.5 text-center"
        style={{ flexBasis: (remain / total) * 100 + '%' }}
      >
        <div className="font-serif font-semibold text-xl">{fmt(remain)}</div>
        <div className="text-[11px] text-inkSoft dark:text-dinkSoft uppercase tracking-wide mt-1">You</div>
      </div>
      <div
        className="split-block flex-1 border border-accent dark:border-daccent rounded-lg py-4 px-2.5 text-center"
        style={{ flexBasis: (amt / total) * 100 + '%' }}
      >
        <div className="font-serif font-semibold text-xl">{fmt(amt)}</div>
        <div className="text-[11px] text-inkSoft dark:text-dinkSoft uppercase tracking-wide mt-1">{recipient}</div>
      </div>
    </div>
  )
}
