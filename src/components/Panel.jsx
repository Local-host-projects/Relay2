export default function Panel({ open, onClose, children }) {
  return (
    <div
      className={`fixed left-0 right-0 bottom-0 max-w-[560px] mx-auto bg-paper dark:bg-dpaper border-t-2 border-ink dark:border-dink rounded-t-2xl z-[80] max-h-[88vh] overflow-y-auto px-[22px] pt-[18px] shadow-[0_-12px_40px_rgba(0,0,0,0.25)] panel-sheet ${
        open ? 'open' : ''
      }`}
      style={{ paddingBottom: 'calc(34px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="w-9 h-1 bg-ruleStrong dark:bg-druleStrong rounded mx-auto mb-4.5"></div>
      <button className="absolute top-4 right-[18px] text-[13px] text-inkSoft dark:text-dinkSoft" onClick={onClose}>
        Close
      </button>
      {children}
    </div>
  )
}
