export default function Knob({ value, min, max, onChange, label }) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min || 1)))
  const angle = -135 + pct * 270

  function handle(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const move = (ev) => {
      const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - cx
      const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - cy
      let deg = Math.atan2(y, x) * (180 / Math.PI) + 135
      if (deg < 0) deg += 360
      if (deg > 270) deg = deg > 315 ? 0 : 270
      onChange(Math.round(min + (deg / 270) * (max - min)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div
        onPointerDown={handle}
        className="w-[76px] h-[76px] rounded-full border border-slate-200 bg-white relative cursor-grab active:cursor-grabbing shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = Math.max(1, Math.round((max - min) / 40))
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') onChange(Math.min(max, value + step))
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') onChange(Math.max(min, value - step))
        }}
      >
        <div className="absolute inset-[7px] rounded-full border border-slate-200" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-[2px] h-[8px] bg-slate-300"
            style={{ transform: `rotate(${-135 + i * 27}deg) translateY(-30px)`, transformOrigin: '0 0' }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 w-full h-full" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="absolute left-1/2 top-[6px] w-[4px] h-[18px] bg-slate-900 rounded-full -translate-x-1/2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900" />
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="font-bold text-[13px] tabular-nums border border-slate-200 px-2 py-1 rounded-lg bg-white">
        {Number(value).toLocaleString()}
      </div>
    </div>
  )
}
