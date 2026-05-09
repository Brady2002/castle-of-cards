'use client'

import type { ReactNode } from 'react'
import type { GameAction } from './logic'
import { canPlayCard } from './logic'
import type { GameState } from './types'
import CardComponent from './Card'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
  onPeekDraw: () => void
  onPeekDiscard: () => void
  draggingCardId: string | null
  onCardMouseDown: (cardId: string, e: React.MouseEvent<HTMLDivElement>) => void
}

export default function Hand({ state, dispatch, onPeekDraw, onPeekDiscard, draggingCardId, onCardMouseDown }: Props) {
  const isPlayerTurn = state.phase === 'combat_player_turn' || state.phase === 'targeting'
  const dragActive = draggingCardId !== null

  return (
    <div className="w-full">
      <div className={`hand-tray flex items-stretch gap-7 px-9 pt-8 pb-8 ${dragActive ? 'drag-active' : ''}`}>
        {/* === Left cluster: energy orb + draw pile === */}
        <div className="hand-cluster shrink-0">
          <EnergyOrb energy={state.energy} max={state.maxEnergy} />
          <PileButton
            label="Draw"
            count={state.deck.length}
            onClick={onPeekDraw}
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24">
                <rect x="4" y="3" width="13" height="17" rx="2" fill="#1e3a8a" stroke="#1e293b" strokeWidth="1.5" />
                <rect x="7" y="6" width="13" height="17" rx="2" fill="#3b82f6" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="10" y1="11" x2="17" y2="11" stroke="#dbeafe" strokeWidth="1.2" />
                <line x1="10" y1="15" x2="17" y2="15" stroke="#dbeafe" strokeWidth="1.2" />
              </svg>
            }
          />
        </div>

        {/* === Cards === */}
        <div className="flex-1 flex items-end justify-center gap-6 flex-wrap min-h-[210px] py-2">
          {state.hand.length === 0 && (
            <span className="text-amber-200/70 italic text-sm py-10">No cards in hand</span>
          )}
          {state.hand.map(card => {
            const playable = isPlayerTurn && canPlayCard(state, card)
            const isDragging = card.id === draggingCardId

            return (
              <CardComponent
                key={card.id}
                card={card}
                playable={playable}
                dragging={isDragging}
                onMouseDown={playable ? (e) => onCardMouseDown(card.id, e) : undefined}
              />
            )
          })}
        </div>

        {/* === Right cluster: end turn + discard pile === */}
        <div className="hand-cluster shrink-0">
          {isPlayerTurn ? (
            <button
              className="btn-primary btn-end-turn"
              onClick={() => dispatch({ type: 'end_turn' })}
            >
              End Turn
            </button>
          ) : (
            <div className="end-turn-waiting">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span>Waiting</span>
            </div>
          )}
          <PileButton
            label="Discard"
            count={state.discard.length}
            onClick={onPeekDiscard}
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24">
                <rect x="5" y="4" width="14" height="17" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="9" y1="9" x2="15" y2="9" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="9" y1="13" x2="15" y2="13" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="9" y1="17" x2="15" y2="17" stroke="#cbd5e1" strokeWidth="1.2" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}

function EnergyOrb({ energy, max }: { energy: number; max: number }) {
  return (
    <div className="energy-orb" aria-label={`Energy ${energy} of ${max}`}>
      <svg viewBox="0 0 80 80" width="116" height="116">
        <defs>
          <radialGradient id="energy-glow" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#energy-glow)" stroke="#78350f" strokeWidth="3" />
        <circle cx="32" cy="30" r="9" fill="#fef9c3" opacity="0.55" />
        <circle cx="40" cy="40" r="36" fill="none" stroke="#fff8e1" strokeWidth="1.4" opacity="0.6" />
      </svg>
      <div className="energy-orb-text">
        <span className="energy-orb-num">{energy}</span>
        <span className="energy-orb-max">/{max}</span>
      </div>
    </div>
  )
}

function PileButton({
  label,
  count,
  icon,
  onClick,
}: {
  label: string
  count: number
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className="pile-button"
      onClick={onClick}
      aria-label={`${label} pile (${count} cards)`}
    >
      <div className="pile-icon">{icon}</div>
      <div className="pile-label">{label}</div>
      <div className="pile-count">{count}</div>
    </button>
  )
}
