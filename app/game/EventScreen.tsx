'use client'

import type { GameState } from './types'
import type { GameAction } from './logic'
import CardComponent from './Card'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

const EVENT_EMOJI: Record<string, string> = {
  tide_pool: '\uD83C\uDF0A',
  stash: '\uD83C\uDF81',
  shrine: '\u26E9\uFE0F',
  crab_hermit: '\uD83E\uDD80',
  sunken_treasure: '\uD83D\uDC8E',
  healing_spring: '\u2728',
}

export default function EventScreen({ state, dispatch }: Props) {
  const event = state.currentEvent
  if (!event) return null

  const isResult = state.phase === 'event_result'
  const isRemoveCard = state.phase === 'event_remove_card'
  const result = state.eventResult

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
      <div className="min-h-screen game-bg flex flex-col items-center justify-center px-4 py-6">
        <div
          className="modal-sketchy w-full max-w-5xl flex flex-col"
          style={{ minHeight: 'min(560px, 80vh)', maxHeight: '88vh' }}
        >
          <div className="reward-header reward-header-remove">
            <div className="reward-header-icon text-3xl">{EVENT_EMOJI[event.id] ?? '\u2728'}</div>
            <div>
              <h2 className="reward-header-title">{event.title}</h2>
              <p className="reward-header-subtitle">Choose a card to remove from your deck</p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 flex flex-col">
            <div
              className="flex-1 flex justify-center px-8 py-8"
              style={{ alignItems: 'safe center' }}
            >
              <div
                className="grid gap-x-8 gap-y-10 justify-center w-full"
                style={{ gridTemplateColumns: 'repeat(auto-fit, 200px)' }}
              >
                {allCards.map(card => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    playable={true}
                    onClick={() => dispatch({ type: 'event_remove_card', cardId: card.id })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t-2 border-pink-400/40">
            <button
              className="reward-btn reward-btn-neutral w-full"
              onClick={() => dispatch({ type: 'skip_event_remove' })}
            >
              {'Skip \u2014 don\'t remove any card'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const goodResult =
    (result?.hpChange && result.hpChange > 0) ||
    (result?.sandDollarsChange && result.sandDollarsChange > 0)
  const badResult = result?.hpChange && result.hpChange < 0
  const resultTone = goodResult ? 'event-result-good' : badResult ? 'event-result-bad' : 'event-result-neutral'

  return (
    <div className="min-h-screen game-bg flex flex-col items-center justify-center px-4 py-6">
      <div className="modal-sketchy w-full max-w-3xl flex flex-col">
        <div className="reward-header reward-header-reward">
          <div className="reward-header-icon text-4xl">{EVENT_EMOJI[event.id] ?? '\u2728'}</div>
          <div>
            <h2 className="reward-header-title">{event.title}</h2>
            <p className="reward-header-subtitle">{'A choice to make\u2026'}</p>
          </div>
        </div>

        <div className="px-10 py-8">
          <div className="event-description mb-7">
            <p>{event.description}</p>
          </div>

          {isResult && result ? (
            <>
              <div className={`event-result ${resultTone} mb-6`}>
                <p>{result.description}</p>
              </div>
              <button
                className="reward-btn reward-btn-neutral w-full"
                onClick={() => dispatch({ type: 'continue_from_event' })}
              >
                Continue
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3.5">
              {event.choices.map((choice, i) => {
                const affordable = canAffordChoice(i)
                return (
                  <button
                    key={i}
                    className={`event-choice ${affordable ? '' : 'event-choice-disabled'}`}
                    disabled={!affordable}
                    onClick={() => dispatch({ type: 'pick_event_choice', choiceIndex: i })}
                  >
                    <span className="event-choice-label">{choice.label}</span>
                    <span className="event-choice-arrow" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3 L11 8 L5 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
