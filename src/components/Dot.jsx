export default function Dot({ health }) {
  const cls =
    health === 'healthy'
      ? 'bg-emerald-500'
      : health === 'attention'
      ? 'bg-amber-500'
      : 'bg-red-500'
  return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 relative -top-px ${cls}`}></span>
}
