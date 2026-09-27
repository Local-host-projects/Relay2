import { useRef, useState } from 'react'
import { fmt } from '../lib/format'

// Zoomable receipt: scroll / pinch / slider dives from the payment receipt
// into the node view — maps-style ZUI showing the transaction history.
export default function ReceiptZoom({ receipt, nodes, onClose }) {
  const [zoom, setZoom] = useState(0)
  const pinch = useRef(0)

  function clamp(v) {
    return Math.min(1, Math.max(0, v))
  }

  function onWheel(e) {
    setZoom((z) => clamp(z + (e.deltaY > 0 ? 0.12 : -0.12)))
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      pinch.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2 && pinch.current > 0) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setZoom((z) => clamp(z + (pinch.current - d > 0 ? -0.04 : 0.04)))
      pinch.current = d
    }
  }

  const rScale = 1 - zoom * 0.7
  const rOpacity = 1 - zoom * 1.4
  const nOpacity = clamp((zoom - 0.45) / 0.55)
  const nScale = 0.7 + clamp((zoom - 0.45) / 0.55) * 0.3

  return (
    <div
      className="fixed inset-0 z-[95] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] h-[560px] max-h-[86vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt layer */}
        <div
          className="absolute inset-0 bg-white rounded-[28px] p-7 shadow-2xl flex flex-col"
          style={{ transform: `scale(${rScale}) translateY(${zoom * -30}px)`, opacity: Math.max(0, rOpacity), pointerEvents: zoom > 0.6 ? 'none' : 'auto' }}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <span className="font-bold text-xl italic">R</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Receipt</span>
          </div>
          <p className="text-[12px] text-slate-400 mt-6">Amount</p>
          <p className="font-bold text-[38px] tabular-nums tracking-tight">{fmt(receipt.amount)}</p>
          <div className="mt-4 space-y-2.5 text-[13.5px]">
            {[['From', receipt.from], ['To', receipt.to], ['Reference', receipt.ref], ['Settlement', receipt.settlement], ['Date', receipt.date]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-2.5">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{k}</span>
                <span className="font-semibold text-right truncate">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4 text-center">
            <p className="text-[11.5px] text-slate-400">Scroll down or pinch to dive into the chain</p>
            <div className="mx-auto mt-2 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center animate-bounce">
              <i className="ph-bold ph-caret-down text-slate-500"></i>
            </div>
          </div>
        </div>

        {/* Node layer */}
        <div
          className="absolute inset-0 rounded-[28px] bg-slate-900 text-white p-7 shadow-2xl flex flex-col"
          style={{ transform: `scale(${nScale})`, opacity: nOpacity, pointerEvents: zoom < 0.5 ? 'none' : 'auto' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Node view · full history</p>
          <div className="flex-1 flex items-center overflow-x-auto no-scrollbar py-6">
            <div className="flex items-center mx-auto">
              {nodes.map((n, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-[13px] ${i === 0 ? 'bg-white text-slate-900' : 'bg-white/10 border border-white/20'}`}>
                      {n.name.slice(0, 1)}
                    </div>
                    <p className="text-[10px] font-bold mt-1.5">{n.name}</p>
                    <p className="text-[10px] tabular-nums text-emerald-300">{fmt(n.amount)}</p>
                  </div>
                  {i < nodes.length - 1 && <div className="w-8 h-[2px] bg-white/25 mx-1.5 mb-10"></div>}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11.5px] text-slate-400 text-center">Scroll up or spread to return to the receipt</p>
        </div>

        {/* Controls */}
        <div className="absolute -bottom-16 left-0 right-0 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setZoom((z) => clamp(z - 0.2))} className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center tap-target"><i className="ph-bold ph-minus"></i></button>
          <input type="range" min={0} max={1} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="flex-1 accent-white" aria-label="Zoom between receipt and nodes" />
          <button onClick={() => setZoom((z) => clamp(z + 0.2))} className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center tap-target"><i className="ph-bold ph-plus"></i></button>
          <button onClick={onClose} className="h-11 px-5 rounded-full bg-white shadow-xl text-[13px] font-bold tap-target">Done</button>
        </div>
      </div>
    </div>
  )
}
