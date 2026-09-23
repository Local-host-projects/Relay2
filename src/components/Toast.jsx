export default function Toast({ message, show }) {
  return (
    <div
      className={`fixed left-1/2 bottom-[100px] bg-ink dark:bg-dink text-paper dark:text-dpaper px-[18px] py-2.5 rounded-full text-[13px] z-[100] whitespace-nowrap transition-opacity duration-300 pointer-events-none ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transform: `translateX(-50%) translateY(${show ? '0' : '10px'})` }}
    >
      {message}
    </div>
  )
}
