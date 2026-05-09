'use client'

import type { GameState, CastlePartType } from './types'
import type { GameAction } from './logic'
import { REST_COST, REST_HEAL } from './logic'
import { CASTLE_PART_DEFS, ALL_PARTS, hasPrereq } from './castleParts'
import CastleView from './CastleView'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function CastleBuildScreen({ state, dispatch }: Props) {
  const hpPct = (state.playerHp / state.playerMaxHp) * 100
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171'

  return (
    <div className="min-h-screen game-bg flex flex-col items-center px-4 py-6 gap-4">
      {/* Header */}
      <div className="w-full max-w-4xl">
        <div className="header-bar px-6 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-100">Build Your Castle</h2>
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
              Score: {state.castleScore}/50
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 w-full max-w-4xl flex-1 min-h-0">
        {/* Castle view */}
        <CastleView castle={state.castle} />

        {/* Shop */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="panel p-4 flex-1">
            <div className="font-bold text-amber-900 text-base mb-3">Castle Parts</div>
            <div className="grid grid-cols-2 gap-2">
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
          <div className="panel p-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-900 text-sm">Rest</span>
              <span className="text-gray-500 text-xs ml-2">Heal {REST_HEAL} HP for ${REST_COST}</span>
            </div>
            <button
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                state.sandDollars >= REST_COST && state.playerHp < state.playerMaxHp
                  ? 'bg-green-100 border-2 border-green-400 text-green-800 hover:bg-green-200 cursor-pointer'
                  : 'bg-gray-100 border-2 border-gray-300 text-gray-400'
              }`}
              disabled={state.sandDollars < REST_COST || state.playerHp >= state.playerMaxHp}
              onClick={() => dispatch({ type: 'rest' })}
            >
              Rest (${REST_COST})
            </button>
          </div>

          {/* Continue */}
          <button
            className="btn-primary w-full text-center text-lg py-3"
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
  let statusLabel: string

  if (owned) {
    className = 'bg-green-50 border-green-300 opacity-60'
    statusLabel = 'Built'
  } else if (!meetsPrereq) {
    className = 'bg-gray-100 border-gray-200 opacity-40'
    statusLabel = `Needs ${def.prereq}`
  } else if (!canAfford) {
    className = 'bg-gray-50 border-gray-200 opacity-50'
    statusLabel = `$${def.cost}`
  } else {
    className = 'bg-amber-50 border-amber-300 hover:border-amber-500 hover:bg-amber-100 cursor-pointer'
    statusLabel = `$${def.cost}`
  }

  return (
    <button
      className={`p-3 rounded-lg border-2 text-left transition-all ${className}`}
      disabled={!canBuild}
      onClick={() => dispatch({ type: 'build_part', part: partType })}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm capitalize text-gray-800">
          {owned ? '✓ ' : ''}{partType}
        </span>
        <span className={`text-xs font-bold ${!meetsPrereq && !owned ? 'text-gray-400' : 'text-amber-700'}`}>
          {statusLabel}
        </span>
      </div>
      <div className="text-[10px] text-gray-500">{def.bonus}</div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-amber-600">+{def.score} score</span>
        {!owned && !meetsPrereq && (
          <svg width="12" height="12" viewBox="0 0 16 16" className="opacity-40">
            <rect x="5" y="8" width="6" height="6" rx="1" fill="#999" />
            <path d="M6 8 L6 6 Q6 3 8 3 Q10 3 10 6 L10 8" fill="none" stroke="#999" strokeWidth="1.5" />
          </svg>
        )}
      </div>
    </button>
  )
}
