import { fmt } from '../lib/format'

export default function ChainSvg({ promise, onNode, onEdge }) {
  const nodes = [{ name: 'A' }, { name: 'B (you)' }]
  const edges = [{ from: 'A', to: 'B (you)', amount: 5000 }]
  ;(promise.chain ? promise.chain.edges : []).forEach((e) => {
    nodes.push({ name: e.to })
    edges.push({ from: e.from, to: e.to, amount: e.amount })
  })

  const colWidth = 500 / Math.max(nodes.length, 2)
  const positions = {}
  nodes.forEach((n, i) => {
    positions[n.name] = { x: 30 + i * colWidth + colWidth / 2, y: 60 + (i % 2 === 0 ? 0 : 70) }
  })

  return (
    <svg viewBox="0 0 520 260" width="100%" className="font-sans">
      {edges.map((e, i) => {
        const a = positions[e.from]
        const b = positions[e.to]
        if (!a || !b) return null
        const midx = (a.x + b.x) / 2
        const midy = (a.y + b.y) / 2
        return (
          <g key={'e' + i}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              className="text-ruleStrong dark:text-druleStrong"
              strokeWidth="1.4"
            />
            <text x={midx} y={midy - 8} textAnchor="middle" fontSize="11" className="fill-inkSoft dark:fill-dinkSoft">
              {fmt(e.amount)}
            </text>
            <rect
              x={Math.min(a.x, b.x)}
              y={Math.min(a.y, b.y) - 14}
              width={Math.abs(b.x - a.x) || 20}
              height={Math.abs(b.y - a.y) + 28}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onEdge(e.from, e.to, e.amount)}
            />
          </g>
        )
      })}
      {nodes.map((n, i) => {
        const pos = positions[n.name]
        const isYou = n.name.includes('you')
        return (
          <g key={'n' + i} className="cursor-pointer" onClick={() => onNode(n.name)}>
            <rect
              x={pos.x - 38}
              y={pos.y - 16}
              width="76"
              height="32"
              rx="16"
              className={
                isYou
                  ? 'fill-accentSoft dark:fill-daccentSoft stroke-ink dark:stroke-dink'
                  : 'fill-paper dark:fill-dpaper stroke-ink dark:stroke-dink'
              }
              strokeWidth={isYou ? 1.6 : 1}
            />
            <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" className="fill-ink dark:fill-dink">
              {n.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
