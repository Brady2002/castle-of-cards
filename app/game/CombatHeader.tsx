'use client'

import { isElite, isBoss } from './enemies'

type Props = {
  encounter: number
  playerHp: number
  playerMaxHp: number
  sandDollars: number
  castleScore: number
}

export default function CombatHeader({ encounter, playerHp, playerMaxHp, sandDollars, castleScore }: Props) {
  const hpPct = (playerHp / playerMaxHp) * 100
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171'
  const elite = isElite(encounter)
  const boss = isBoss(encounter)

  return (
    <div className="w-full max-w-5xl">
      <div className="header-bar px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-amber-100 tracking-wide">Sandcastle</h1>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${
            boss ? 'bg-red-900/60 text-red-300' :
            elite ? 'bg-purple-900/60 text-purple-300' :
            'bg-amber-900/30 text-amber-300'
          }`}>
            {boss ? 'BOSS' : elite ? 'ELITE' : `Fight ${encounter}/12`}
          </span>
        </div>

        <div className="flex gap-4 text-sm font-bold items-center">
          {/* HP */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 14 Q1 8 1 5 Q1 2 4 2 Q6 2 8 5 Q10 2 12 2 Q15 2 15 5 Q15 8 8 14Z" fill={hpColor} stroke="none" />
            </svg>
            <span className="text-white">{playerHp}/{playerMaxHp}</span>
            <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${hpPct}%`, background: hpColor }} />
            </div>
          </div>

          {/* Sand Dollars */}
          <div className="flex items-center gap-1.5 text-amber-200">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="bold">$</text>
            </svg>
            {sandDollars}
          </div>

          {/* Castle Score */}
          <div className="text-amber-100 bg-amber-900/40 px-3 py-1 rounded-lg">
            {castleScore}/50
          </div>
        </div>
      </div>
    </div>
  )
}
