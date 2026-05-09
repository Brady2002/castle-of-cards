'use client'

import type { GameState, CastlePartType } from './types'
import type { GameAction } from './logic'
import { REST_COST, REST_HEAL } from './logic'
import { CASTLE_PART_DEFS, ALL_PARTS, hasPrereq } from './castleParts'
import CastleView from './CastleView'
import CombatHeader from './CombatHeader'
import SandDollarIcon from './SandDollarIcon'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function CastleBuildScreen({ state, dispatch }: Props) {
  const canRest = state.sandDollars >= REST_COST && state.playerHp < state.playerMaxHp

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

      <div className="flex gap-7 w-full max-w-7xl flex-1 min-h-0">
        {/* Castle view */}
        <CastleView castle={state.castle} />

        {/* Shop */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <div className="panel p-7 flex-1">
            <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-amber-700/20">
              <div className="font-bold text-amber-900 text-2xl">Castle Parts</div>
              <div className="text-sm text-amber-700/80 font-bold tracking-wide uppercase">
                {state.castle.length}/{ALL_PARTS.length} built
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_PARTS.map(partType => (
                <PartButton
                  key={partType}
                  partType={partType}
                  state={state}
                  dispatch={dispatch}
                />
              ))}
            </div>
          </div>

          {/* Rest */}
          <div className={`shop-rest ${canRest ? '' : 'shop-rest-disabled'}`}>
            <div className="flex items-center gap-4 flex-1">
              <div className="shop-rest-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M5 22 L5 16 Q5 10 12 10 L20 10 Q27 10 27 16 L27 22" fill="#fde68a" stroke="#a16207" strokeWidth="2" strokeLinejoin="round" />
                  <rect x="3" y="22" width="26" height="6" rx="1.5" fill="#a16207" stroke="#78350f" strokeWidth="1.5" />
                  <path d="M9 16 Q9 13 13 13 L19 13 Q23 13 23 16 L23 19 L9 19 Z" fill="#fff" stroke="#a16207" strokeWidth="1" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-amber-900 text-xl">Rest</span>
                <span className="text-amber-800/75 text-base inline-flex items-center gap-1.5">
                  Heal {REST_HEAL} HP for
                  <SandDollarIcon size={18} />
                  {REST_COST}
                </span>
              </div>
            </div>
            <button
              className="reward-btn reward-btn-neutral inline-flex items-center gap-2"
              style={canRest ? {} : { opacity: 0.5, cursor: 'not-allowed' }}
              disabled={!canRest}
              onClick={() => dispatch({ type: 'rest' })}
            >
              Rest
              <SandDollarIcon size={20} />
              {REST_COST}
            </button>
          </div>

          {/* Continue */}
          <button
            className="reward-btn reward-btn-neutral text-xl py-5"
            onClick={() => dispatch({ type: 'continue_from_build' })}
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  )
}

function PartButton({ partType, state, dispatch }: {
  partType: CastlePartType
  state: GameState
  dispatch: (action: GameAction) => void
}) {
  const def = CASTLE_PART_DEFS[partType]
  const owned = state.castle.includes(partType)
  const meetsPrereq = hasPrereq(state.castle, partType)
  const canAfford = state.sandDollars >= def.cost
  const canBuild = !owned && meetsPrereq && canAfford

  let className: string
  let statusLabel: React.ReactNode

  if (owned) {
    className = 'part-button-built'
    statusLabel = 'Built'
  } else if (!meetsPrereq) {
    className = 'part-button-locked'
    statusLabel = `Needs ${def.prereq}`
  } else {
    className = canAfford ? 'part-button-available' : 'part-button-cant-afford'
    statusLabel = (
      <span className="inline-flex items-center gap-1">
        <SandDollarIcon size={16} />
        {def.cost}
      </span>
    )
  }

  return (
    <button
      className={`part-button ${className}`}
      disabled={!canBuild}
      onClick={() => dispatch({ type: 'build_part', part: partType })}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg capitalize text-gray-900">
          {owned ? '✓ ' : ''}{partType}
        </span>
        <span className={`text-sm font-bold ${!meetsPrereq && !owned ? 'text-gray-400' : 'text-amber-700'}`}>
          {statusLabel}
        </span>
      </div>
      <div className="text-sm text-gray-600 leading-snug mb-2.5">{def.bonus}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-amber-600">+{def.score} score</span>
        {!owned && !meetsPrereq && (
          <svg width="16" height="16" viewBox="0 0 16 16" className="opacity-50">
            <rect x="5" y="8" width="6" height="6" rx="1" fill="#999" />
            <path d="M6 8 L6 6 Q6 3 8 3 Q10 3 10 6 L10 8" fill="none" stroke="#999" strokeWidth="1.5" />
          </svg>
        )}
      </div>
    </button>
  )
}
