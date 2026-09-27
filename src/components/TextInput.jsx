export default function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full text-[15px] font-medium h-[52px] px-4 rounded-2xl border border-slate-200 bg-white/70 text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-slate-900 focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,23,42,0.06)] transition-all"
    />
  )
}
