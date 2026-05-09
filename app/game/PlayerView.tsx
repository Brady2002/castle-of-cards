'use client'

import type { GameState, PowerInstance } from './types'
import { getDef } from './cards'
import { CardIcon } from './Card'
import { StatusBadge, StatusIcon, TooltipCard } from './EnemyView'

type Props = {
  state: GameState
  highlighted?: boolean
}

export default function PlayerView({ state, highlighted }: Props) {
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
    <div className={`character-card flex flex-col items-center ${highlighted ? 'drag-target' : ''}`} data-self-target="true">
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
        <img
          src="/player.png"
          alt="Player"
          width={290}
          height={290}
          style={{ width: 290, height: 290, objectFit: 'contain', imageRendering: 'pixelated' }}
          draggable={false}
        />

        {/* Block badge — on the character */}
        {state.playerBlock > 0 && (
          <div className="absolute top-2 -left-3 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-900"
            style={{ background: 'linear-gradient(135deg, #ddd6fe, #c4b5fd)', border: '2px solid #a78bfa', boxShadow: '0 2px 6px rgba(167, 139, 250, 0.4)' }}>
            {state.playerBlock}
          </div>
        )}
      </div>

      {/* Name + HP */}
      <div className="text-[24px] font-bold text-center text-pink-900 mb-2">You</div>
      <div className="w-[290px]">
        <div className="h-[18px] rounded-full overflow-hidden border-2" style={{ background: 'rgba(255, 245, 247, 0.55)', borderColor: 'rgba(244, 114, 182, 0.45)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${hpPct}%`, background: hpColor }}
          />
        </div>
        <div className="text-[18px] text-center text-pink-900/80 font-bold mt-1.5">
          {state.playerHp}/{state.playerMaxHp}
        </div>
      </div>

      {/* Status pills — match the enemy card style for visual consistency */}
      {(state.playerStatus.vulnerable > 0 || state.playerStatus.weak > 0 || state.playerStatus.strength > 0) && (
        <div className="flex gap-1 justify-center mt-3">
          {state.playerStatus.vulnerable > 0 && (
            <StatusBadge kind="vulnerable" value={state.playerStatus.vulnerable} />
          )}
          {state.playerStatus.weak > 0 && (
            <StatusBadge kind="weak" value={state.playerStatus.weak} />
          )}
          {state.playerStatus.strength > 0 && (
            <StatusBadge kind="strength" value={state.playerStatus.strength} />
          )}
        </div>
      )}

      {/* Hover tooltip — mirrors the enemy tooltip stack. Only renders when at
          least one status is active; otherwise the empty stack would still
          claim hover area. */}
      <PlayerTooltip status={state.playerStatus} />
    </div>
  )
}

function PlayerTooltip({ status }: { status: GameState['playerStatus'] }) {
  if (status.vulnerable <= 0 && status.weak <= 0 && status.strength <= 0) return null
  return (
    <div className="character-tooltip">
      {status.vulnerable > 0 && (
        <TooltipCard
          title="Vulnerable"
          accent="vulnerable"
          icon={<StatusIcon kind="vulnerable" />}
          body={<>You take <span className="tooltip-emph">50% more</span> damage from attacks. Decreases by 1 each turn. ({status.vulnerable} left)</>}
        />
      )}
      {status.weak > 0 && (
        <TooltipCard
          title="Weak"
          accent="weak"
          icon={<StatusIcon kind="weak" />}
          body={<>You deal <span className="tooltip-emph">25% less</span> attack damage. Decreases by 1 each turn. ({status.weak} left)</>}
        />
      )}
      {status.strength > 0 && (
        <TooltipCard
          title="Strength"
          accent="strength"
          icon={<StatusIcon kind="strength" />}
          body={<>Your attacks deal <span className="tooltip-emph">+{status.strength}</span> damage.</>}
        />
      )}
    </div>
  )
}

