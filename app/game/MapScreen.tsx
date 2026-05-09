'use client'

import type { GameState } from './types'
import type { GameAction } from './logic'
import type { MapNode, MapNodeType } from './map'
import { getAvailableNodes, TOTAL_FLOORS } from './map'
import CombatHeader from './CombatHeader'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

const NODE_ICONS: Record<MapNodeType, string> = {
  combat: '\u2694\uFE0F',
  elite: '\uD83D\uDC80',
  rest: '\uD83C\uDFD5\uFE0F',
  shop: '\uD83C\uDFF0',
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
  shop: 'Build',
  event: 'Event',
  boss: 'BOSS',
}

export default function MapScreen({ state, dispatch }: Props) {
  const available = getAvailableNodes(state.map)
  const availableIds = new Set(available.map(n => n.id))

  // Group nodes by row
  const rows: MapNode[][] = []
  for (let r = 0; r < TOTAL_FLOORS; r++) {
    rows.push(state.map.nodes.filter(n => n.row === r))
  }

  // Calculate SVG dimensions for edges
  const colWidth = 120
  const rowHeight = 80
  const nodeRadius = 24
  const maxCols = 4
  const padTop = 32
  const padBottom = 32
  const svgWidth = maxCols * colWidth + 40
  const svgHeight = (TOTAL_FLOORS - 1) * rowHeight + 2 * nodeRadius + padTop + padBottom

  function getNodePos(node: MapNode, rowCount: number) {
    const totalWidth = rowCount * colWidth
    const startX = (svgWidth - totalWidth) / 2 + colWidth / 2
    const x = startX + node.col * colWidth
    const y = svgHeight - padBottom - nodeRadius - node.row * rowHeight
    return { x, y }
  }

  // Build a list of upcoming node types as a small legend
  const legendTypes: MapNodeType[] = ['combat', 'elite', 'rest', 'shop', 'event', 'boss']

  return (
    <div className="min-h-screen game-bg flex flex-col items-center px-6 py-7 gap-6">
      {/* Header */}
      <div className="w-full flex justify-center">
        <CombatHeader
          encounter={state.encounter}
          playerHp={state.playerHp}
          playerMaxHp={state.playerMaxHp}
          sandDollars={state.sandDollars}
          castleScore={state.castleScore}
        />
      </div>

      {/* Two-column body: legend on left, map in middle */}
      <div className="flex gap-5 w-full max-w-7xl flex-1 min-h-0 items-stretch">
        {/* Legend */}
        <aside className="panel w-[340px] hidden md:flex flex-col self-start sticky top-4" style={{ padding: '28px 32px' }}>
          <div
            className="font-bold text-amber-900 text-2xl border-b border-amber-700/20"
            style={{ paddingBottom: 20, marginBottom: 28, paddingLeft: 4, paddingRight: 4 }}
          >
            Legend
          </div>
          <div className="flex flex-col gap-3">
            {legendTypes.map(t => {
              const c = NODE_COLORS[t]
              return (
                <div
                  key={t}
                  className="flex items-center rounded-xl"
                  style={{ background: c.bg, border: `2px solid ${c.border}`, padding: '12px 18px' }}
                >
                  <span className="text-2xl leading-none w-9 flex-shrink-0">{NODE_ICONS[t]}</span>
                  <span className="font-bold text-lg flex-1 text-center pr-3" style={{ color: c.text }}>{NODE_LABELS[t]}</span>
                </div>
              )
            })}
          </div>
          <div
            className="border-t border-amber-700/20 text-base text-amber-800/80 leading-relaxed"
            style={{ marginTop: 28, paddingTop: 20, paddingLeft: 4, paddingRight: 4 }}
          >
            Glowing nodes are reachable. Pick a node to begin.
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 overflow-y-auto">
          <div className="panel p-5">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ display: 'block', maxHeight: 'calc(100vh - 220px)', width: '100%', height: 'auto' }}
            >
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
                      stroke={isOnPath ? '#d97706' : isAvailable ? '#f59e0b' : '#a8946d'}
                      strokeWidth={isOnPath ? 5 : isAvailable ? 4 : 3}
                      strokeLinecap="round"
                      strokeDasharray={isAvailable && !isOnPath ? '8,5' : undefined}
                      opacity={isOnPath ? 1 : isAvailable ? 0.95 : 0.5}
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
