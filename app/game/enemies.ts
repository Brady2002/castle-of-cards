import type { EnemyDefinition, EnemyInstance, EnemyIntent, StatusEffects } from './types'

export const ENEMY_DEFS: Record<string, EnemyDefinition> = {
  // --- REGULAR ENEMIES ---

  // Simple intro enemy. Cycles light/heavy attack.
  'Sand Crab': {
    name: 'Sand Crab',
    hpRange: [24, 30],
    pattern: [
      { type: 'attack', damage: 7 },
      { type: 'attack', damage: 11 },
    ],
    patternType: 'cycle',
  },

  // Chip damage dealer that scales. Gains Strength every 3rd move.
  'Seagull': {
    name: 'Seagull',
    hpRange: [28, 34],
    pattern: [
      { type: 'attack', damage: 4 },
      { type: 'attack', damage: 4 },
      { type: 'buff', status: 'strength', amount: 2 },
    ],
    patternType: 'cycle',
  },

  // Debuffer. Weakens you then hits hard.
  'Jellyfish': {
    name: 'Jellyfish',
    hpRange: [22, 28],
    pattern: [
      { type: 'debuff', status: 'weak', amount: 2 },
      { type: 'attack', damage: 11 },
    ],
    patternType: 'cycle',
  },

  // Tanky. Starts with Block (Curl Up). Alternates defend/attack.
  'Hermit Crab': {
    name: 'Hermit Crab',
    hpRange: [32, 40],
    pattern: [
      { type: 'defend', block: 11 },
      { type: 'attack', damage: 14 },
    ],
    patternType: 'cycle',
    startingBlock: 8,
  },

  // Multi-hitter + defense. Shreds through block.
  'Pelican': {
    name: 'Pelican',
    hpRange: [28, 36],
    pattern: [
      { type: 'multi_attack', damage: 5, hits: 2 },
      { type: 'attack', damage: 8 },
      { type: 'defend', block: 7 },
    ],
    patternType: 'cycle',
  },

  // Vulnerability applier. Makes its follow-up hit devastating.
  'Sea Urchin': {
    name: 'Sea Urchin',
    hpRange: [26, 32],
    pattern: [
      { type: 'debuff', status: 'vulnerable', amount: 2 },
      { type: 'attack', damage: 13 },
      { type: 'attack', damage: 8 },
    ],
    patternType: 'cycle',
  },

  // Fast, unpredictable. Random moves, hard to plan around.
  'Sand Flea': {
    name: 'Sand Flea',
    hpRange: [14, 20],
    pattern: [
      { type: 'attack', damage: 6 },
      { type: 'attack', damage: 11 },
      { type: 'multi_attack', damage: 4, hits: 2 },
    ],
    patternType: 'random',
  },

  // Scaling threat. Gains Strength then attacks. Must kill fast.
  'Starfish': {
    name: 'Starfish',
    hpRange: [34, 42],
    pattern: [
      { type: 'buff', status: 'strength', amount: 2 },
      { type: 'attack', damage: 8 },
      { type: 'attack', damage: 8 },
    ],
    patternType: 'cycle',
  },

  // --- ELITES ---

  // Tanky bruiser. High HP, blocks then smashes.
  'Giant Coconut Crab': {
    name: 'Giant Coconut Crab',
    hpRange: [76, 86],
    pattern: [
      { type: 'attack', damage: 12 },
      { type: 'defend', block: 14 },
      { type: 'buff', status: 'strength', amount: 3 },
      { type: 'attack', damage: 22 },
    ],
    patternType: 'cycle',
    startingBlock: 10,
  },

  // Multi-hit elite. Rapid attacks that scale.
  'Angry Pelican Flock': {
    name: 'Angry Pelican Flock',
    hpRange: [82, 94],
    pattern: [
      { type: 'multi_attack', damage: 4, hits: 4 },
      { type: 'debuff', status: 'weak', amount: 2 },
      { type: 'buff', status: 'strength', amount: 3 },
      { type: 'multi_attack', damage: 5, hits: 3 },
      { type: 'attack', damage: 16 },
    ],
    patternType: 'cycle',
  },

  // --- BOSS ---

  // Phase 1: Methodical attacks with debuffs. Phase 2 (at 50% HP): Enrages,
  // gains +5 Str and 20 Block, switches to aggressive pattern.
  'The Tide King': {
    name: 'The Tide King',
    hpRange: [150, 170],
    pattern: [
      { type: 'attack', damage: 10 },
      { type: 'debuff', status: 'vulnerable', amount: 2 },
      { type: 'attack', damage: 14 },
      { type: 'defend', block: 12 },
      { type: 'buff', status: 'strength', amount: 2 },
    ],
    pattern2: [
      { type: 'attack', damage: 16 },
      { type: 'multi_attack', damage: 5, hits: 4 },
      { type: 'attack', damage: 22 },
      { type: 'debuff', status: 'weak', amount: 2 },
    ],
    patternType: 'cycle',
  },
}

// 12 encounter progression
export const ENCOUNTER_TABLE: string[][] = [
  ['Sand Crab', 'Sand Crab'],
  ['Seagull', 'Sand Crab'],
  ['Jellyfish', 'Hermit Crab'],
  ['Pelican', 'Sand Flea'],
  ['Sea Urchin', 'Sea Urchin', 'Seagull'],
  ['Giant Coconut Crab'],
  ['Starfish', 'Hermit Crab', 'Sand Flea'],
  ['Pelican', 'Jellyfish', 'Sand Crab'],
  ['Starfish', 'Starfish', 'Sea Urchin'],
  ['Angry Pelican Flock'],
  ['Hermit Crab', 'Hermit Crab', 'Jellyfish', 'Seagull'],
  ['The Tide King'],
]

function emptyStatus(): StatusEffects {
  return { vulnerable: 0, weak: 0, strength: 0 }
}

let nextEnemyId = 0

function randRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function spawnEnemies(encounter: number): EnemyInstance[] {
  const names = ENCOUNTER_TABLE[encounter - 1] || ENCOUNTER_TABLE[0]
  return spawnEnemiesByNames(names)
}

export function spawnEnemiesByNames(names: string[]): EnemyInstance[] {
  return names.map(name => {
    const def = ENEMY_DEFS[name]
    const hp = randRange(def.hpRange[0], def.hpRange[1])
    const intentIndex = 0
    const intent = def.patternType === 'random'
      ? def.pattern[Math.floor(Math.random() * def.pattern.length)]
      : def.pattern[0]
    return {
      id: `enemy-${nextEnemyId++}`,
      defName: name,
      hp,
      maxHp: hp,
      block: def.startingBlock ?? 0,
      intentIndex,
      intent,
      status: emptyStatus(),
      phase: 0,
    }
  })
}

export function pickNextIntent(enemy: EnemyInstance): EnemyIntent {
  const def = ENEMY_DEFS[enemy.defName]

  // Use phase 2 pattern if enraged and one exists
  const pattern = (enemy.phase === 1 && def.pattern2) ? def.pattern2 : def.pattern

  if (def.patternType === 'random') {
    // Weighted random with no-triple-repeat
    let pick: EnemyIntent
    let attempts = 0
    do {
      pick = pattern[Math.floor(Math.random() * pattern.length)]
      attempts++
    } while (
      attempts < 10 &&
      pick === enemy.intent &&
      pattern.length > 1
    )
    return pick
  }

  const nextIndex = (enemy.intentIndex + 1) % pattern.length
  return pattern[nextIndex]
}

export function getNextIntentIndex(enemy: EnemyInstance): number {
  const def = ENEMY_DEFS[enemy.defName]

  const pattern = (enemy.phase === 1 && def.pattern2) ? def.pattern2 : def.pattern

  if (def.patternType === 'random') {
    return enemy.intentIndex
  }
  return (enemy.intentIndex + 1) % pattern.length
}

// Check if an enemy should phase transition (boss at 50% HP)
export function checkPhaseTransition(enemy: EnemyInstance): EnemyInstance | null {
  if (enemy.defName !== 'The Tide King') return null
  if (enemy.phase !== 0) return null
  if (enemy.hp > enemy.maxHp / 2) return null

  const def = ENEMY_DEFS[enemy.defName]
  if (!def.pattern2) return null

  // Enrage: gain Strength and Block, switch to phase 2 pattern
  return {
    ...enemy,
    phase: 1,
    status: {
      ...enemy.status,
      strength: enemy.status.strength + 5,
    },
    block: enemy.block + 20,
    intentIndex: 0,
    intent: def.pattern2[0],
  }
}

export function isElite(encounter: number): boolean {
  return encounter === 6 || encounter === 10
}

export function isBoss(encounter: number): boolean {
  return encounter === 12
}

export function getSandDollarReward(encounter: number): number {
  if (isBoss(encounter)) return 0
  if (isElite(encounter)) return 20
  return Math.min(16, 8 + (encounter - 1) * 2)
}
