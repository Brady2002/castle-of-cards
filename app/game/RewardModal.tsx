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
      <div className="reward-overlay">
        <div
          className="modal-sketchy w-full max-w-5xl flex flex-col"
          style={{ minHeight: 'min(560px, 80vh)', maxHeight: '88vh' }}
        >
          <RewardHeader
            icon={<RemoveIcon />}
            title="Remove a Card"
            subtitle="Choose a card to permanently remove from your deck"
            tone="remove"
          />

          <div className="overflow-y-auto flex-1 flex flex-col">
            <div
              className="flex-1 flex justify-center px-8 py-8"
              style={{ alignItems: 'safe center' }}
            >
              <div
                className="grid gap-x-8 gap-y-10 justify-center w-full"
                style={{ gridTemplateColumns: 'repeat(auto-fit, 200px)' }}
              >
                {removableDeck.map(card => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    playable={true}
                    onClick={() => {
                      dispatch({ type: 'remove_card', cardId: card.id })
                      setShowRemove(false)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t-2 border-pink-400/40">
            <button
              className="reward-btn reward-btn-neutral w-full"
              onClick={() => setShowRemove(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reward-overlay">
      <div className="modal-sketchy w-full max-w-4xl flex flex-col">
        <RewardHeader
          icon={<ChestIcon />}
          title="Card Reward"
          subtitle="Choose a card to add to your deck"
          tone="reward"
        />

        <div className="flex justify-center gap-7 px-8 py-9 flex-wrap">
          {state.rewardOptions.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              playable={true}
              onClick={() => dispatch({ type: 'pick_reward', cardId: card.id })}
            />
          ))}
        </div>

        <div className="px-8 pb-6 pt-2 flex gap-4 flex-wrap">
          {state.canRemoveCard && (
            <button
              className="reward-btn reward-btn-remove flex-1"
              onClick={() => setShowRemove(true)}
            >
              Remove a card instead
            </button>
          )}
          <button
            className="reward-btn reward-btn-neutral flex-1"
            onClick={() => dispatch({ type: 'skip_reward' })}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

function RewardHeader({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  tone: 'reward' | 'remove'
}) {
  return (
    <div className={`reward-header reward-header-${tone}`}>
      <div className="reward-header-icon">{icon}</div>
      <div>
        <h2 className="reward-header-title">{title}</h2>
        <p className="reward-header-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

function ChestIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="20" width="32" height="22" rx="3" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
      <path d="M8 20 Q24 8 40 20" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
      <rect x="8" y="26" width="32" height="3" fill="#78350f" />
      <circle cx="24" cy="29" r="2.5" fill="#fde68a" stroke="#78350f" strokeWidth="1.5" />
      <line x1="24" y1="26" x2="24" y2="22" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <rect x="14" y="12" width="20" height="28" rx="2" fill="#fecaca" stroke="#b91c1c" strokeWidth="2" />
      <path d="M19 22 L29 32 M29 22 L19 32" stroke="#b91c1c" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
