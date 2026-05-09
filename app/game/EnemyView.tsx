'use client'

import type { ReactNode } from 'react'
import type { EnemyInstance } from './types'
import { ENEMY_DEFS } from './enemies'

type Props = {
  enemy: EnemyInstance
  targetable: boolean
  highlighted?: boolean
  onClick?: () => void
}

const ELITE_BOSS_NAMES = new Set(['Giant Coconut Crab', 'Angry Pelican Flock', 'The Tide King'])

export default function EnemyView({ enemy, targetable, highlighted, onClick }: Props) {
  const hpPct = (enemy.hp / enemy.maxHp) * 100
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171'
  const isEliteOrBoss = ELITE_BOSS_NAMES.has(enemy.defName)
  const isEnraged = enemy.phase === 1

  return (
    <div
      className={`enemy-card ${targetable ? 'targetable' : ''} ${highlighted ? 'drag-target' : ''} ${isEnraged ? 'enraged' : ''}`}
      data-enemy-id={enemy.id}
      onClick={targetable ? onClick : undefined}
    >
      {/* Enemy Art */}
      <div className="flex justify-center mb-3">
        <EnemyArt name={enemy.defName} size={isEliteOrBoss ? 200 : 150} />
      </div>

      {/* Name */}
      <div className="text-[22px] font-bold text-center leading-tight mb-3" style={{ color: isEnraged ? '#dc2626' : '#374151' }}>
        {enemy.defName}{isEnraged ? ' (Enraged)' : ''}
      </div>

      {/* HP Bar */}
      <div className="w-full mb-3.5">
        <div className="h-[18px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.18)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${hpPct}%`, background: hpColor }}
          />
        </div>
        <div className="text-[19px] text-center text-gray-600 font-bold mt-1.5">
          {enemy.hp}/{enemy.maxHp}
        </div>
      </div>

      {/* Block */}
      {enemy.block > 0 && (
        <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-[17px] font-bold text-blue-800"
          style={{ background: 'linear-gradient(135deg, #93c5fd, #60a5fa)', border: '2px solid #3b82f6' }}>
          {enemy.block}
        </div>
      )}

      {/* Intent */}
      <div className="flex justify-center">
        <IntentBadge intent={enemy.intent} strength={enemy.status.strength} />
      </div>

      {/* Status Effects */}
      {(enemy.status.vulnerable > 0 || enemy.status.weak > 0 || enemy.status.strength > 0) && (
        <div className="flex gap-1 justify-center mt-1">
          {enemy.status.vulnerable > 0 && (
            <StatusBadge label="Vuln" value={enemy.status.vulnerable} color="#f59e0b" bg="#fef3c7" />
          )}
          {enemy.status.weak > 0 && (
            <StatusBadge label="Weak" value={enemy.status.weak} color="#8b5cf6" bg="#ede9fe" />
          )}
          {enemy.status.strength > 0 && (
            <StatusBadge label="Str" value={enemy.status.strength} color="#dc2626" bg="#fee2e2" />
          )}
        </div>
      )}

      {/* Hover tooltip: intent + active status effects */}
      <EnemyTooltip enemy={enemy} />
    </div>
  )
}

function EnemyTooltip({ enemy }: { enemy: EnemyInstance }) {
  return (
    <div className="enemy-tooltip">
      <IntentTooltipCard intent={enemy.intent} strength={enemy.status.strength} />
      {enemy.status.vulnerable > 0 && (
        <TooltipCard
          title="Vulnerable"
          accent="vulnerable"
          icon={<StatusIcon kind="vulnerable" />}
          body={<>Takes <span className="tooltip-emph">50% more</span> damage from attacks. Decreases by 1 each turn. ({enemy.status.vulnerable} left)</>}
        />
      )}
      {enemy.status.weak > 0 && (
        <TooltipCard
          title="Weak"
          accent="weak"
          icon={<StatusIcon kind="weak" />}
          body={<>Deals <span className="tooltip-emph">25% less</span> attack damage. Decreases by 1 each turn. ({enemy.status.weak} left)</>}
        />
      )}
      {enemy.status.strength > 0 && (
        <TooltipCard
          title="Strength"
          accent="strength"
          icon={<StatusIcon kind="strength" />}
          body={<>Increases attack damage by <span className="tooltip-emph">{enemy.status.strength}</span>.</>}
        />
      )}
    </div>
  )
}

function IntentTooltipCard({ intent, strength }: { intent: EnemyInstance['intent']; strength: number }) {
  switch (intent.type) {
    case 'attack': {
      const dmg = intent.damage + strength
      return (
        <TooltipCard
          title="Attack"
          accent="attack"
          icon={<IntentIcon kind="attack" />}
          body={<>Intends to attack for <span className="tooltip-emph">{dmg}</span> damage.</>}
        />
      )
    }
    case 'multi_attack': {
      const dmg = intent.damage + strength
      return (
        <TooltipCard
          title="Multi-Attack"
          accent="attack"
          icon={<IntentIcon kind="attack" />}
          body={<>Intends to attack for <span className="tooltip-emph">{dmg}</span> damage <span className="tooltip-emph">{intent.hits}</span> times.</>}
        />
      )
    }
    case 'defend':
      return (
        <TooltipCard
          title="Defend"
          accent="defend"
          icon={<IntentIcon kind="defend" />}
          body={<>Intends to gain <span className="tooltip-emph">{intent.block}</span> Block.</>}
        />
      )
    case 'buff': {
      const label = intent.status === 'strength' ? 'Strength' : intent.status
      return (
        <TooltipCard
          title="Buff"
          accent="buff"
          icon={<IntentIcon kind="buff" />}
          body={<>Intends to gain <span className="tooltip-emph">{intent.amount}</span> {label}.</>}
        />
      )
    }
    case 'debuff': {
      const label = intent.status === 'vulnerable' ? 'Vulnerable'
        : intent.status === 'weak' ? 'Weak'
        : intent.status
      return (
        <TooltipCard
          title="Debuff"
          accent="debuff"
          icon={<IntentIcon kind="debuff" />}
          body={<>Intends to apply <span className="tooltip-emph">{intent.amount}</span> {label} to you.</>}
        />
      )
    }
  }
}

type Accent = 'attack' | 'defend' | 'buff' | 'debuff' | 'vulnerable' | 'weak' | 'strength'

function TooltipCard({ title, accent, icon, body }: { title: string; accent: Accent; icon: ReactNode; body: ReactNode }) {
  return (
    <div className="tooltip-card">
      <div className={`tooltip-card-title tooltip-accent-${accent}`}>
        {icon}
        <span>{title}</span>
      </div>
      <div className="tooltip-card-body">{body}</div>
    </div>
  )
}

function IntentIcon({ kind }: { kind: 'attack' | 'defend' | 'buff' | 'debuff' }) {
  switch (kind) {
    case 'attack':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <path d="M8 2 L14 14 L8 10 L2 14 Z" fill="#fca5a5" />
        </svg>
      )
    case 'defend':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <path d="M8 1 L14 4 L14 10 L8 15 L2 10 L2 4 Z" fill="#93c5fd" />
        </svg>
      )
    case 'buff':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <path d="M8 2 L10 6 L14 7 L11 10 L12 14 L8 12 L4 14 L5 10 L2 7 L6 6 Z" fill="#fcd34d" />
        </svg>
      )
    case 'debuff':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="none" stroke="#c4b5fd" strokeWidth="2" />
          <path d="M5 5 L11 11 M11 5 L5 11" stroke="#c4b5fd" strokeWidth="1.5" />
        </svg>
      )
  }
}

function StatusIcon({ kind }: { kind: 'vulnerable' | 'weak' | 'strength' }) {
  switch (kind) {
    case 'vulnerable':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <path d="M8 2 L14 13 L2 13 Z" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8 6 L8 10 M8 11.5 L8 12" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'weak':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <path d="M3 8 Q5 4 8 8 Q11 12 13 8" fill="none" stroke="#c4b5fd" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M2 12 L14 12" stroke="#c4b5fd" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        </svg>
      )
    case 'strength':
      return (
        <svg width="20" height="20" viewBox="0 0 16 16">
          <path d="M3 6 L6 6 L6 3 L10 3 L10 6 L13 6 L13 10 L10 10 L10 13 L6 13 L6 10 L3 10 Z" fill="#fca5a5" />
        </svg>
      )
  }
}

function StatusBadge({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <span className="text-[15px] font-bold px-2.5 py-1 rounded-full" style={{ color, background: bg }}>
      {label} {value}
    </span>
  )
}

function IntentBadge({ intent, strength }: { intent: EnemyInstance['intent']; strength: number }) {
  switch (intent.type) {
    case 'attack': {
      const effectiveDmg = intent.damage + strength
      return (
        <div className="intent-badge intent-attack">
          <svg width="20" height="20" viewBox="0 0 16 16">
            <path d="M8 2 L14 14 L8 10 L2 14 Z" fill="#dc2626" />
          </svg>
          <span>{effectiveDmg}</span>
        </div>
      )
    }
    case 'multi_attack': {
      const effectiveDmg = intent.damage + strength
      return (
        <div className="intent-badge intent-attack">
          <svg width="20" height="20" viewBox="0 0 16 16">
            <path d="M8 2 L14 14 L8 10 L2 14 Z" fill="#dc2626" />
          </svg>
          <span>{effectiveDmg}x{intent.hits}</span>
        </div>
      )
    }
    case 'defend':
      return (
        <div className="intent-badge intent-defend">
          <svg width="20" height="20" viewBox="0 0 16 16">
            <path d="M8 1 L14 4 L14 10 L8 15 L2 10 L2 4 Z" fill="#3b82f6" />
          </svg>
          <span>{intent.block}</span>
        </div>
      )
    case 'buff':
      return (
        <div className="intent-badge intent-buff">
          <svg width="20" height="20" viewBox="0 0 16 16">
            <path d="M8 2 L10 6 L14 7 L11 10 L12 14 L8 12 L4 14 L5 10 L2 7 L6 6 Z" fill="#f59e0b" />
          </svg>
          <span>+{intent.amount}</span>
        </div>
      )
    case 'debuff':
      return (
        <div className="intent-badge intent-debuff">
          <svg width="20" height="20" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="#8b5cf6" strokeWidth="2" />
            <path d="M5 5 L11 11 M11 5 L5 11" stroke="#8b5cf6" strokeWidth="1.5" />
          </svg>
          <span>{intent.amount}</span>
        </div>
      )
  }
}

function EnemyArt({ name, size }: { name: string; size: number }) {
  const s = size
  switch (name) {
    case 'Sand Crab':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <ellipse cx="24" cy="28" rx="14" ry="10" fill="#e8a87c" stroke="#c4724e" strokeWidth="1.5" />
          <circle cx="18" cy="20" r="3" fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx="18" cy="20" r="1.5" fill="#333" />
          <circle cx="30" cy="20" r="3" fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx="30" cy="20" r="1.5" fill="#333" />
          <path d="M10 30 Q6 24 4 28" stroke="#c4724e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M38 30 Q42 24 44 28" stroke="#c4724e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'Seagull':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <ellipse cx="24" cy="28" rx="10" ry="8" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
          <circle cx="24" cy="18" r="7" fill="#fff" stroke="#ccc" strokeWidth="1" />
          <circle cx="22" cy="16" r="2" fill="#333" />
          <path d="M26 20 L32 19 L28 21" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <path d="M14 26 Q4 18 2 24" stroke="#ccc" strokeWidth="2" fill="none" />
          <path d="M34 26 Q44 18 46 24" stroke="#ccc" strokeWidth="2" fill="none" />
        </svg>
      )
    case 'Jellyfish':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <path d="M12 24 Q12 10 24 10 Q36 10 36 24" fill="#dda0dd" stroke="#ba55d3" strokeWidth="1.5" />
          <circle cx="20" cy="18" r="2" fill="#333" />
          <circle cx="28" cy="18" r="2" fill="#333" />
          <path d="M14 24 Q16 34 14 42" stroke="#dda0dd" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M20 24 Q22 36 20 44" stroke="#dda0dd" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M28 24 Q26 36 28 44" stroke="#dda0dd" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M34 24 Q32 34 34 42" stroke="#dda0dd" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'Hermit Crab':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <ellipse cx="24" cy="22" rx="13" ry="11" fill="#d4a574" stroke="#a0845c" strokeWidth="1.5" />
          <path d="M14 22 Q14 12 24 10 Q34 12 34 22" fill="#c4956a" stroke="#8b6914" strokeWidth="1" />
          <circle cx="20" cy="30" r="2.5" fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx="20" cy="30" r="1.2" fill="#333" />
          <circle cx="28" cy="30" r="2.5" fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx="28" cy="30" r="1.2" fill="#333" />
          <path d="M12 34 Q6 28 4 32" stroke="#e8a87c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M36 34 Q42 28 44 32" stroke="#e8a87c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'Pelican':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <ellipse cx="24" cy="30" rx="11" ry="9" fill="#f5f5f5" stroke="#ddd" strokeWidth="1" />
          <circle cx="24" cy="16" r="8" fill="#fff" stroke="#ddd" strokeWidth="1" />
          <circle cx="21" cy="14" r="2" fill="#333" />
          <path d="M26 18 L38 22 L26 26" fill="#f5a623" stroke="#d4841f" strokeWidth="1" />
          <path d="M26 22 L36 22" stroke="#d4841f" strokeWidth="0.5" />
          <path d="M28 24 Q34 28 32 22" fill="#f5c98a" stroke="none" opacity="0.6" />
        </svg>
      )
    case 'Sea Urchin':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="26" r="10" fill="#2d1b69" stroke="#1a1040" strokeWidth="1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
            const rad = (angle * Math.PI) / 180
            const x1 = 24 + Math.cos(rad) * 10
            const y1 = 26 + Math.sin(rad) * 10
            const x2 = 24 + Math.cos(rad) * 18
            const y2 = 26 + Math.sin(rad) * 18
            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a2d8a" strokeWidth="2" strokeLinecap="round" />
          })}
          <circle cx="20" cy="24" r="2" fill="#a78bfa" />
          <circle cx="28" cy="24" r="2" fill="#a78bfa" />
        </svg>
      )
    case 'Sand Flea':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <ellipse cx="24" cy="28" rx="8" ry="6" fill="#c4956a" stroke="#8b6914" strokeWidth="1" />
          <circle cx="24" cy="20" r="5" fill="#d4a574" stroke="#8b6914" strokeWidth="1" />
          <circle cx="22" cy="18" r="1.5" fill="#333" />
          <circle cx="26" cy="18" r="1.5" fill="#333" />
          <path d="M16 32 L12 38" stroke="#8b6914" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M32 32 L36 38" stroke="#8b6914" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 32 L18 40" stroke="#8b6914" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M28 32 L30 40" stroke="#8b6914" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'Starfish':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <path d="M24 4 L28 18 L42 18 L31 26 L35 40 L24 32 L13 40 L17 26 L6 18 L20 18 Z"
            fill="#ff6b6b" stroke="#c0392b" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="22" cy="22" r="1.5" fill="#333" />
          <circle cx="26" cy="22" r="1.5" fill="#333" />
        </svg>
      )
    case 'Giant Coconut Crab':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <ellipse cx="24" cy="26" rx="18" ry="14" fill="#8b4513" stroke="#5c2d0e" strokeWidth="2" />
          <circle cx="16" cy="14" r="4" fill="#fff" stroke="#333" strokeWidth="1.5" />
          <circle cx="16" cy="14" r="2" fill="#333" />
          <circle cx="32" cy="14" r="4" fill="#fff" stroke="#333" strokeWidth="1.5" />
          <circle cx="32" cy="14" r="2" fill="#333" />
          <path d="M6 28 Q0 18 2 24" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M0 22 L4 20" stroke="#8b4513" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M42 28 Q48 18 46 24" stroke="#8b4513" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M48 22 L44 20" stroke="#8b4513" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'Angry Pelican Flock':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="14" cy="20" r="6" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
          <circle cx="13" cy="18" r="1.5" fill="#c0392b" />
          <path d="M16 22 L24 22 L18 24" fill="#f5a623" strokeWidth="0.5" />
          <circle cx="34" cy="16" r="6" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
          <circle cx="33" cy="14" r="1.5" fill="#c0392b" />
          <path d="M36 18 L44 18 L38 20" fill="#f5a623" strokeWidth="0.5" />
          <circle cx="24" cy="32" r="7" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
          <circle cx="23" cy="30" r="1.5" fill="#c0392b" />
          <path d="M26 34 L36 34 L28 36" fill="#f5a623" strokeWidth="0.5" />
        </svg>
      )
    case 'The Tide King':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <path d="M14 18 Q24 4 34 18" fill="#1e90ff" stroke="#104e8b" strokeWidth="1.5" />
          <ellipse cx="24" cy="30" rx="16" ry="12" fill="#4169e1" stroke="#104e8b" strokeWidth="1.5" />
          <path d="M18 8 L20 14 M24 4 L24 12 M30 8 L28 14" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="6" r="2" fill="#ffd700" />
          <circle cx="19" cy="26" r="3" fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx="19" cy="26" r="1.5" fill="#333" />
          <circle cx="29" cy="26" r="3" fill="#fff" stroke="#333" strokeWidth="1" />
          <circle cx="29" cy="26" r="1.5" fill="#333" />
          <path d="M20 34 Q24 38 28 34" stroke="#104e8b" strokeWidth="1.5" fill="none" />
          <path d="M8 36 Q4 42 12 40" stroke="#4169e1" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 36 Q44 42 36 40" stroke="#4169e1" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="#ddd" stroke="#aaa" strokeWidth="1.5" />
          <text x="24" y="28" textAnchor="middle" fontSize="14" fill="#666">?</text>
        </svg>
      )
  }
}
