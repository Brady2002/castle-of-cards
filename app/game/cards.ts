import type { CardDefinition, CardInstance, Rarity } from './types'

export const CARD_DEFS: Record<string, CardDefinition> = {
  // === Starting Cards ===
  'Shell Strike': {
    name: 'Shell Strike',
    type: 'attack',
    rarity: 'common',
    energyCost: 1,
    effects: [{ kind: 'damage', amount: 6, target: 'single' }],
    description: 'Deal 6 damage.',
  },
  'Sand Shield': {
    name: 'Sand Shield',
    type: 'skill',
    rarity: 'common',
    energyCost: 1,
    effects: [{ kind: 'block', amount: 5 }],
    description: 'Gain 5 Block.',
  },
  'Pebble Toss': {
    name: 'Pebble Toss',
    type: 'attack',
    rarity: 'common',
    energyCost: 0,
    effects: [{ kind: 'apply_status', status: 'vulnerable', amount: 1, target: 'single' }],
    description: 'Apply 1 Vulnerable.',
  },

  // === Common Attacks ===
  'Crab Pinch': {
    name: 'Crab Pinch',
    type: 'attack',
    rarity: 'common',
    energyCost: 1,
    effects: [{ kind: 'damage', amount: 9, target: 'single' }],
    description: 'Deal 9 damage.',
  },
  'Wave Crash': {
    name: 'Wave Crash',
    type: 'attack',
    rarity: 'common',
    energyCost: 2,
    effects: [{ kind: 'damage', amount: 8, target: 'all' }],
    description: 'Deal 8 damage to ALL enemies.',
  },
  'Double Splash': {
    name: 'Double Splash',
    type: 'attack',
    rarity: 'common',
    energyCost: 1,
    effects: [{ kind: 'multi_hit', hits: 2, perHit: 3, target: 'single' }],
    description: 'Deal 3 damage 2 times.',
  },

  // === Common Skills ===
  'Hunker Down': {
    name: 'Hunker Down',
    type: 'skill',
    rarity: 'common',
    energyCost: 1,
    effects: [{ kind: 'block', amount: 8 }],
    description: 'Gain 8 Block.',
  },
  'Tide Pool': {
    name: 'Tide Pool',
    type: 'skill',
    rarity: 'common',
    energyCost: 1,
    effects: [
      { kind: 'block', amount: 4 },
      { kind: 'draw', count: 1 },
    ],
    description: 'Gain 4 Block. Draw 1.',
  },
  'Seashell Toss': {
    name: 'Seashell Toss',
    type: 'skill',
    rarity: 'common',
    energyCost: 1,
    effects: [{ kind: 'apply_status', status: 'vulnerable', amount: 1, target: 'single' }],
    description: 'Apply 1 Vulnerable.',
  },

  // === Uncommon Attacks ===
  'Riptide': {
    name: 'Riptide',
    type: 'attack',
    rarity: 'uncommon',
    energyCost: 2,
    effects: [{ kind: 'damage', amount: 14, target: 'single' }],
    description: 'Deal 14 damage.',
  },
  'Barrage of Shells': {
    name: 'Barrage of Shells',
    type: 'attack',
    rarity: 'uncommon',
    energyCost: 2,
    effects: [{ kind: 'multi_hit', hits: 3, perHit: 4, target: 'single' }],
    description: 'Deal 4 damage 3 times.',
  },
  'Undertow': {
    name: 'Undertow',
    type: 'attack',
    rarity: 'uncommon',
    energyCost: 1,
    effects: [
      { kind: 'damage', amount: 7, target: 'single' },
      { kind: 'apply_status', status: 'weak', amount: 1, target: 'single' },
    ],
    description: 'Deal 7 damage. Apply 1 Weak.',
  },

  // === Uncommon Skills ===
  'Sandstorm': {
    name: 'Sandstorm',
    type: 'skill',
    rarity: 'uncommon',
    energyCost: 1,
    effects: [{ kind: 'apply_status', status: 'weak', amount: 2, target: 'all' }],
    description: 'Apply 2 Weak to ALL enemies.',
  },
  'Coral Armor': {
    name: 'Coral Armor',
    type: 'skill',
    rarity: 'uncommon',
    energyCost: 2,
    effects: [{ kind: 'block', amount: 14 }],
    description: 'Gain 14 Block.',
  },
  'Beachcomb': {
    name: 'Beachcomb',
    type: 'skill',
    rarity: 'uncommon',
    energyCost: 1,
    effects: [{ kind: 'draw', count: 2 }],
    description: 'Draw 2 cards.',
  },
  'Shore Up': {
    name: 'Shore Up',
    type: 'skill',
    rarity: 'uncommon',
    energyCost: 0,
    effects: [
      { kind: 'block', amount: 3 },
      { kind: 'energy', amount: 1 },
    ],
    description: 'Gain 3 Block. Gain 1 Energy.',
  },

  // === Rare Attacks ===
  'Tidal Wave': {
    name: 'Tidal Wave',
    type: 'attack',
    rarity: 'rare',
    energyCost: 3,
    effects: [{ kind: 'damage', amount: 16, target: 'all' }],
    description: 'Deal 16 damage to ALL enemies.',
  },
  'Sunstroke': {
    name: 'Sunstroke',
    type: 'attack',
    rarity: 'rare',
    energyCost: 2,
    effects: [
      { kind: 'damage', amount: 10, target: 'single' },
      { kind: 'apply_status', status: 'vulnerable', amount: 2, target: 'single' },
    ],
    description: 'Deal 10 damage. Apply 2 Vulnerable.',
  },

  // === Rare Skills ===
  'Fortress of Sand': {
    name: 'Fortress of Sand',
    type: 'skill',
    rarity: 'rare',
    energyCost: 3,
    effects: [{ kind: 'block', amount: 22 }],
    description: 'Gain 22 Block.',
  },
  'Second Wind': {
    name: 'Second Wind',
    type: 'skill',
    rarity: 'rare',
    energyCost: 1,
    effects: [
      { kind: 'draw', count: 3 },
      { kind: 'energy', amount: 1 },
    ],
    description: 'Draw 3 cards. Gain 1 Energy.',
  },
}

// Cards that are NOT in the starting deck (reward pool)
const STARTER_NAMES = new Set(['Shell Strike', 'Sand Shield', 'Pebble Toss'])

export function getDef(card: CardInstance): CardDefinition {
  return CARD_DEFS[card.defName]
}

let nextId = 0
export function makeCard(defName: string): CardInstance {
  return { id: `card-${nextId++}-${defName}`, defName }
}

export function buildStartingDeck(): CardInstance[] {
  const cards: CardInstance[] = []
  for (let i = 0; i < 5; i++) cards.push(makeCard('Shell Strike'))
  for (let i = 0; i < 4; i++) cards.push(makeCard('Sand Shield'))
  cards.push(makeCard('Pebble Toss'))
  return cards
}

export function generateRewardOptions(encounter: number): CardInstance[] {
  const rewardDefs = Object.values(CARD_DEFS).filter(d => !STARTER_NAMES.has(d.name))

  const rarityWeights: Record<Rarity, number> = {
    common: Math.max(1, 7 - encounter),
    uncommon: 3 + encounter,
    rare: Math.max(1, encounter - 2),
  }

  function weightedPick(): CardDefinition {
    const totalWeight = rewardDefs.reduce((sum, d) => sum + rarityWeights[d.rarity], 0)
    let roll = Math.random() * totalWeight
    for (const def of rewardDefs) {
      roll -= rarityWeights[def.rarity]
      if (roll <= 0) return def
    }
    return rewardDefs[rewardDefs.length - 1]
  }

  const picked = new Set<string>()
  const options: CardInstance[] = []
  while (options.length < 3) {
    const def = weightedPick()
    if (!picked.has(def.name)) {
      picked.add(def.name)
      options.push(makeCard(def.name))
    }
  }
  return options
}

export function needsTarget(card: CardInstance): boolean {
  const def = getDef(card)
  return def.effects.some(e =>
    (e.kind === 'damage' && e.target === 'single') ||
    (e.kind === 'multi_hit' && e.target === 'single') ||
    (e.kind === 'apply_status' && e.target === 'single')
  )
}
