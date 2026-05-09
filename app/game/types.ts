// === Cards ===
export type Rarity = 'common' | 'uncommon' | 'rare'
export type CardType = 'attack' | 'skill' | 'power'

// Powers fire a trigger at the start of every player turn after the one
// they were played on. They live in GameState.activePowers (one entry per
// stack — playing the same power twice gives 2 entries).
export type PowerTrigger =
  | { kind: 'turn_start_block'; amount: number }
  | { kind: 'turn_start_strength'; amount: number }
  | { kind: 'turn_start_energy'; amount: number }
  | { kind: 'turn_start_draw'; count: number }
  | { kind: 'turn_start_damage_all'; amount: number }
  | { kind: 'turn_start_heal'; amount: number }

export type CardEffect =
  | { kind: 'damage'; amount: number; target: 'single' }
  | { kind: 'damage'; amount: number; target: 'all' }
  | { kind: 'multi_hit'; hits: number; perHit: number; target: 'single' }
  | { kind: 'block'; amount: number }
  | { kind: 'draw'; count: number }
  | { kind: 'apply_status'; status: StatusType; amount: number; target: 'single' | 'all' }
  | { kind: 'energy'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'gain_status'; status: StatusType; amount: number }
  | { kind: 'damage_eq_block'; target: 'single' | 'all' }
  | { kind: 'lose_hp'; amount: number }

export type CardDefinition = {
  name: string
  type: CardType
  rarity: Rarity
  energyCost: number
  effects: CardEffect[]
  // Only meaningful when type === 'power'. The card exhausts on play and
  // this trigger fires at the start of each subsequent player turn.
  powerTrigger?: PowerTrigger
  description: string
}

export type CardInstance = {
  id: string
  defName: string
}

export type PowerInstance = {
  id: string
  defName: string
}

// === Status Effects ===
export type StatusType = 'vulnerable' | 'weak' | 'strength'

export type StatusEffects = {
  vulnerable: number
  weak: number
  strength: number
}

// === Enemies ===
export type IntentType = 'attack' | 'multi_attack' | 'defend' | 'buff' | 'debuff'

export type EnemyIntent =
  | { type: 'attack'; damage: number }
  | { type: 'multi_attack'; damage: number; hits: number }
  | { type: 'defend'; block: number }
  | { type: 'buff'; status: StatusType; amount: number }
  | { type: 'debuff'; status: StatusType; amount: number }

export type EnemyDefinition = {
  name: string
  hpRange: [number, number]
  pattern: EnemyIntent[]
  pattern2?: EnemyIntent[] // phase 2 pattern (for bosses)
  patternType: 'cycle' | 'random'
  startingBlock?: number // Curl Up equivalent
}

export type EnemyInstance = {
  id: string
  defName: string
  hp: number
  maxHp: number
  block: number
  intentIndex: number
  intent: EnemyIntent
  status: StatusEffects
  phase: number // 0 = normal, 1 = enraged/phase 2
}

// === Castle ===
export type CastlePartType =
  | 'foundation' | 'moat' | 'seawall'
  | 'wall' | 'decoration'
  | 'tower' | 'battlement'
  | 'flag'

export type CastlePartDef = {
  type: CastlePartType
  cost: number
  score: number
  bonus: string
  prereq: CastlePartType | null
}

// === Game State ===
export type Phase =
  | 'start'
  | 'map'
  | 'combat_player_turn'
  | 'targeting'
  | 'combat_enemy_turn'
  | 'combat_victory'
  | 'card_reward'
  | 'castle_build'
  | 'event'
  | 'event_result'
  | 'event_remove_card'
  | 'win'
  | 'lose'

export type CastleBonuses = {
  maxHpBonus: number
  startingBlock: number
  blockPerTurn: number
  extraEnergyTurn1: boolean
  extraDraw: number
  enemyStartVuln: number
  combatStartDamage: number
}

export type GameState = {
  phase: Phase

  // Player
  playerHp: number
  playerMaxHp: number
  playerBlock: number
  energy: number
  maxEnergy: number
  playerStatus: StatusEffects

  // Cards
  hand: CardInstance[]
  deck: CardInstance[]
  discard: CardInstance[]
  activePowers: PowerInstance[]

  // Combat
  enemies: EnemyInstance[]
  selectedCardId: string | null
  encounter: number
  turnNumber: number

  // Economy
  sandDollars: number

  // Castle
  castle: CastlePartType[]
  castleScore: number
  castleBonuses: CastleBonuses

  // Rewards
  rewardOptions: CardInstance[]
  canRemoveCard: boolean
  sandDollarsEarned: number

  // Map
  map: import('./map').GameMap
  currentNodeId: string | null

  // Events
  currentEvent: import('./events').GameEvent | null
  eventResult: import('./events').EventOutcome | null
  seenEventIds: string[]
}
