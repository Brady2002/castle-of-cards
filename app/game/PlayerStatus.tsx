'use client'

import type { GameState } from './types'

type Props = {
  state: GameState
}

export default function PlayerStatus({ state }: Props) {
  return (
    <div className="flex items-center gap-4">
      {/* Block */}
      {state.playerBlock > 0 && (
        <div className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M10 2 L17 5 L17 12 L10 18 L3 12 L3 5 Z" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
          </svg>
          <span className="text-blue-700 font-bold text-sm">{state.playerBlock}</span>
        </div>
      )}

      {/* Energy Pips */}
      <div className="flex gap-1.5">
        {Array.from({ length: state.maxEnergy + 2 }, (_, i) => {
          if (i >= Math.max(state.maxEnergy, state.energy)) return null
          return (
            <div
              key={i}
              className={`energy-pip ${i < state.energy ? 'full' : 'empty'}`}
              style={{ width: 24, height: 24 }}
            >
              {i < state.energy && (
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <path d="M7 1 L4 6 L6 6 L5 11 L9 5 L7 5 Z" fill="#78350f" opacity="0.6" />
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Status Effects */}
      {state.playerStatus.vulnerable > 0 && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#f59e0b', background: '#fef3c7' }}>
          Vuln {state.playerStatus.vulnerable}
        </span>
      )}
      {state.playerStatus.weak > 0 && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#8b5cf6', background: '#ede9fe' }}>
          Weak {state.playerStatus.weak}
        </span>
      )}
      {state.playerStatus.strength > 0 && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#dc2626', background: '#fee2e2' }}>
          Str +{state.playerStatus.strength}
        </span>
      )}

      {/* Deck Info */}
      <div className="flex gap-2 text-[11px] text-gray-500 ml-auto">
        <span>{state.deck.length} draw</span>
        <span>{state.discard.length} discard</span>
      </div>
    </div>
  )
}
