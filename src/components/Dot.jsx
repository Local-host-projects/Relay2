export default function Dot({ health }) {
  const cls =
    health === 'healthy'
      ? 'bg-verified dark:bg-dverified'
      : health === 'attention'
      ? 'bg-attention dark:bg-dattention'
      : 'bg-problem dark:bg-dproblem'
  return <span className={`inline-block w-[7px] h-[7px] rounded-full mr-1.5 relative -top-px ${cls}`}></span>
}
