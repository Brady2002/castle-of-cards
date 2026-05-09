'use client'

import type { Card } from './types'
import CardComponent from './Card'

type Props = {
  options: Card[]
  onPick: (card: Card) => void
}

export default function RewardModal({ options, onPick }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-5xl text-center mb-3">🌊</div>
        <h2 className="text-2xl font-bold text-blue-800 text-center mb-1">Wave Complete!</h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          The tide has risen. Pick a card to add to your deck:
        </p>
        <div className="flex justify-center gap-4">
          {options.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              disabled={false}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              onClick={() => onPick(card)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
