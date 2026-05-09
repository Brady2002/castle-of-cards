'use client'

import type { GameAction } from './logic'
import { canPlayCard } from './logic'
import type { GameState } from './types'
import CardComponent from './Card'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function Hand({ state, dispatch }: Props) {
  const isPlayerTurn = state.phase === 'combat_player_turn' || state.phase === 'targeting'

  return (
    <div className="w-full max-w-5xl">
      <div className="hand-tray p-4 pb-3 flex items-end gap-3 flex-wrap justify-center">
        {state.hand.length === 0 && (
          <span className="text-amber-300/70 italic text-sm py-4">No cards in hand</span>
        )}

        {state.hand.map(card => {
          const playable = isPlayerTurn && canPlayCard(state, card)
          const selected = state.selectedCardId === card.id

          return (
            <CardComponent
              key={card.id}
              card={card}
              playable={playable}
              selected={selected}
              onClick={playable ? () => dispatch({ type: 'select_card', cardId: card.id }) : undefined}
            />
          )
        })}

        {isPlayerTurn && (
          <button
            className="btn-primary btn-end-turn ml-auto self-center text-base"
            onClick={() => dispatch({ type: 'end_turn' })}
          >
            End Turn
          </button>
        )}
      </div>
    </div>
  )
}
