'use client'

import React from 'react'
import type { CardInstance } from './types'
import { getDef, needsTarget } from './cards'

const RARITY_CLASS: Record<string, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare',
}

type Props = {
  card: CardInstance
  playable: boolean
  selected?: boolean
  onClick?: () => void
  compact?: boolean
}

export default function CardComponent({ card, playable, selected, onClick, compact }: Props) {
  const def = getDef(card)
  const isAttack = def.type === 'attack'
  const typeClass = isAttack ? 'game-card-attack' : 'game-card-skill'
  const targeted = needsTarget(card)

  const w = compact ? 'w-[100px]' : 'w-[120px]'

  return (
    <div
      onClick={playable || onClick ? onClick : undefined}
      className={`
        game-card ${typeClass} ${RARITY_CLASS[def.rarity]}
        ${playable ? 'playable' : !onClick ? 'disabled' : 'playable'}
        ${selected ? 'selected' : ''}
        ${w} border-2 p-2 flex flex-col items-center gap-1 select-none
      `}
    >
      {/* Energy cost badge */}
      <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          border: '2px solid #d97706',
          color: '#78350f',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        {def.energyCost}
      </div>

      {/* Target indicator */}
      {targeted && (
        <div className="absolute -top-1 -left-1">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="3" fill="none" stroke="#dc2626" strokeWidth="1" />
            <circle cx="8" cy="8" r="1" fill="#dc2626" />
          </svg>
        </div>
      )}

      {/* Card icon */}
      <div className="mt-1">
        <CardIcon cardName={def.name} type={def.type} size={compact ? 24 : 32} />
      </div>

      {/* Name */}
      <div className={`font-bold text-gray-800 text-center leading-tight ${compact ? 'text-[11px]' : 'text-[13px]'}`}>
        {def.name}
      </div>

      {/* Divider */}
      <div className={`w-3/4 border-t ${isAttack ? 'border-red-300/50' : 'border-blue-300/50'}`} />

      {/* Type label */}
      <div className={`text-[9px] font-bold uppercase tracking-wider ${isAttack ? 'text-red-400' : 'text-blue-400'}`}>
        {def.type}
      </div>

      {/* Description */}
      <div className={`text-gray-500 text-center leading-snug ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
        {def.description}
      </div>

      {/* Rarity dots */}
      <div className="flex gap-1 mt-auto pt-1">
        {def.rarity === 'common' && <RarityDot color="#a0845c" />}
        {def.rarity === 'uncommon' && <><RarityDot color="#0284c7" /><RarityDot color="#0284c7" /></>}
        {def.rarity === 'rare' && <><RarityDot color="#9333ea" /><RarityDot color="#9333ea" /><RarityDot color="#9333ea" /></>}
      </div>
    </div>
  )
}

function RarityDot({ color }: { color: string }) {
  return (
    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
  )
}

function CardIcon({ cardName, type, size }: { cardName: string; type: string; size: number }) {
  const atkColor = '#dc2626'
  const defColor = '#3b82f6'
  const c = type === 'attack' ? atkColor : defColor

  const icons: Record<string, React.ReactNode> = {
    'Shell Strike': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M8 28 L24 4" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="24" cy="6" rx="5" ry="4" fill="#f9d5d5" stroke={c} strokeWidth="1" />
      </svg>
    ),
    'Sand Shield': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 3 L27 8 L27 18 L16 28 L5 18 L5 8 Z" fill="#bfdbfe" stroke={c} strokeWidth="1.5" />
        <path d="M10 12 L16 10 L22 12 L22 18 L16 22 L10 18 Z" fill="#93c5fd" stroke="none" opacity="0.5" />
      </svg>
    ),
    'Pebble Toss': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="12" cy="20" r="4" fill="#a0845c" stroke="#6b5c3e" strokeWidth="1.5" />
        <circle cx="22" cy="14" r="3" fill="#c4956a" stroke="#6b5c3e" strokeWidth="1" />
        <path d="M16 12 Q20 6 26 8" stroke={c} strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
    'Crab Pinch': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M8 24 Q4 16 10 12" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M24 24 Q28 16 22 12" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M8 12 L12 8" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M24 12 L20 8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Wave Crash': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M2 20 Q8 10 14 20 Q20 30 26 16 L30 12" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 12 L30 12 L28 16" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Double Splash': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="12" cy="16" r="5" fill="none" stroke={c} strokeWidth="2" />
        <circle cx="20" cy="16" r="5" fill="none" stroke={c} strokeWidth="2" />
        <path d="M10 10 L14 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 10 L18 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    'Hunker Down': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 4 L28 10 L28 22 L16 30 L4 22 L4 10 Z" fill="#bfdbfe" stroke={c} strokeWidth="2" />
        <path d="M16 10 L22 13 L22 19 L16 24 L10 19 L10 13 Z" fill="#60a5fa" stroke="none" opacity="0.4" />
      </svg>
    ),
    'Tide Pool': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <ellipse cx="16" cy="20" rx="12" ry="7" fill="#bfdbfe" stroke={c} strokeWidth="1.5" />
        <path d="M6 18 Q10 14 14 18 Q18 22 22 18 Q26 14 28 16" fill="none" stroke={c} strokeWidth="1.5" />
        <rect x="22" y="4" width="6" height="8" rx="1" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
      </svg>
    ),
    'Seashell Toss': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <ellipse cx="16" cy="18" rx="8" ry="7" fill="#f9d5d5" stroke="#d97790" strokeWidth="1.5" />
        <path d="M16 11 Q16 18 10 22" fill="none" stroke="#d97790" strokeWidth="1" />
        <path d="M16 11 Q16 18 22 22" fill="none" stroke="#d97790" strokeWidth="1" />
        <path d="M20 8 Q26 4 28 8" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
    'Riptide': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M4 24 Q10 8 16 16 Q22 24 28 8" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="8" r="2" fill={c} />
      </svg>
    ),
    'Barrage of Shells': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="8" cy="22" r="4" fill="#f9d5d5" stroke={c} strokeWidth="1" />
        <circle cx="16" cy="14" r="4" fill="#f9d5d5" stroke={c} strokeWidth="1" />
        <circle cx="24" cy="22" r="4" fill="#f9d5d5" stroke={c} strokeWidth="1" />
        <path d="M8 18 L16 10 M16 10 L24 18" stroke={c} strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
    'Undertow': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M4 12 Q10 4 16 12 Q22 20 28 12" fill="none" stroke={c} strokeWidth="2.5" />
        <path d="M8 24 Q14 16 20 24 Q26 32 30 24" fill="none" stroke="#8b5cf6" strokeWidth="2" />
      </svg>
    ),
    'Sandstorm': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M4 20 Q10 16 16 20 Q22 24 28 20" fill="none" stroke="#d4a574" strokeWidth="2" />
        <path d="M6 14 Q12 10 18 14 Q24 18 30 14" fill="none" stroke="#c4956a" strokeWidth="2" />
        <path d="M2 26 Q8 22 14 26 Q20 30 26 26" fill="none" stroke="#e8c49a" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="8" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    ),
    'Coral Armor': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 3 L28 8 L28 20 L16 28 L4 20 L4 8 Z" fill="#f0abfc" stroke="#c026d3" strokeWidth="1.5" />
        <path d="M10 12 L16 10 L22 12 L22 18 L16 22 L10 18 Z" fill="#e879f9" stroke="none" opacity="0.4" />
      </svg>
    ),
    'Beachcomb': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect x="6" y="6" width="10" height="14" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <rect x="18" y="10" width="10" height="14" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
        <path d="M4 26 L28 26" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Shore Up': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 4 L27 10 L27 18 L16 26 L5 18 L5 10 Z" fill="#bfdbfe" stroke={c} strokeWidth="1.5" />
        <path d="M16 14 L16 20" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 17 L16 14 L19 17" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Tidal Wave': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M2 22 Q8 6 16 16 Q24 26 30 6" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        <path d="M2 28 Q8 18 14 24" fill="none" stroke={c} strokeWidth="2" opacity="0.5" />
      </svg>
    ),
    'Sunstroke': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="12" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        {[0, 60, 120, 180, 240, 300].map(a => {
          const rad = (a * Math.PI) / 180
          return <line key={a} x1={16 + Math.cos(rad) * 8} y1={12 + Math.sin(rad) * 8} x2={16 + Math.cos(rad) * 12} y2={12 + Math.sin(rad) * 12} stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        })}
        <path d="M12 24 L16 28 L20 24" stroke={c} strokeWidth="2" fill="none" />
      </svg>
    ),
    'Fortress of Sand': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect x="4" y="16" width="24" height="12" rx="2" fill="#d4a574" stroke="#a0845c" strokeWidth="1.5" />
        <path d="M4 16 L4 10 L8 10 L8 13 L12 13 L12 10 L16 10 L16 13 L20 13 L20 10 L24 10 L24 13 L28 13 L28 16" fill="#c4956a" stroke="#a0845c" strokeWidth="1" />
        <path d="M16 3 L28 8 L28 16 L16 22 L4 16 L4 8 Z" fill="none" stroke={c} strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    ),
    'Second Wind': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M8 16 Q12 6 22 12" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 8 L22 12 L18 12" fill={c} />
        <path d="M24 16 Q20 26 10 20" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 24 L10 20 L14 20" fill={c} />
        <path d="M14 14 L16 10 L18 14" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  }

  return icons[cardName] || (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="10" fill={type === 'attack' ? '#fee2e2' : '#dbeafe'} stroke={c} strokeWidth="1.5" />
    </svg>
  )
}
