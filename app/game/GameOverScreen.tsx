'use client'

import type { GameState } from './types'
import type { GameAction } from './logic'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function GameOverScreen({ state, dispatch }: Props) {
  const isWin = state.phase === 'win'

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: isWin
          ? 'linear-gradient(180deg, #7ec8e3 0%, #e8d5b7 50%, #f5edd8 100%)'
          : 'linear-gradient(180deg, #1e3a5f 0%, #1e293b 100%)',
      }}
    >
      <div className="modal-sketchy p-10 max-w-sm w-full mx-4 text-center">
        {/* Icon */}
        <div className="mb-5">
          {isWin ? (
            <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
              <rect x="15" y="55" width="50" height="12" rx="3" fill="#d4a574" stroke="#a0845c" strokeWidth="2" />
              <rect x="25" y="40" width="30" height="18" rx="2" fill="#c4956a" stroke="#a0845c" strokeWidth="1.5" />
              <rect x="32" y="25" width="16" height="18" rx="1" fill="#b08050" stroke="#a0845c" strokeWidth="1.5" />
              <line x1="40" y1="8" x2="40" y2="25" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M40 8 L56 14 L40 21" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
              <path d="M4 35 Q16 20 28 35 Q40 50 52 35 Q64 20 76 35" fill="none" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
              <path d="M4 50 Q16 35 28 50 Q40 65 52 50 Q64 35 76 50" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
              <path d="M10 65 Q22 52 34 65 Q46 78 58 65" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <h1 className={`text-3xl font-bold mb-3 ${isWin ? 'text-amber-800' : 'text-blue-200'}`}>
          {isWin ? 'Your Castle Stands!' : 'Washed Away!'}
        </h1>

        <p className={`mb-5 text-sm leading-relaxed ${isWin ? 'text-amber-700' : 'text-blue-300'}`}>
          {isWin
            ? 'You defeated The Tide King and built a magnificent sandcastle!'
            : state.playerHp <= 0
            ? 'The beach creatures overwhelmed you. Better luck next time!'
            : 'You survived but your castle wasn\'t grand enough. Score 50 to win!'}
        </p>

        <div className="mb-6 space-y-2 text-sm">
          {[
            ['Castle Score', `${state.castleScore}/50`],
            ['Parts Built', state.castle.length],
            ['Encounters Cleared', state.encounter],
            ['Sand Dollars', state.sandDollars],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="flex justify-between px-4 py-1.5 rounded-lg"
              style={{
                background: isWin ? 'rgba(245, 158, 11, 0.1)' : 'rgba(96, 165, 250, 0.1)',
              }}
            >
              <span className={isWin ? 'text-amber-700' : 'text-blue-300'}>{label}</span>
              <span className={`font-bold ${isWin ? 'text-amber-900' : 'text-blue-100'}`}>{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'restart' })}
          className="w-full py-3 font-bold rounded-xl transition-colors cursor-pointer text-white text-lg"
          style={{
            background: isWin
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: `2px solid ${isWin ? '#b45309' : '#1d4ed8'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
