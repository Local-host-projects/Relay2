export default function KV({ k, v }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-rule dark:border-drule text-[13.5px] last:border-b-0">
      <div className="text-inkFaint dark:text-dinkFaint uppercase tracking-wide text-[11px]">{k}</div>
      <div className="font-medium text-right">{v}</div>
    </div>
  )
}
