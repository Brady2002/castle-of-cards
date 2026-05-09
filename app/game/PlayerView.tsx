'use client'

import type { GameState, PowerInstance } from './types'
import { getDef } from './cards'
import { CardIcon } from './Card'

type Props = {
  state: GameState
}

export default function PlayerView({ state }: Props) {
  const hpPct = (state.playerHp / state.playerMaxHp) * 100
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171'

  // Group stacked powers (e.g. two copies of Lifeguard Stance)
  const stacked = new Map<string, { power: PowerInstance; count: number }>()
  for (const p of state.activePowers) {
    const entry = stacked.get(p.defName)
    if (entry) entry.count++
    else stacked.set(p.defName, { power: p, count: 1 })
  }

  return (
    <div className="character-card flex flex-col items-center">
      {/* Active powers — above the character */}
      {stacked.size > 0 && (
        <div className="power-row mb-2">
          {Array.from(stacked.values()).map(({ power, count }) => {
            const def = getDef(power)
            return (
              <div key={power.defName} className="power-badge" aria-label={def.name}>
                <CardIcon cardName={def.name} type="power" size={22} />
                {count > 1 && <span className="power-stack">x{count}</span>}
                <div className="power-tooltip">
                  <div className="power-tooltip-title">{def.name}</div>
                  <div>{def.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Character art */}
      <div className="relative mb-2">
        <PlayerArt />

        {/* Block badge — on the character */}
        {state.playerBlock > 0 && (
          <div className="absolute top-2 -left-3 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-blue-900"
            style={{ background: 'linear-gradient(135deg, #93c5fd, #60a5fa)', border: '2px solid #2563eb', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>
            {state.playerBlock}
          </div>
        )}
      </div>

      {/* Name + HP */}
      <div className="text-[24px] font-bold text-center text-amber-900 mb-2">You</div>
      <div className="w-[290px]">
        <div className="h-[18px] rounded-full overflow-hidden border-2" style={{ background: 'rgba(0,0,0,0.18)', borderColor: 'rgba(0,0,0,0.25)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${hpPct}%`, background: hpColor }}
          />
        </div>
        <div className="text-[18px] text-center text-amber-900/80 font-bold mt-1.5">
          {state.playerHp}/{state.playerMaxHp}
        </div>
      </div>

      {/* Status pills */}
      {(state.playerStatus.vulnerable > 0 || state.playerStatus.weak > 0 || state.playerStatus.strength > 0) && (
        <div className="flex flex-wrap gap-2 justify-center mt-3 max-w-[320px]">
          {state.playerStatus.vulnerable > 0 && (
            <span className="text-[16px] font-bold px-3 py-1 rounded-full" style={{ color: '#92400e', background: '#fef3c7', border: '1px solid #fbbf24' }}>
              Vuln {state.playerStatus.vulnerable}
            </span>
          )}
          {state.playerStatus.weak > 0 && (
            <span className="text-[16px] font-bold px-3 py-1 rounded-full" style={{ color: '#5b21b6', background: '#ede9fe', border: '1px solid #c4b5fd' }}>
              Weak {state.playerStatus.weak}
            </span>
          )}
          {state.playerStatus.strength > 0 && (
            <span className="text-[16px] font-bold px-3 py-1 rounded-full" style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5' }}>
              Str +{state.playerStatus.strength}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Beach-kid character: bucket helmet, striped tee, shovel + starfish shield
function PlayerArt() {
  return (
    <svg width="290" height="385" viewBox="0 0 120 160" className="drop-shadow-md">
      {/* Shovel (back hand, raised) */}
      <rect x="92" y="36" width="3" height="46" rx="1.5" fill="#a16207" stroke="#78350f" strokeWidth="1" />
      <path d="M85 16 L102 16 L101 34 L86 34 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <path d="M88 18 L88 32 M93 18 L93 32 M98 18 L98 32" stroke="#94a3b8" strokeWidth="0.6" opacity="0.7" />

      {/* Starfish shield (front, on left arm) */}
      <g transform="translate(30 78)">
        <path d="M0 -16 L5 -5 L17 -5 L7 3 L11 14 L0 7 L-11 14 L-7 3 L-17 -5 L-5 -5 Z"
          fill="#ff6b6b" stroke="#c0392b" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="0" cy="-4" r="1.2" fill="#7f1d1d" />
        <circle cx="-4" cy="2" r="1" fill="#7f1d1d" />
        <circle cx="4" cy="2" r="1" fill="#7f1d1d" />
      </g>

      {/* Face */}
      <ellipse cx="58" cy="50" rx="14" ry="13" fill="#fde4ca" stroke="#c4956a" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="52" cy="48" r="1.6" fill="#1f2937" />
      <circle cx="64" cy="48" r="1.6" fill="#1f2937" />
      {/* Cheeks */}
      <circle cx="48" cy="54" r="2" fill="#fca5a5" opacity="0.55" />
      <circle cx="68" cy="54" r="2" fill="#fca5a5" opacity="0.55" />
      {/* Smile */}
      <path d="M53 56 Q58 60 63 56" stroke="#5b3a1a" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Body — striped red & white tee */}
      <path d="M40 64 L76 64 L80 102 L36 102 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.5" />
      <line x1="38" y1="74" x2="78" y2="74" stroke="#fff" strokeWidth="2" />
      <line x1="38" y1="84" x2="79" y2="84" stroke="#fff" strokeWidth="2" />
      <line x1="37" y1="94" x2="79" y2="94" stroke="#fff" strokeWidth="2" />

      {/* Arms */}
      {/* Right arm holding shovel up */}
      <path d="M76 66 Q88 50 92 38" fill="none" stroke="#fde4ca" strokeWidth="6" strokeLinecap="round" />
      <path d="M76 66 Q88 50 92 38" fill="none" stroke="#c4956a" strokeWidth="1" strokeLinecap="round" />
      {/* Left arm holding shield */}
      <path d="M40 66 L32 86" fill="none" stroke="#fde4ca" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 66 L32 86" fill="none" stroke="#c4956a" strokeWidth="1" strokeLinecap="round" />

      {/* Shorts — blue */}
      <path d="M36 102 L80 102 L82 126 L60 124 L58 124 L36 126 Z" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1.5" />

      {/* Legs */}
      <rect x="42" y="124" width="10" height="20" rx="2" fill="#fde4ca" stroke="#c4956a" strokeWidth="1" />
      <rect x="64" y="124" width="10" height="20" rx="2" fill="#fde4ca" stroke="#c4956a" strokeWidth="1" />

      {/* Sandals */}
      <ellipse cx="47" cy="148" rx="8" ry="3" fill="#7c2d12" stroke="#3f1505" strokeWidth="1" />
      <ellipse cx="69" cy="148" rx="8" ry="3" fill="#7c2d12" stroke="#3f1505" strokeWidth="1" />
      <line x1="47" y1="146" x2="47" y2="142" stroke="#3f1505" strokeWidth="1" />
      <line x1="69" y1="146" x2="69" y2="142" stroke="#3f1505" strokeWidth="1" />
    </svg>
  )
}
