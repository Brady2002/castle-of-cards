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
      <div
        className="modal-sketchy w-full max-w-5xl flex flex-col"
        style={{ minHeight: 'min(560px, 80vh)', maxHeight: '88vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-4 border-b-2 border-amber-700/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-900/15 border-2 border-amber-700/40">
              <PileIcon title={title} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-900 leading-tight">{title}</h2>
              <div className="text-[11px] text-amber-700/80 font-bold tracking-wider uppercase">
                {cards.length} card{cards.length === 1 ? '' : 's'}
                {shuffled && <span className="ml-1.5 opacity-70">· shown alphabetically</span>}
              </div>
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-amber-700/70 text-amber-900 hover:bg-amber-100 cursor-pointer transition-colors"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-amber-700/60 italic py-12">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
            </svg>
            <span>Empty</span>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 flex flex-col">
            <div
              className="flex-1 flex justify-center"
              style={{ alignItems: 'safe center', paddingTop: 56, paddingBottom: 56, paddingLeft: 40, paddingRight: 40 }}
            >
              <div
                className="grid justify-center w-full"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, 200px)',
                  columnGap: 32,
                  rowGap: 48,
                }}
              >
                {cards.map(card => (
                  <CardComponent key={card.id} card={card} playable={false} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PileIcon({ title }: { title: string }) {
  if (title.toLowerCase().includes('discard')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <rect x="5" y="4" width="14" height="17" rx="2" fill="#92400e" stroke="#3d2210" strokeWidth="1.5" />
        <line x1="9" y1="9" x2="15" y2="9" stroke="#fde68a" strokeWidth="1.4" />
        <line x1="9" y1="13" x2="15" y2="13" stroke="#fde68a" strokeWidth="1.4" />
        <line x1="9" y1="17" x2="15" y2="17" stroke="#fde68a" strokeWidth="1.4" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="4" y="3" width="13" height="17" rx="2" fill="#1e3a8a" stroke="#3d2210" strokeWidth="1.5" />
      <rect x="7" y="6" width="13" height="17" rx="2" fill="#3b82f6" stroke="#3d2210" strokeWidth="1.5" />
      <line x1="10" y1="11" x2="17" y2="11" stroke="#dbeafe" strokeWidth="1.3" />
      <line x1="10" y1="15" x2="17" y2="15" stroke="#dbeafe" strokeWidth="1.3" />
    </svg>
  )
}
