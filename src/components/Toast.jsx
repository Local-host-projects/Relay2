export default function Toast({ message, show }) {
  return (
    <div
      className={`fixed left-1/2 bottom-[110px] md:bottom-8 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[13px] font-medium z-[100] max-w-[90vw] text-center shadow-2xl transition-all duration-300 pointer-events-none ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transform: `translateX(-50%) translateY(${show ? '0' : '10px'})` }}
    >
      {message}
    </div>
  )
}
