'use client'

import type { MapNodeType } from './map'
import { TOTAL_FLOORS } from './map'

type Props = {
  encounter: number
  playerHp: number
  playerMaxHp: number
  sandDollars: number
  castleScore: number
  nodeType?: MapNodeType
  // Both optional — combat shows them, map/shop typically don't
  onOpenMap?: () => void
  turnNumber?: number
}

export default function CombatHeader({
  encounter,
  playerHp,
  playerMaxHp,
  sandDollars,
  castleScore,
  nodeType,
  onOpenMap,
  turnNumber,
}: Props) {
  const boss = nodeType === 'boss'
  const elite = nodeType === 'elite'

  const floorLabel = boss ? 'BOSS' : elite ? 'ELITE' : `FLOOR ${Math.min(TOTAL_FLOORS, encounter)}`
  const floorTextColor = boss ? 'text-red-200' : elite ? 'text-purple-200' : 'text-amber-100'
  const floorIconColor = boss ? '#fca5a5' : elite ? '#d8b4fe' : '#fcd34d'

  return (
    <div className="w-full max-w-7xl">
      <div className="header-bar px-12 py-8 flex items-center justify-between gap-8">
        {/* Left: floor + turn chips (same chip style as the right side) */}
        <div className="flex gap-4 text-xl font-bold items-center">
          <div className={`stat-chip ${floorTextColor}`}>
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
              {/* Flag icon — denotes the current floor */}
              <line x1="4" y1="2" x2="4" y2="14" stroke={floorIconColor} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4 3 L13 4.5 L10.5 7 L13 9.5 L4 11 Z" fill={floorIconColor} stroke={floorIconColor} strokeWidth="0.8" strokeLinejoin="round" />
            </svg>
            <span>{floorLabel}</span>
          </div>
          {turnNumber !== undefined && (
            <div className="stat-chip text-amber-100 hidden md:inline-flex">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#fcd34d" strokeWidth="1.4" />
                <path d="M8 4.5 V8 L10.5 9.5" stroke="#fcd34d" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>Turn {turnNumber}</span>
            </div>
          )}
        </div>

        {/* Right: stats + map button */}
        <div className="flex gap-4 text-xl font-bold items-center">
          <StatChip
            color="hp"
            icon={
              <svg width="28" height="28" viewBox="0 0 16 16">
                <path d="M8 14 Q1 8 1 5 Q1 2 4 2 Q6 2 8 5 Q10 2 12 2 Q15 2 15 5 Q15 8 8 14Z" fill="#f87171" stroke="#7f1d1d" strokeWidth="0.8" />
              </svg>
            }
            value={`${playerHp}/${playerMaxHp}`}
          />
          <StatChip
            color="gold"
            icon={
              <svg width="28" height="28" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="bold">$</text>
              </svg>
            }
            value={String(sandDollars)}
          />
          <StatChip
            color="castle"
            icon={
              <svg width="28" height="28" viewBox="0 0 16 16">
                <path d="M2 13 L2 7 L4 7 L4 5 L6 5 L6 7 L7 7 L7 4 L9 4 L9 7 L10 7 L10 5 L12 5 L12 7 L14 7 L14 13 Z" fill="#fcd34d" stroke="#78350f" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            }
            value={`${castleScore}/50`}
          />

          {onOpenMap && (
            <>
              <div className="w-px h-12 bg-amber-200/20 mx-2 hidden sm:block" />

              {/* Map button */}
              <button
                className="map-button"
                onClick={onOpenMap}
                aria-label="View map"
                title="View map"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 4 L3 6 L3 20 L9 18 L15 20 L21 18 L21 4 L15 6 Z" />
                  <line x1="9" y1="4" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="20" />
                </svg>
                <span className="hidden sm:inline">Map</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatChip({
  color,
  icon,
  value,
}: {
  color: 'hp' | 'gold' | 'castle'
  icon: React.ReactNode
  value: string
}) {
  const text = color === 'hp' ? 'text-red-100' : color === 'gold' ? 'text-amber-200' : 'text-amber-100'
  return (
    <div className={`stat-chip ${text}`}>
      {icon}
      <span className="font-bold">{value}</span>
    </div>
  )
}
