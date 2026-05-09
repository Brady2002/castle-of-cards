import type {
  CardInstance,
  CastleBonuses,
  CastlePartType,
  EnemyInstance,
  GameState,
  StatusEffects,
} from './types'
import { buildStartingDeck, generateRewardOptions, getDef, needsTarget } from './cards'
import { spawnEnemiesByNames, pickNextIntent, getNextIntentIndex, checkPhaseTransition } from './enemies'
import { computeCastleBonuses, computeCastleScore, CASTLE_PART_DEFS, hasPrereq } from './castleParts'
import { generateMap, getNode, markNodeVisited, getSandDollarReward } from './map'
import type { MapNodeType } from './map'
import { getRandomEvent, resolveEventOutcome } from './events'
import type { EventOutcome } from './events'

export const HAND_SIZE = 5
export const STARTING_ENERGY = 3
export const STARTING_HP = 50
export const WIN_SCORE = 50
export const REST_COST = 12
export const REST_HEAL = 15

// === Helpers ===

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function drawCards(
  deck: CardInstance[],
  discard: CardInstance[],
  count: number
): { drawn: CardInstance[]; deck: CardInstance[]; discard: CardInstance[] } {
  let d = [...deck]
  let disc = [...discard]
  const drawn: CardInstance[] = []
  for (let i = 0; i < count; i++) {
    if (d.length === 0) {
      d = shuffle(disc)
      disc = []
    }
    if (d.length > 0) drawn.push(d.pop()!)
  }
  return { drawn, deck: d, discard: disc }
}

function emptyStatus(): StatusEffects {
  return { vulnerable: 0, weak: 0, strength: 0 }
}

function emptyBonuses(): CastleBonuses {
  return {
    maxHpBonus: 0,
    startingBlock: 0,
    blockPerTurn: 0,
    extraEnergyTurn1: false,
    extraDraw: 0,
    enemyStartVuln: 0,
    combatStartDamage: 0,
  }
}

// Damage calc: base + strength, then modified by weak (deal 25% less), then target vuln (take 50% more)
function calcDamage(base: number, attackerStrength: number, attackerWeak: number, targetVuln: number): number {
  let dmg = base + attackerStrength
  if (attackerWeak > 0) dmg = Math.floor(dmg * 0.75)
  if (targetVuln > 0) dmg = Math.floor(dmg * 1.5)
  return Math.max(0, dmg)
}

function applyDamageToTarget(hp: number, block: number, damage: number): { hp: number; block: number } {
  const blocked = Math.min(block, damage)
  const remaining = damage - blocked
  return {
    block: block - blocked,
    hp: Math.max(0, hp - remaining),
  }
}

function tickStatuses(status: StatusEffects): StatusEffects {
  return {
    vulnerable: Math.max(0, status.vulnerable - 1),
    weak: Math.max(0, status.weak - 1),
    strength: status.strength, // permanent
  }
}

// === Create Game ===

export function createGame(): GameState {
  const deck = shuffle(buildStartingDeck())
  const bonuses = emptyBonuses()
  const map = generateMap()

  return {
    phase: 'map',
    playerHp: STARTING_HP,
    playerMaxHp: STARTING_HP,
    playerBlock: 0,
    energy: STARTING_ENERGY,
    maxEnergy: STARTING_ENERGY,
    playerStatus: emptyStatus(),
    hand: [],
    deck,
    discard: [],
    enemies: [],
    selectedCardId: null,
    encounter: 0,
    turnNumber: 1,
    sandDollars: 0,
    castle: [],
    castleScore: 0,
    castleBonuses: bonuses,
    rewardOptions: [],
    canRemoveCard: false,
    sandDollarsEarned: 0,
    map,
    currentNodeId: null,
    currentEvent: null,
    eventResult: null,
    seenEventIds: [],
  }
}

function initCombat(state: GameState, enemyNames: string[]): GameState {
  const bonuses = state.castleBonuses
  let enemies = spawnEnemiesByNames(enemyNames)

  // Castle bonuses: Decoration → enemies start with Vulnerable
  if (bonuses.enemyStartVuln > 0) {
    enemies = enemies.map(e => ({
      ...e,
      status: { ...e.status, vulnerable: e.status.vulnerable + bonuses.enemyStartVuln },
    }))
  }

  // Castle bonuses: Battlement → damage all enemies at combat start
  if (bonuses.combatStartDamage > 0) {
    enemies = enemies.map(e => ({
      ...e,
      hp: Math.max(1, e.hp - bonuses.combatStartDamage),
    }))
  }

  // Draw initial hand
  const drawCount = HAND_SIZE + bonuses.extraDraw
  const { drawn, deck, discard } = drawCards(state.deck, state.discard, drawCount)

  // Energy: base + turn 1 bonus from Wall
  const energy = STARTING_ENERGY + (bonuses.extraEnergyTurn1 ? 1 : 0)

  return {
    ...state,
    phase: 'combat_player_turn',
    enemies,
    hand: drawn,
    deck,
    discard,
    playerBlock: bonuses.startingBlock,
    energy,
    maxEnergy: STARTING_ENERGY,
    playerStatus: emptyStatus(),
    selectedCardId: null,
    turnNumber: 1,
  }
}

// === Can Play ===

export function canPlayCard(state: GameState, card: CardInstance): boolean {
  if (state.phase !== 'combat_player_turn' && state.phase !== 'targeting') return false
  const def = getDef(card)
  return state.energy >= def.energyCost
}

// === Actions ===

export type GameAction =
  | { type: 'play_card'; cardId: string; targetId?: string }
  | { type: 'select_card'; cardId: string }
  | { type: 'cancel_target' }
  | { type: 'target_enemy'; enemyId: string }
  | { type: 'end_turn' }
  | { type: 'resolve_enemy_turn' }
  | { type: 'continue_from_victory' }
  | { type: 'pick_reward'; cardId: string }
  | { type: 'skip_reward' }
  | { type: 'remove_card'; cardId: string }
  | { type: 'build_part'; part: CastlePartType }
  | { type: 'rest' }
  | { type: 'continue_from_build' }
  | { type: 'select_map_node'; nodeId: string }
  | { type: 'pick_event_choice'; choiceIndex: number }
  | { type: 'continue_from_event' }
  | { type: 'event_remove_card'; cardId: string }
  | { type: 'skip_event_remove' }
  | { type: 'restart' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'select_card':
      return selectCard(state, action.cardId)
    case 'cancel_target':
      return { ...state, phase: 'combat_player_turn', selectedCardId: null }
    case 'target_enemy':
      return targetEnemy(state, action.enemyId)
    case 'play_card':
      return playCardDirect(state, action.cardId, action.targetId)
    case 'end_turn':
      return endTurn(state)
    case 'resolve_enemy_turn':
      return resolveEnemyTurn(state)
    case 'continue_from_victory':
      return continueFromVictory(state)
    case 'pick_reward':
      return pickReward(state, action.cardId)
    case 'skip_reward':
      return skipReward(state)
    case 'remove_card':
      return removeCard(state, action.cardId)
    case 'build_part':
      return buildCastlePart(state, action.part)
    case 'rest':
      return rest(state)
    case 'continue_from_build':
      return continueFromBuild(state)
    case 'select_map_node':
      return selectMapNode(state, action.nodeId)
    case 'pick_event_choice':
      return pickEventChoice(state, action.choiceIndex)
    case 'continue_from_event':
      return continueFromEvent(state)
    case 'event_remove_card':
      return eventRemoveCard(state, action.cardId)
    case 'skip_event_remove':
      return skipEventRemove(state)
    case 'restart':
      return createGame()
    default:
      return state
  }
}

// === Select Card (for targeting) ===

function selectCard(state: GameState, cardId: string): GameState {
  if (state.phase !== 'combat_player_turn') return state
  const card = state.hand.find(c => c.id === cardId)
  if (!card || !canPlayCard(state, card)) return state

  if (needsTarget(card)) {
    return { ...state, phase: 'targeting', selectedCardId: cardId }
  }

  // Non-targeted card: play immediately
  return playCard(state, card, undefined)
}

function targetEnemy(state: GameState, enemyId: string): GameState {
  if (state.phase !== 'targeting' || !state.selectedCardId) return state
  const card = state.hand.find(c => c.id === state.selectedCardId)
  if (!card) return { ...state, phase: 'combat_player_turn', selectedCardId: null }

  return playCard(state, card, enemyId)
}

function playCardDirect(state: GameState, cardId: string, targetId?: string): GameState {
  const card = state.hand.find(c => c.id === cardId)
  if (!card || !canPlayCard(state, card)) return state

  if (needsTarget(card) && !targetId) {
    return { ...state, phase: 'targeting', selectedCardId: cardId }
  }

  return playCard(state, card, targetId)
}

function playCard(state: GameState, card: CardInstance, targetId: string | undefined): GameState {
  const def = getDef(card)

  let newState: GameState = {
    ...state,
    phase: 'combat_player_turn',
    energy: state.energy - def.energyCost,
    hand: state.hand.filter(c => c.id !== card.id),
    discard: [...state.discard, card],
    selectedCardId: null,
  }

  // Resolve each effect
  for (const effect of def.effects) {
    newState = resolveEffect(newState, effect, targetId)
  }

  // Check for phase transitions (boss enrage)
  newState = {
    ...newState,
    enemies: newState.enemies.map(e => {
      const transitioned = checkPhaseTransition(e)
      return transitioned ?? e
    }),
  }

  // Check if all enemies dead
  if (newState.enemies.every(e => e.hp <= 0)) {
    const currentNode = newState.currentNodeId ? getNode(newState.map, newState.currentNodeId) : null
    const reward = currentNode
      ? getSandDollarReward(currentNode.difficulty, currentNode.type)
      : 0
    return {
      ...newState,
      phase: 'combat_victory',
      enemies: newState.enemies.filter(e => e.hp > 0),
      sandDollarsEarned: reward,
    }
  }

  // Remove dead enemies
  newState = { ...newState, enemies: newState.enemies.filter(e => e.hp > 0) }

  return newState
}

function resolveEffect(
  state: GameState,
  effect: import('./types').CardEffect,
  targetId: string | undefined
): GameState {
  switch (effect.kind) {
    case 'damage': {
      if (effect.target === 'all') {
        const enemies = state.enemies.map(e => {
          const dmg = calcDamage(effect.amount, state.playerStatus.strength, state.playerStatus.weak, e.status.vulnerable)
          const result = applyDamageToTarget(e.hp, e.block, dmg)
          return { ...e, hp: result.hp, block: result.block }
        })
        return { ...state, enemies }
      } else {
        // single target
        if (!targetId) return state
        const enemies = state.enemies.map(e => {
          if (e.id !== targetId) return e
          const dmg = calcDamage(effect.amount, state.playerStatus.strength, state.playerStatus.weak, e.status.vulnerable)
          const result = applyDamageToTarget(e.hp, e.block, dmg)
          return { ...e, hp: result.hp, block: result.block }
        })
        return { ...state, enemies }
      }
    }

    case 'multi_hit': {
      if (!targetId) return state
      let enemies = [...state.enemies]
      for (let i = 0; i < effect.hits; i++) {
        enemies = enemies.map(e => {
          if (e.id !== targetId || e.hp <= 0) return e
          const dmg = calcDamage(effect.perHit, state.playerStatus.strength, state.playerStatus.weak, e.status.vulnerable)
          const result = applyDamageToTarget(e.hp, e.block, dmg)
          return { ...e, hp: result.hp, block: result.block }
        })
      }
      return { ...state, enemies }
    }

    case 'block':
      return { ...state, playerBlock: state.playerBlock + effect.amount }

    case 'draw': {
      const { drawn, deck, discard } = drawCards(state.deck, state.discard, effect.count)
      return { ...state, hand: [...state.hand, ...drawn], deck, discard }
    }

    case 'apply_status': {
      if (effect.target === 'all') {
        const enemies = state.enemies.map(e => ({
          ...e,
          status: {
            ...e.status,
            [effect.status]: e.status[effect.status] + effect.amount,
          },
        }))
        return { ...state, enemies }
      } else {
        if (!targetId) return state
        const enemies = state.enemies.map(e => {
          if (e.id !== targetId) return e
          return {
            ...e,
            status: {
              ...e.status,
              [effect.status]: e.status[effect.status] + effect.amount,
            },
          }
        })
        return { ...state, enemies }
      }
    }

    case 'energy':
      return { ...state, energy: state.energy + effect.amount }

    default:
      return state
  }
}

// === End Turn ===

function endTurn(state: GameState): GameState {
  if (state.phase !== 'combat_player_turn') return state

  // Apply Seawall bonus block
  let block = state.playerBlock
  if (state.castleBonuses.blockPerTurn > 0) {
    block += state.castleBonuses.blockPerTurn
  }

  return {
    ...state,
    phase: 'combat_enemy_turn',
    selectedCardId: null,
    playerBlock: block,
  }
}

// === Enemy Turn ===

function resolveEnemyTurn(state: GameState): GameState {
  if (state.phase !== 'combat_enemy_turn') return state

  let playerHp = state.playerHp
  let playerBlock = state.playerBlock
  let playerStatus = { ...state.playerStatus }

  // Reset enemy blocks from previous turn
  let enemies = state.enemies.map(e => ({ ...e, block: 0 }))

  // Execute each enemy's intent
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i]
    const intent = enemy.intent

    switch (intent.type) {
      case 'attack': {
        const dmg = calcDamage(intent.damage, enemy.status.strength, enemy.status.weak, playerStatus.vulnerable)
        const result = applyDamageToTarget(playerHp, playerBlock, dmg)
        playerHp = result.hp
        playerBlock = result.block
        break
      }
      case 'multi_attack': {
        for (let h = 0; h < intent.hits; h++) {
          const dmg = calcDamage(intent.damage, enemy.status.strength, enemy.status.weak, playerStatus.vulnerable)
          const result = applyDamageToTarget(playerHp, playerBlock, dmg)
          playerHp = result.hp
          playerBlock = result.block
        }
        break
      }
      case 'defend': {
        enemies = enemies.map((e, idx) =>
          idx === i ? { ...e, block: e.block + intent.block } : e
        )
        break
      }
      case 'buff': {
        enemies = enemies.map((e, idx) =>
          idx === i
            ? { ...e, status: { ...e.status, [intent.status]: e.status[intent.status] + intent.amount } }
            : e
        )
        break
      }
      case 'debuff': {
        playerStatus = {
          ...playerStatus,
          [intent.status]: playerStatus[intent.status] + intent.amount,
        }
        break
      }
    }
  }

  // Check player dead
  if (playerHp <= 0) {
    return {
      ...state,
      phase: 'lose',
      playerHp: 0,
      playerBlock: 0,
      enemies,
    }
  }

  // Pick next intents and tick enemy statuses
  enemies = enemies.map(e => {
    const nextIntent = pickNextIntent(e)
    const nextIndex = getNextIntentIndex(e)
    const tickedStatus = tickStatuses(e.status)
    return { ...e, intent: nextIntent, intentIndex: nextIndex, status: tickedStatus }
  })

  // Tick player statuses
  playerStatus = tickStatuses(playerStatus)

  // Discard hand, draw new hand
  const discardPile = [...state.discard, ...state.hand]
  const drawCount = HAND_SIZE + state.castleBonuses.extraDraw
  const { drawn, deck, discard } = drawCards(state.deck, discardPile, drawCount)

  return {
    ...state,
    phase: 'combat_player_turn',
    playerHp,
    playerBlock: 0, // block resets each turn
    playerStatus,
    enemies,
    hand: drawn,
    deck,
    discard,
    energy: state.maxEnergy,
    selectedCardId: null,
    turnNumber: state.turnNumber + 1,
  }
}

// === Victory / Rewards ===

function continueFromVictory(state: GameState): GameState {
  if (state.phase !== 'combat_victory') return state

  // Check if this was the boss fight
  const currentNode = state.currentNodeId ? getNode(state.map, state.currentNodeId) : null
  if (currentNode?.type === 'boss') {
    return {
      ...state,
      phase: state.castleScore >= WIN_SCORE ? 'win' : 'lose',
    }
  }

  const reward = state.sandDollarsEarned
  const rewardOptions = generateRewardOptions(state.encounter)

  return {
    ...state,
    phase: 'card_reward',
    sandDollars: state.sandDollars + reward,
    rewardOptions,
    canRemoveCard: false,
  }
}

function pickReward(state: GameState, cardId: string): GameState {
  if (state.phase !== 'card_reward') return state
  const card = state.rewardOptions.find(c => c.id === cardId)
  if (!card) return state

  return {
    ...state,
    phase: 'map',
    deck: [...state.deck, card],
    rewardOptions: [],
  }
}

function skipReward(state: GameState): GameState {
  if (state.phase !== 'card_reward') return state
  return {
    ...state,
    phase: 'map',
    rewardOptions: [],
  }
}

function removeCard(state: GameState, cardId: string): GameState {
  if (!state.canRemoveCard) return state

  return {
    ...state,
    deck: state.deck.filter(c => c.id !== cardId),
    discard: state.discard.filter(c => c.id !== cardId),
    canRemoveCard: false,
  }
}

// === Castle Building ===

function buildCastlePart(state: GameState, part: CastlePartType): GameState {
  if (state.phase !== 'castle_build') return state

  const def = CASTLE_PART_DEFS[part]
  if (state.sandDollars < def.cost) return state
  if (state.castle.includes(part)) return state
  if (!hasPrereq(state.castle, part)) return state

  const newCastle = [...state.castle, part]
  const newBonuses = computeCastleBonuses(newCastle)
  const newScore = computeCastleScore(newCastle)

  // Foundation heals +3 max HP
  let newMaxHp = STARTING_HP + newBonuses.maxHpBonus
  let newHp = state.playerHp
  if (part === 'foundation') {
    newHp = Math.min(newMaxHp, newHp + 3)
  }

  return {
    ...state,
    sandDollars: state.sandDollars - def.cost,
    castle: newCastle,
    castleScore: newScore,
    castleBonuses: newBonuses,
    playerMaxHp: newMaxHp,
    playerHp: newHp,
  }
}

function rest(state: GameState): GameState {
  if (state.phase !== 'castle_build') return state
  if (state.sandDollars < REST_COST) return state

  return {
    ...state,
    sandDollars: state.sandDollars - REST_COST,
    playerHp: Math.min(state.playerMaxHp, state.playerHp + REST_HEAL),
  }
}

function continueFromBuild(state: GameState): GameState {
  if (state.phase !== 'castle_build') return state
  return { ...state, phase: 'map' }
}

// === Map Node Selection ===

function selectMapNode(state: GameState, nodeId: string): GameState {
  if (state.phase !== 'map') return state

  const node = getNode(state.map, nodeId)
  if (!node) return state

  const updatedMap = markNodeVisited(state.map, nodeId)
  const newState: GameState = {
    ...state,
    map: updatedMap,
    currentNodeId: nodeId,
    encounter: state.encounter + 1,
  }

  switch (node.type) {
    case 'combat':
    case 'elite':
    case 'boss': {
      const enemyNames = node.enemyNames || ['Sand Crab']
      const allCards = [...newState.deck, ...newState.discard, ...newState.hand]
      return initCombat({
        ...newState,
        deck: shuffle(allCards),
        discard: [],
        hand: [],
      }, enemyNames)
    }

    case 'rest': {
      const healAmount = Math.floor(newState.playerMaxHp * 0.3)
      return {
        ...newState,
        phase: 'map',
        playerHp: Math.min(newState.playerMaxHp, newState.playerHp + healAmount),
      }
    }

    case 'shop': {
      return { ...newState, phase: 'castle_build' }
    }

    case 'event': {
      const event = getRandomEvent(state.seenEventIds)
      return {
        ...newState,
        phase: 'event',
        currentEvent: event,
        eventResult: null,
        seenEventIds: [...state.seenEventIds, event.id],
      }
    }

    default:
      return newState
  }
}

// === Event Actions ===

function pickEventChoice(state: GameState, choiceIndex: number): GameState {
  if (state.phase !== 'event' || !state.currentEvent) return state
  const choice = state.currentEvent.choices[choiceIndex]
  if (!choice) return state

  const resolved = resolveEventOutcome(choice.outcome)
  let newState: GameState = { ...state, eventResult: resolved, phase: 'event_result' }

  // Apply outcome effects
  if (resolved.hpChange !== undefined) {
    if (resolved.hpChange === -1 && state.currentEvent.id === 'healing_spring') {
      // Special: percentage heal
      const heal = Math.floor(newState.playerMaxHp * 0.25)
      newState = { ...newState, playerHp: Math.min(newState.playerMaxHp, newState.playerHp + heal) }
    } else {
      newState = {
        ...newState,
        playerHp: Math.max(0, Math.min(newState.playerMaxHp, newState.playerHp + resolved.hpChange)),
      }
    }
  }

  if (resolved.maxHpChange !== undefined) {
    const newMax = newState.playerMaxHp + resolved.maxHpChange
    newState = { ...newState, playerMaxHp: newMax, playerHp: Math.min(newMax, newState.playerHp + resolved.maxHpChange) }
  }

  if (resolved.sandDollarsChange !== undefined) {
    // Check if player can afford
    if (resolved.sandDollarsChange < 0 && newState.sandDollars < Math.abs(resolved.sandDollarsChange)) {
      return state // Can't afford
    }
    newState = { ...newState, sandDollars: newState.sandDollars + resolved.sandDollarsChange }
  }

  if (resolved.removeCard) {
    newState = { ...newState, phase: 'event_remove_card' }
  }

  // Check if player died
  if (newState.playerHp <= 0) {
    return { ...newState, phase: 'lose', playerHp: 0 }
  }

  return newState
}

function continueFromEvent(state: GameState): GameState {
  if (state.phase !== 'event_result') return state
  return {
    ...state,
    phase: 'map',
    currentEvent: null,
    eventResult: null,
  }
}

function eventRemoveCard(state: GameState, cardId: string): GameState {
  if (state.phase !== 'event_remove_card') return state
  return {
    ...state,
    phase: 'event_result',
    deck: state.deck.filter(c => c.id !== cardId),
    discard: state.discard.filter(c => c.id !== cardId),
  }
}

function skipEventRemove(state: GameState): GameState {
  if (state.phase !== 'event_remove_card') return state
  return { ...state, phase: 'event_result' }
}

// === Exports for UI ===

export function computeScore(castle: CastlePartType[]): number {
  return computeCastleScore(castle)
}
