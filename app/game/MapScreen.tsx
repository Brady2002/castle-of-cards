'use client'

import type { GameState } from './types'
import type { GameAction } from './logic'
import type { MapNode, MapNodeType } from './map'
import { getAvailableNodes } from './map'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

const NODE_ICONS: Record<MapNodeType, string> = {
  combat: '\u2694\uFE0F',
  elite: '\uD83D\uDC80',
  rest: '\uD83C\uDFD5\uFE0F',
  shop: '\uD83C\uDFE0',
  event: '\u2753',
  boss: '\uD83D\uDC51',
}

const NODE_COLORS: Record<MapNodeType, { bg: string; border: string; text: string }> = {
  combat: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  elite: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  rest: { bg: '#dcfce7', border: '#4ade80', text: '#166534' },
  shop: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  event: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  boss: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
}

const NODE_LABELS: Record<MapNodeType, string> = {
  combat: 'Combat',
  elite: 'Elite',
  rest: 'Rest',
  shop: 'Shop',
  event: 'Event',
  boss: 'BOSS',
}

export default function MapScreen({ state, dispatch }: Props) {
  const available = getAvailableNodes(state.map)
  const availableIds = new Set(available.map(n => n.id))

  // Group nodes by row
  const rows: MapNode[][] = []
  for (let r = 0; r < 10; r++) {
    rows.push(state.map.nodes.filter(n => n.row === r))
  }

  const hpPct = (state.playerHp / state.playerMaxHp) * 100
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171'

  // Calculate SVG dimensions for edges
  const colWidth = 120
  const rowHeight = 80
  const nodeRadius = 24
  const maxCols = 4
  const svgWidth = maxCols * colWidth + 40
  const svgHeight = 10 * rowHeight + 40

  function getNodePos(node: MapNode, rowCount: number) {
    const totalWidth = rowCount * colWidth
    const startX = (svgWidth - totalWidth) / 2 + colWidth / 2
    const x = startX + node.col * colWidth
    const y = svgHeight - 20 - node.row * rowHeight - nodeRadius
    return { x, y }
  }

  // Build a list of upcoming node types as a small legend
  const legendTypes: MapNodeType[] = ['combat', 'elite', 'rest', 'shop', 'event', 'boss']

  return (
    <div className="min-h-screen game-bg flex flex-col items-center px-4 py-5 gap-4">
      {/* Header */}
      <div className="w-full max-w-5xl">
        <div className="header-bar px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-amber-100 leading-tight">Choose Your Path</h2>
            <div className="text-[11px] text-amber-200/70 tracking-wider uppercase">
              Floor {Math.min(10, state.encounter)} · {state.map.nodes.filter(n => n.visited).length}/{state.map.nodes.length} explored
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 text-white text-sm">
              <svg width="14" height="14" viewBox="0 0 16 16">
                <path d="M8 14 Q1 8 1 5 Q1 2 4 2 Q6 2 8 5 Q10 2 12 2 Q15 2 15 5 Q15 8 8 14Z" fill={hpColor} />
              </svg>
              {state.playerHp}/{state.playerMaxHp}
            </div>
            <div className="flex items-center gap-1.5 text-amber-200 text-sm font-bold">
              <svg width="14" height="14" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="bold">$</text>
              </svg>
              {state.sandDollars}
            </div>
            <div className="text-amber-100 bg-amber-900/40 px-3 py-1 rounded-lg text-sm font-bold">
              {state.castleScore}/50
            </div>
          </div>
        </div>
      </div>

      {/* Two-column body: legend on left, map in middle */}
      <div className="flex gap-4 w-full max-w-5xl flex-1 min-h-0 items-stretch">
        {/* Legend */}
        <aside className="panel p-4 w-56 hidden md:flex flex-col gap-2 self-start sticky top-4">
          <div className="font-bold text-amber-900 text-base mb-1">Legend</div>
          {legendTypes.map(t => {
            const c = NODE_COLORS[t]
            return (
              <div key={t} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
                <span className="text-base leading-none">{NODE_ICONS[t]}</span>
                <span className="font-bold text-sm" style={{ color: c.text }}>{NODE_LABELS[t]}</span>
              </div>
            )
          })}
          <div className="mt-2 pt-2 border-t border-amber-200/50 text-[11px] text-amber-800/80 leading-relaxed">
            Glowing nodes are reachable. Pick a node to begin.
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 overflow-y-auto">
          <div className="panel p-5" style={{ minHeight: svgHeight + 40 }}>
            <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block', maxHeight: 'calc(100vh - 160px)' }}>
            {/* Edges */}
            {rows.map((rowNodes) =>
              rowNodes.map(node =>
                node.edges.map(edgeId => {
                  const target = state.map.nodes.find(n => n.id === edgeId)
                  if (!target) return null
                  const from = getNodePos(node, rowNodes.length)
                  const targetRow = rows[target.row]
                  const to = getNodePos(target, targetRow.length)

                  // Determine edge color
                  const isOnPath = node.visited && target.visited
                  const isAvailable = node.visited && availableIds.has(target.id)
                    || (node.id === state.currentNodeId && availableIds.has(target.id))
                    || (!state.currentNodeId && node.row === 0)

                  return (
                    <line
                      key={`${node.id}-${edgeId}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isOnPath ? '#f59e0b' : isAvailable ? '#94a3b8' : '#e2e8f0'}
                      strokeWidth={isOnPath ? 3 : 2}
                      strokeDasharray={isAvailable && !isOnPath ? '6,4' : undefined}
                    />
                  )
                })
              )
            )}

            {/* Nodes */}
            {rows.map((rowNodes) =>
              rowNodes.map(node => {
                const pos = getNodePos(node, rowNodes.length)
                const isAvailable = availableIds.has(node.id)
                const isCurrent = node.id === state.currentNodeId
                const colors = NODE_COLORS[node.type]

                return (
                  <g
                    key={node.id}
                    onClick={isAvailable ? () => dispatch({ type: 'select_map_node', nodeId: node.id }) : undefined}
                    style={{ cursor: isAvailable ? 'pointer' : 'default' }}
                  >
                    {/* Glow for available nodes */}
                    {isAvailable && (
                      <circle cx={pos.x} cy={pos.y} r={nodeRadius + 4} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius}
                      fill={node.visited ? '#e5e7eb' : colors.bg}
                      stroke={isCurrent ? '#f59e0b' : node.visited ? '#9ca3af' : colors.border}
                      strokeWidth={isCurrent ? 3 : 2}
                      opacity={node.visited && !isCurrent ? 0.5 : 1}
                    />

                    {/* Icon */}
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="18"
                      opacity={node.visited && !isCurrent ? 0.5 : 1}
                    >
                      {NODE_ICONS[node.type]}
                    </text>

                    {/* Label below */}
                    <text
                      x={pos.x}
                      y={pos.y + nodeRadius + 14}
                      textAnchor="middle"
                      fontSize="10"
                      fill={node.visited ? '#9ca3af' : colors.text}
                      fontWeight="bold"
                    >
                      {NODE_LABELS[node.type]}
                    </text>
                  </g>
                )
              })
            )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
