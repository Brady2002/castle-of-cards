'use client'

import type { GameState } from './types'
import type { GameAction } from './logic'
import { getDef } from './cards'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function EventScreen({ state, dispatch }: Props) {
  const event = state.currentEvent
  if (!event) return null

  const isResult = state.phase === 'event_result'
  const isRemoveCard = state.phase === 'event_remove_card'
  const result = state.eventResult

  // Can the player afford the shrine choice?
  const canAffordChoice = (choiceIndex: number) => {
    const choice = event.choices[choiceIndex]
    if (!choice) return false
    const outcome = choice.outcome
    if (outcome.sandDollarsChange !== undefined && outcome.sandDollarsChange < 0) {
      return state.sandDollars >= Math.abs(outcome.sandDollarsChange)
    }
    return true
  }

  if (isRemoveCard) {
    const allCards = [...state.deck, ...state.discard]
    return (
      <div className="min-h-screen game-bg flex flex-col items-center justify-center px-4 py-6 gap-4">
        <div className="modal-sketchy p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-amber-800 mb-2">{event.title}</h2>
          <p className="text-amber-700 mb-4">Choose a card to remove from your deck:</p>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
            {allCards.map(card => {
              const def = getDef(card)
              return (
                <button
                  key={card.id}
                  className="p-2 rounded-lg border-2 border-gray-300 bg-white hover:border-red-400 hover:bg-red-50 text-left transition-all cursor-pointer"
                  onClick={() => dispatch({ type: 'event_remove_card', cardId: card.id })}
                >
                  <div className="font-bold text-sm text-gray-800">{def.name}</div>
                  <div className="text-xs text-gray-500">{def.description}</div>
                </button>
              )
            })}
          </div>
          <button
            className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
            onClick={() => dispatch({ type: 'skip_event_remove' })}
          >
            Skip - don't remove any card
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen game-bg flex flex-col items-center justify-center px-4 py-6 gap-4">
      <div className="modal-sketchy p-8 max-w-md w-full text-center">
        {/* Event icon */}
        <div className="text-5xl mb-4">
          {event.id === 'tide_pool' && '\uD83C\uDF0A'}
          {event.id === 'stash' && '\uD83C\uDF81'}
          {event.id === 'shrine' && '\u26E9\uFE0F'}
          {event.id === 'crab_hermit' && '\uD83E\uDD80'}
          {event.id === 'sunken_treasure' && '\uD83D\uDC8E'}
          {event.id === 'healing_spring' && '\u2728'}
        </div>

        <h2 className="text-2xl font-bold text-amber-800 mb-2">{event.title}</h2>
        <p className="text-amber-700 text-sm mb-6 leading-relaxed">{event.description}</p>

        {isResult && result ? (
          <div>
            <div className="p-4 rounded-lg mb-4" style={{
              background: (result.hpChange && result.hpChange > 0) || result.sandDollarsChange && result.sandDollarsChange > 0
                ? 'rgba(74, 222, 128, 0.15)'
                : result.hpChange && result.hpChange < 0
                ? 'rgba(248, 113, 113, 0.15)'
                : 'rgba(251, 191, 36, 0.15)'
            }}>
              <p className="text-gray-800 font-medium">{result.description}</p>
            </div>
            <button
              className="btn-primary w-full text-center py-3"
              onClick={() => dispatch({ type: 'continue_from_event' })}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {event.choices.map((choice, i) => {
              const affordable = canAffordChoice(i)
              return (
                <button
                  key={i}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    affordable
                      ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 cursor-pointer'
                      : 'border-gray-200 bg-gray-100 opacity-50'
                  }`}
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'pick_event_choice', choiceIndex: i })}
                >
                  <span className="font-bold text-sm text-gray-800">{choice.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
