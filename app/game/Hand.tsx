'use client'

import type { Card } from './types'
import CardComponent from './Card'

type Props = {
  cards: Card[]
  energy: number
  onDragStart: (card: Card) => void
  onDragEnd: () => void
  onEndTurn: () => void
}

export default function Hand({ cards, energy, onDragStart, onDragEnd, onEndTurn }: Props) {
  return (
    <div className="w-full max-w-3xl">
      <div className="bg-amber-900 rounded-2xl p-4 flex items-center gap-3 flex-wrap shadow-lg">
        <div className="text-amber-200 text-sm font-medium mr-1">Hand:</div>

        {cards.map(card => (
          <CardComponent
            key={card.id}
            card={card}
            disabled={card.cost > energy}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {cards.length === 0 && (
          <span className="text-amber-400 italic text-sm">Empty — end turn to draw</span>
        )}

        <button
          className="ml-auto px-5 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-colors shadow"
          onClick={onEndTurn}
        >
          End Turn →
        </button>
      </div>
    </div>
  )
}
