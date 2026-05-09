'use client'

import { useState } from 'react'
import type { GameState } from './types'
import type { GameAction } from './logic'
import CardComponent from './Card'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function RewardModal({ state, dispatch }: Props) {
  const [showRemove, setShowRemove] = useState(false)

  const removableDeck = [...state.deck, ...state.discard]

  if (showRemove) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)' }}>
        <div className="modal-sketchy p-8 max-w-lg w-full mx-4">
          <h2 className="text-xl font-bold text-amber-900 text-center mb-1">
            Remove a Card
          </h2>
          <p className="text-gray-500 text-center text-sm mb-4">
            Choose a card to permanently remove from your deck
          </p>

          <div className="flex flex-wrap gap-3 justify-center max-h-64 overflow-y-auto mb-5 py-2">
            {removableDeck.map(card => (
              <CardComponent
                key={card.id}
                card={card}
                playable={true}
                onClick={() => {
                  dispatch({ type: 'remove_card', cardId: card.id })
                  setShowRemove(false)
                }}
                compact
              />
            ))}
          </div>

          <button
            className="w-full px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
            style={{ background: '#e5e0d4', color: '#78350f', border: '2px solid #c9a96e' }}
            onClick={() => setShowRemove(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-sketchy p-8 max-w-lg w-full mx-4">
        {/* Reward icon */}
        <div className="text-center mb-3">
          <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto">
            <rect x="10" y="18" width="28" height="22" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <path d="M10 18 Q24 8 38 18" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <circle cx="24" cy="28" r="3" fill="#78350f" />
            <line x1="24" y1="24" x2="24" y2="18" stroke="#78350f" strokeWidth="2" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-amber-900 text-center mb-1">
          Card Reward
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Choose a card to add to your deck:
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {state.rewardOptions.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              playable={true}
              onClick={() => dispatch({ type: 'pick_reward', cardId: card.id })}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {state.canRemoveCard && (
            <button
              className="flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer text-sm"
              style={{ background: '#fef2f2', color: '#991b1b', border: '2px solid #fca5a5' }}
              onClick={() => setShowRemove(true)}
            >
              Remove a card instead
            </button>
          )}
          <button
            className="flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer text-sm"
            style={{ background: '#e5e0d4', color: '#78350f', border: '2px solid #c9a96e' }}
            onClick={() => dispatch({ type: 'skip_reward' })}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
