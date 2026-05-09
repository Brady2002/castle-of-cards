'use client'

import type { GameAction } from './logic'

type Props = {
  sandDollarsEarned: number
  dispatch: (action: GameAction) => void
}

export default function VictoryModal({ sandDollarsEarned, dispatch }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-sketchy p-8 max-w-sm w-full mx-4 text-center">
        {/* Victory icon */}
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto">
            <circle cx="32" cy="32" r="24" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
            <path d="M20 32 L28 40 L44 24" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          Victory!
        </h2>

        {sandDollarsEarned > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#78350f" fontWeight="bold">$</text>
            </svg>
            <span className="text-xl font-bold text-amber-800">+{sandDollarsEarned} Sand Dollars</span>
          </div>
        )}

        <button
          className="btn-primary w-full text-center"
          onClick={() => dispatch({ type: 'continue_from_victory' })}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
