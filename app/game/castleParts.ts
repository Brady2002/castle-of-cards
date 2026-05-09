import type { CastlePartDef, CastlePartType, CastleBonuses } from './types'

/*
  Dependency tree:

  Moat (standalone)     Foundation (base)     Seawall (standalone)
                            │
                           Wall
                         /  |  \
                Decoration Tower Battlement
                            │
                           Flag
*/

export const CASTLE_PART_DEFS: Record<CastlePartType, CastlePartDef> = {
  foundation: {
    type: 'foundation',
    cost: 8,
    score: 5,
    bonus: '+3 max HP (healed)',
    prereq: null,
  },
  moat: {
    type: 'moat',
    cost: 12,
    score: 8,
    bonus: 'Start combat with 3 Block',
    prereq: null,
  },
  seawall: {
    type: 'seawall',
    cost: 18,
    score: 10,
    bonus: '+2 Block at end of each turn',
    prereq: null,
  },
  wall: {
    type: 'wall',
    cost: 15,
    score: 12,
    bonus: '+1 energy on turn 1',
    prereq: 'foundation',
  },
  decoration: {
    type: 'decoration',
    cost: 10,
    score: 7,
    bonus: 'Enemies start with 1 Vulnerable',
    prereq: 'wall',
  },
  tower: {
    type: 'tower',
    cost: 22,
    score: 15,
    bonus: 'Draw 1 extra card each turn',
    prereq: 'wall',
  },
  battlement: {
    type: 'battlement',
    cost: 25,
    score: 12,
    bonus: '3 dmg to all enemies at combat start',
    prereq: 'wall',
  },
  flag: {
    type: 'flag',
    cost: 30,
    score: 20,
    bonus: '1.5x total castle score',
    prereq: 'tower',
  },
}

export function hasPrereq(castle: CastlePartType[], partType: CastlePartType): boolean {
  const def = CASTLE_PART_DEFS[partType]
  if (!def.prereq) return true
  return castle.includes(def.prereq)
}

export function computeCastleScore(parts: CastlePartType[]): number {
  let score = 0
  const hasFlag = parts.includes('flag')
  for (const type of parts) {
    score += CASTLE_PART_DEFS[type].score
  }
  if (hasFlag) score = Math.floor(score * 1.5)
  return score
}

export function computeCastleBonuses(parts: CastlePartType[]): CastleBonuses {
  const bonuses: CastleBonuses = {
    maxHpBonus: 0,
    startingBlock: 0,
    blockPerTurn: 0,
    extraEnergyTurn1: false,
    extraDraw: 0,
    enemyStartVuln: 0,
    combatStartDamage: 0,
  }

  for (const type of parts) {
    switch (type) {
      case 'foundation':
        bonuses.maxHpBonus += 3
        break
      case 'decoration':
        bonuses.enemyStartVuln += 1
        break
      case 'moat':
        bonuses.startingBlock += 3
        break
      case 'wall':
        bonuses.extraEnergyTurn1 = true
        break
      case 'seawall':
        bonuses.blockPerTurn += 2
        break
      case 'tower':
        bonuses.extraDraw += 1
        break
      case 'battlement':
        bonuses.combatStartDamage += 3
        break
      // flag handled via score multiplier
    }
  }

  return bonuses
}

// Ordered bottom-to-top for visual rendering
export const ALL_PARTS: CastlePartType[] = [
  'foundation', 'moat', 'seawall', 'wall', 'decoration', 'battlement', 'tower', 'flag',
]

// Tier assignments for visual castle rendering (bottom to top)
export const PART_TIER: Record<CastlePartType, number> = {
  foundation: 0,
  moat: 0,
  seawall: 0,
  wall: 1,
  decoration: 2,
  battlement: 2,
  tower: 2,
  flag: 3,
}
