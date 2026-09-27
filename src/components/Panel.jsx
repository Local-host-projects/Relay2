export default function Panel({ open, onClose, children }) {
  return (
    <div
      className={`fixed z-[80] overflow-y-auto no-scrollbar px-5 sm:px-6 pt-3 pb-8 glass-panel panel-sheet ${
        open ? 'open' : ''
      } left-0 right-0 bottom-0 max-w-[560px] mx-auto rounded-t-[28px] border border-white/60 shadow-[0_-16px_60px_rgba(15,23,42,0.18)] max-h-[88vh] md:left-auto md:right-6 md:bottom-6 md:top-6 md:max-w-[460px] md:w-[min(460px,92vw)] md:max-h-none md:rounded-[28px] md:border md:shadow-2xl`}
      style={{ paddingBottom: 'calc(34px + env(safe-area-inset-bottom, 0px))' }}
      role="dialog"
      aria-hidden={!open}
    >
      <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 md:hidden"></div>
      <button className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 btn-invert shadow-sm" onClick={onClose} aria-label="Close">
        <i className="ph-bold ph-x"></i>
      </button>
      {children}
    </div>
  )
}
