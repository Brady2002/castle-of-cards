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
  const isPower = def.type === 'power'
  const typeClass = isAttack ? 'game-card-attack' : isPower ? 'game-card-power' : 'game-card-skill'
  const targeted = needsTarget(card)
  const dividerClass = isAttack ? 'border-red-300/50' : isPower ? 'border-purple-300/60' : 'border-blue-300/50'
  const typeLabelClass = isAttack ? 'text-red-500' : isPower ? 'text-purple-600' : 'text-blue-500'

  const w = compact ? 'w-[110px]' : 'w-[150px]'
  const minH = compact ? 'min-h-[150px]' : 'min-h-[200px]'

  return (
    <div
      onClick={playable || onClick ? onClick : undefined}
      className={`
        game-card ${typeClass} ${RARITY_CLASS[def.rarity]}
        ${playable ? 'playable' : !onClick ? 'disabled' : 'playable'}
        ${selected ? 'selected' : ''}
        ${w} ${minH} border-2 p-3 flex flex-col items-center gap-1.5 select-none
      `}
    >
      {/* Energy cost badge */}
      <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
        style={{
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          border: '2px solid #d97706',
          color: '#78350f',
          boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
        }}
      >
        {def.energyCost}
      </div>

      {/* Target indicator */}
      {targeted && (
        <div className="absolute -top-1.5 -left-1.5">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="3" fill="none" stroke="#dc2626" strokeWidth="1" />
            <circle cx="8" cy="8" r="1" fill="#dc2626" />
          </svg>
        </div>
      )}

      {/* Card icon */}
      <div className="mt-1">
        <CardIcon cardName={def.name} type={def.type} size={compact ? 28 : 42} />
      </div>

      {/* Name */}
      <div className={`font-bold text-gray-800 text-center leading-tight ${compact ? 'text-[12px]' : 'text-[15px]'}`}>
        {def.name}
      </div>

      {/* Divider */}
      <div className={`w-3/4 border-t ${dividerClass}`} />

      {/* Type label */}
      <div className={`text-[10px] font-bold uppercase tracking-wider ${typeLabelClass}`}>
        {def.type}
      </div>

      {/* Description */}
      <div className={`text-gray-600 text-center leading-snug ${compact ? 'text-[11px]' : 'text-[12px]'}`}>
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

export function CardIcon({ cardName, type, size }: { cardName: string; type: string; size: number }) {
  const atkColor = '#dc2626'
  const defColor = '#3b82f6'
  const powerColor = '#9333ea'
  const c = type === 'attack' ? atkColor : type === 'power' ? powerColor : defColor

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
    'Sea Spray': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M4 22 Q8 18 12 22 Q16 26 20 22 Q24 18 28 22" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="12" r="1.5" fill={c} />
        <circle cx="14" cy="8" r="1.5" fill={c} />
        <circle cx="20" cy="10" r="1.5" fill={c} />
        <circle cx="26" cy="14" r="1.5" fill={c} />
        <circle cx="11" cy="16" r="1" fill={c} opacity="0.7" />
        <circle cx="23" cy="6" r="1" fill={c} opacity="0.7" />
      </svg>
    ),
    'Sun Bath': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="6" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={16 + Math.cos(r) * 8}
              y1={16 + Math.sin(r) * 8}
              x2={16 + Math.cos(r) * 12}
              y2={16 + Math.sin(r) * 12}
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )
        })}
        <path d="M14 16 L18 16 M16 14 L16 18" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    'Boulder Bash': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M6 22 Q4 14 10 10 Q14 7 20 9 Q26 11 26 18 Q26 24 20 24 L10 24 Q6 24 6 22 Z"
          fill="#9ca3af" stroke="#4b5563" strokeWidth="1.5" />
        <path d="M11 14 Q13 13 14 15" stroke="#4b5563" strokeWidth="1" fill="none" />
        <path d="M18 12 Q20 11 21 13" stroke="#4b5563" strokeWidth="1" fill="none" />
        <path d="M16 19 Q18 18 20 20" stroke="#4b5563" strokeWidth="1" fill="none" />
        <path d="M16 3 L20 7 L16 9 L12 7 Z" fill="#bfdbfe" stroke={c} strokeWidth="1" opacity="0.6" />
      </svg>
    ),
    'Castle Doctrine': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 4 L26 8 L26 18 L16 26 L6 18 L6 8 Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M16 10 L18 16 L24 14 L19 18 L21 24 L16 21 L11 24 L13 18 L8 14 L14 16 Z"
          fill="#fbbf24" stroke="#dc2626" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    ),
    'Glass Shards': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M6 4 L14 14 L8 22 Z" fill="#bfdbfe" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 6 L24 10 L18 18 Z" fill="#bfdbfe" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 20 L26 22 L20 28 Z" fill="#bfdbfe" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="9" y1="8" x2="11" y2="11" stroke="#fff" strokeWidth="0.8" opacity="0.8" />
        <line x1="19" y1="10" x2="21" y2="13" stroke="#fff" strokeWidth="0.8" opacity="0.8" />
      </svg>
    ),
    'Adrenaline Rush': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 4 Q22 4 22 10 Q22 14 18 16 Q20 18 22 22 Q22 28 16 28 Q10 28 10 22 Q12 18 14 16 Q10 14 10 10 Q10 4 16 4 Z"
          fill="#fca5a5" stroke="#dc2626" strokeWidth="1.5" />
        <path d="M14 13 L18 13 L17 16 L19 16 L15 22 L16 18 L13 18 Z"
          fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    ),
    'Sea Foam': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="10" cy="20" r="4" fill="#dbeafe" stroke={c} strokeWidth="1.2" />
        <circle cx="16" cy="14" r="5" fill="#dbeafe" stroke={c} strokeWidth="1.2" />
        <circle cx="22" cy="20" r="4" fill="#dbeafe" stroke={c} strokeWidth="1.2" />
        <circle cx="13" cy="24" r="2.5" fill="#dbeafe" stroke={c} strokeWidth="1" />
        <circle cx="20" cy="24" r="2.5" fill="#dbeafe" stroke={c} strokeWidth="1" />
        <circle cx="14" cy="12" r="1.2" fill="#fff" opacity="0.85" />
        <circle cx="20" cy="13" r="1" fill="#fff" opacity="0.85" />
      </svg>
    ),
    'Sandcastle Architect': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect x="4" y="6" width="24" height="20" rx="1" fill="#fef9c3" stroke="#a16207" strokeWidth="1.5" />
        <path d="M8 22 L8 18 L12 18 L12 14 L16 14 L16 10 L20 10 L20 14 L24 14 L24 22 Z"
          fill="none" stroke="#a16207" strokeWidth="1.4" strokeDasharray="2 1.5" />
        <line x1="6" y1="22" x2="26" y2="22" stroke="#a16207" strokeWidth="1" />
        <line x1="6" y1="9" x2="10" y2="9" stroke="#a16207" strokeWidth="0.7" />
        <line x1="6" y1="11" x2="9" y2="11" stroke="#a16207" strokeWidth="0.7" />
      </svg>
    ),
    'Wrecking Wave': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M2 24 Q4 6 10 16 Q16 28 22 10 Q26 4 30 16 L30 26 L2 26 Z"
          fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" strokeLinejoin="round" opacity="0.85" />
        <path d="M4 18 Q8 12 12 18" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
        <path d="M18 14 Q22 8 26 14" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
        <circle cx="6" cy="22" r="1" fill="#fff" opacity="0.6" />
        <circle cx="14" cy="22" r="1" fill="#fff" opacity="0.6" />
        <circle cx="22" cy="22" r="1" fill="#fff" opacity="0.6" />
      </svg>
    ),
    'Bulwark': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <rect x="4" y="14" width="24" height="14" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
        <path d="M4 14 L4 8 L8 8 L8 12 L12 12 L12 8 L16 8 L16 12 L20 12 L20 8 L24 8 L24 12 L28 12 L28 14"
          fill="#94a3b8" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="#475569" strokeWidth="0.7" />
        <line x1="10" y1="14" x2="10" y2="20" stroke="#475569" strokeWidth="0.6" />
        <line x1="22" y1="14" x2="22" y2="20" stroke="#475569" strokeWidth="0.6" />
        <line x1="14" y1="20" x2="14" y2="28" stroke="#475569" strokeWidth="0.6" />
        <line x1="18" y1="20" x2="18" y2="28" stroke="#475569" strokeWidth="0.6" />
      </svg>
    ),
    'Riptide Coil': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M4 8 Q12 8 12 14 Q12 20 20 20 Q28 20 28 14 Q28 8 24 8"
          fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 6 L28 8 L24 11" fill={c} />
        <path d="M6 22 Q14 22 14 26" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    'Lifeguard Stance': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M16 3 L26 7 L26 17 L16 27 L6 17 L6 7 Z" fill="#fbbf24" stroke={c} strokeWidth="1.6" />
        <path d="M14 12 L18 12 L18 16 L22 16 L22 18 L18 18 L18 22 L14 22 L14 18 L10 18 L10 16 L14 16 Z" fill="#fff" stroke={c} strokeWidth="0.8" />
      </svg>
    ),
    'Driftwood Discipline': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M4 18 Q10 14 18 18 Q24 22 28 18" fill="none" stroke="#a16207" strokeWidth="3" strokeLinecap="round" />
        <path d="M6 22 Q12 19 22 22" fill="none" stroke="#854d0e" strokeWidth="1" strokeLinecap="round" />
        <circle cx="22" cy="9" r="3" fill={c} opacity="0.85" />
        <path d="M19 9 L25 9 M22 6 L22 12" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
    'Tide Charge': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <path d="M2 22 Q8 14 16 22 Q24 30 30 22" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 4 L22 14 L18 14 L20 22 L13 13 L17 13 Z" fill={c} stroke="#581c87" strokeWidth="0.8" strokeLinejoin="round" />
      </svg>
    ),
    'Solar Flare': (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={16 + Math.cos(r) * 8}
              y1={16 + Math.sin(r) * 8}
              x2={16 + Math.cos(r) * 14}
              y2={16 + Math.sin(r) * 14}
              stroke="#dc2626"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )
        })}
      </svg>
    ),
    "Sun's Blessing": (
      <svg width={size} height={size} viewBox="0 0 32 32">
        <circle cx="16" cy="14" r="6" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
        {[0, 60, 120, 180, 240, 300].map(a => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={16 + Math.cos(r) * 7.5}
              y1={14 + Math.sin(r) * 7.5}
              x2={16 + Math.cos(r) * 11}
              y2={14 + Math.sin(r) * 11}
              stroke="#f59e0b"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )
        })}
        <path d="M11 24 Q16 30 21 24 Q16 21 11 24 Z" fill="#fca5a5" stroke="#dc2626" strokeWidth="1" />
      </svg>
    ),
  }

  return icons[cardName] || (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="10" fill={type === 'attack' ? '#fee2e2' : '#dbeafe'} stroke={c} strokeWidth="1.5" />
    </svg>
  )
}
