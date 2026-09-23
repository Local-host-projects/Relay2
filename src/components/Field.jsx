export default function Field({ label, children }) {
  return (
    <div className="my-3.5">
      <label className="block text-[11px] uppercase tracking-wide text-inkFaint dark:text-dinkFaint mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
