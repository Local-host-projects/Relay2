export default function Field({ label, children }) {
  return (
    <div className="my-3.5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2 px-1">
        {label}
      </label>
      {children}
    </div>
  )
}
