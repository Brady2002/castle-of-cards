'use client'

import type { MapNodeType } from './map'

type Props = {
  encounter: number
  playerHp: number
  playerMaxHp: number
  sandDollars: number
  castleScore: number
  nodeType?: MapNodeType
  onOpenMap: () => void
  turnNumber: number
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

  return (
    <div className="w-full max-w-7xl">
      <div className="header-bar px-7 py-4 flex items-center justify-between gap-6">
        {/* Left: title + floor badge */}
        <div className="flex items-center gap-4 shrink-0">
          <span className={`text-sm font-bold px-3 py-1 rounded ${
            boss ? 'bg-red-900/60 text-red-300' :
            elite ? 'bg-purple-900/60 text-purple-300' :
            'bg-amber-900/30 text-amber-300'
          }`}>
            {boss ? 'BOSS' : elite ? 'ELITE' : `Floor ${Math.min(10, encounter)}`}
          </span>
          <span className="text-amber-200/60 text-xs font-bold tracking-wide uppercase hidden md:inline">
            Turn {turnNumber}
          </span>
        </div>

        {/* Right: stats + map button */}
        <div className="flex gap-4 sm:gap-5 text-sm font-bold items-center">
          {/* HP */}
          <div className="flex items-center gap-2 text-white">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 14 Q1 8 1 5 Q1 2 4 2 Q6 2 8 5 Q10 2 12 2 Q15 2 15 5 Q15 8 8 14Z" fill="#f87171" stroke="#7f1d1d" strokeWidth="0.8" />
            </svg>
            <span>{playerHp}/{playerMaxHp}</span>
          </div>

          {/* Sand Dollars */}
          <div className="flex items-center gap-2 text-amber-200">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="bold">$</text>
            </svg>
            {sandDollars}
          </div>

          {/* Castle Score */}
          <div className="text-amber-100 bg-amber-900/40 px-3.5 py-1.5 rounded-lg">
            {castleScore}/50
          </div>

          {/* Map button */}
          <button
            className="map-button"
            onClick={onOpenMap}
            aria-label="View map"
            title="View map"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4 L3 6 L3 20 L9 18 L15 20 L21 18 L21 4 L15 6 Z" />
              <line x1="9" y1="4" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="20" />
            </svg>
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>
    </div>
  )
}
