export default function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full text-[15px] px-3 py-2.5 border border-ruleStrong dark:border-druleStrong rounded-lg bg-paper dark:bg-dpaper text-ink dark:text-dink focus:outline-2 focus:outline-accent dark:focus:outline-daccent"
    />
  )
}
