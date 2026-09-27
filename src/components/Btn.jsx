export default function Btn({ children, onClick, variant = 'primary', className = '' }) {
  const base = 'text-[14px] font-semibold px-5 h-[52px] rounded-2xl cursor-pointer text-center flex-1 flex items-center justify-center gap-2'
  const styles =
    variant === 'primary'
      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 btn-invert'
      : 'bg-white text-slate-900 border border-slate-200 shadow-sm btn-invert'
  return (
    <button className={`${base} ${styles} active:opacity-90 disabled:opacity-40 ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}
