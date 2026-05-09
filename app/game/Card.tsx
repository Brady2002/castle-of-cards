'use client'

import type { Card } from './types'

export const PIECE_EMOJI: Record<string, string> = {
  sand:  '🟫',
  wall:  '🧱',
  tower: '🗼',
  flag:  '🚩',
}

const CARD_STYLE: Record<string, string> = {
  sand:  'bg-amber-50  border-amber-400',
  wall:  'bg-amber-100 border-amber-600',
  tower: 'bg-stone-100 border-stone-500',
  flag:  'bg-red-50    border-red-400',
}

type Props = {
  card: Card
  disabled: boolean
  onDragStart: (card: Card) => void
  onDragEnd: () => void
  onClick?: () => void
}

export default function CardComponent({ card, disabled, onDragStart, onDragEnd, onClick }: Props) {
  const cursor = onClick ? 'cursor-pointer' : disabled ? 'cursor-not-allowed' : 'cursor-grab'
  const hover  = !disabled ? 'hover:scale-105 hover:-translate-y-1' : ''

  return (
    <div
      draggable={!disabled && !onClick}
      onDragStart={e => {
        e.dataTransfer.setData('cardId', card.id)
        onDragStart(card)
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        w-20 h-28 rounded-xl border-2 p-2 flex flex-col items-center justify-between
        select-none transition-transform duration-100
        ${CARD_STYLE[card.piece]} ${cursor} ${hover}
        ${disabled ? 'opacity-40' : ''}
      `}
    >
      <div className="text-3xl mt-1">{PIECE_EMOJI[card.piece]}</div>
      <div className="text-center w-full">
        <div className="text-xs font-bold text-gray-800 leading-tight">{card.name}</div>
        <div className="text-xs text-yellow-500 mt-0.5">{'⚡'.repeat(card.cost)}</div>
      </div>
    </div>
  )
}
