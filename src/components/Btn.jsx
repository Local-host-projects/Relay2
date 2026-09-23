export default function Btn({ children, onClick, variant = 'primary', className = '' }) {
  const base = 'text-[13.5px] px-4 py-2.5 rounded-[9px] cursor-pointer text-center flex-1 border'
  const styles =
    variant === 'primary'
      ? 'bg-ink text-paper border-ink dark:bg-dink dark:text-dpaper dark:border-dink'
      : 'bg-transparent text-ink border-ruleStrong dark:text-dink dark:border-druleStrong'
  return (
    <button className={`${base} ${styles} active:opacity-80 ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}
