'use client'

import type { GameState } from './types'
import type { MapNode, MapNodeType } from './map'
import { TOTAL_FLOORS } from './map'

type Props = {
  state: GameState
  onClose: () => void
}

const NODE_ICONS: Record<MapNodeType, string> = {
  combat: '⚔️',
  elite: '💀',
  rest: '🏕️',
  shop: '🏰',
  event: '❓',
  boss: '👑',
}

const NODE_COLORS: Record<MapNodeType, { bg: string; border: string; text: string }> = {
  combat: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  elite: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  rest: { bg: '#dcfce7', border: '#4ade80', text: '#166534' },
  shop: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  event: { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  boss: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
}

export default function MapPeekModal({ state, onClose }: Props) {
  const colWidth = 120
  const rowHeight = 70
  const nodeRadius = 22
  const maxCols = 4
  const svgWidth = maxCols * colWidth + 40
  const svgHeight = TOTAL_FLOORS * rowHeight + 40

  const rows: MapNode[][] = []
  for (let r = 0; r < TOTAL_FLOORS; r++) {
    rows.push(state.map.nodes.filter(n => n.row === r))
  }

  function getNodePos(node: MapNode, rowCount: number) {
    const totalWidth = rowCount * colWidth
    const startX = (svgWidth - totalWidth) / 2 + colWidth / 2
    const x = startX + node.col * colWidth
    const y = svgHeight - 20 - node.row * rowHeight - nodeRadius
    return { x, y }
  }

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="modal-sketchy p-6 w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-amber-900">Your Path</h2>
            <div className="text-[11px] text-amber-700/80 font-bold tracking-wide uppercase">
              Floor {Math.min(TOTAL_FLOORS, state.encounter)}
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-amber-700/70 text-amber-900 hover:bg-amber-100 cursor-pointer transition-colors"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block' }}>
            {rows.map(rowNodes =>
              rowNodes.map(node =>
                node.edges.map(edgeId => {
                  const target = state.map.nodes.find(n => n.id === edgeId)
                  if (!target) return null
                  const from = getNodePos(node, rowNodes.length)
                  const to = getNodePos(target, rows[target.row].length)
                  const isOnPath = node.visited && target.visited
                  return (
                    <line
                      key={`${node.id}-${edgeId}`}
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isOnPath ? '#f59e0b' : '#cbd5e1'}
                      strokeWidth={isOnPath ? 3 : 1.5}
                    />
                  )
                })
              )
            )}

            {rows.map(rowNodes =>
              rowNodes.map(node => {
                const pos = getNodePos(node, rowNodes.length)
                const isCurrent = node.id === state.currentNodeId
                const colors = NODE_COLORS[node.type]
                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x} cy={pos.y} r={nodeRadius}
                      fill={node.visited ? '#e5e7eb' : colors.bg}
                      stroke={isCurrent ? '#f59e0b' : node.visited ? '#9ca3af' : colors.border}
                      strokeWidth={isCurrent ? 3 : 2}
                      opacity={node.visited && !isCurrent ? 0.6 : 1}
                    />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize="16">
                      {NODE_ICONS[node.type]}
                    </text>
                  </g>
                )
              })
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
