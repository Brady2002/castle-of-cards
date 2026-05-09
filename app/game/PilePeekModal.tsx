'use client'

import type { CardInstance } from './types'
import CardComponent from './Card'

type Props = {
  title: string
  cards: CardInstance[]
  shuffled?: boolean
  onClose: () => void
}

export default function PilePeekModal({ title, cards, shuffled, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="modal-sketchy p-6 w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-900">{title}</h2>
            <div className="text-xs text-amber-700/80 font-bold tracking-wide uppercase">
              {cards.length} card{cards.length === 1 ? '' : 's'}{shuffled ? ' · shown alphabetically' : ''}
            </div>
          </div>
          <button
            className="px-3 py-1.5 rounded-lg text-sm font-bold border-2 border-amber-700 text-amber-900 hover:bg-amber-100 cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-amber-700/60 italic">
            Empty
          </div>
        ) : (
          <div className="overflow-y-auto pr-2">
            <div className="flex flex-wrap gap-3 justify-center pb-2">
              {cards.map(card => (
                <CardComponent key={card.id} card={card} playable={false} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
