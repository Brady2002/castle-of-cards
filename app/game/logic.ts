import type { Card, Cell, GameState, Phase, PieceType } from './types'

export const COLS = 8
export const ROWS = 10
export const HAND_SIZE = 4
export const ENERGY_PER_TURN = 3
export const TURNS_PER_TIDE = 3
export const WIN_ROW = 7  // flag must reach this row or higher to win

const PIECE_INFO: Record<PieceType, { name: string; description: string; cost: number }> = {
  sand:  { name: 'Sand Scoop',  description: 'Pack sand onto the castle.',    cost: 1 },
  wall:  { name: 'Sand Wall',   description: 'Build a sturdy wall section.',   cost: 1 },
  tower: { name: 'Tower Block', description: 'Stack a tower piece. Costs 2.', cost: 2 },
  flag:  { name: 'Plant Flag',  description: `Win if placed at row ${WIN_ROW}+!`, cost: 1 },
}

export function makeCard(piece: PieceType, id: string): Card {
  return { id, piece, ...PIECE_INFO[piece] }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildStartingDeck(): Card[] {
  const layout: [PieceType, number][] = [
    ['sand', 8], ['wall', 4], ['tower', 3], ['flag', 2],
  ]
  const cards: Card[] = []
  let i = 0
  for (const [piece, count] of layout) {
    for (let j = 0; j < count; j++) {
      cards.push(makeCard(piece, `start-${piece}-${i++}`))
    }
  }
  return cards
}

function drawCards(deck: Card[], discard: Card[], count: number) {
  let d = [...deck]
  let disc = [...discard]
  const hand: Card[] = []
  for (let i = 0; i < count; i++) {
    if (d.length === 0) {
      d = shuffle(disc)
      disc = []
    }
    if (d.length > 0) hand.push(d.pop()!)
  }
  return { hand, deck: d, discard: disc }
}

export function createGame(): GameState {
  const shuffled = shuffle(buildStartingDeck())
  const { hand, deck, discard } = drawCards(shuffled, [], HAND_SIZE)
  return {
    phase: 'playing',
    grid: Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null)),
    hand,
    deck,
    discard,
    tideLevel: 0,
    turnsUntilTide: TURNS_PER_TIDE,
    energy: ENERGY_PER_TURN,
    turn: 1,
    rewardOptions: [],
  }
}

// Pieces need support below, or sit on the beach/tide-line.
// Tide line acts as new ground so players can always rebuild above the water.
export function canPlace(grid: Cell[][], row: number, col: number, tideLevel: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false
  if (row < tideLevel) return false
  if (grid[row][col] !== null) return false
  if (row === 0 || row === tideLevel) return true
  return grid[row - 1][col] !== null
}

export function playCard(state: GameState, cardId: string, row: number, col: number): GameState {
  const card = state.hand.find(c => c.id === cardId)
  if (!card) return state
  if (!canPlace(state.grid, row, col, state.tideLevel)) return state
  if (state.energy < card.cost) return state

  const grid = state.grid.map(r => [...r])
  grid[row][col] = card.piece

  const isWin = card.piece === 'flag' && row >= WIN_ROW

  return {
    ...state,
    phase: isWin ? 'win' : state.phase,
    grid,
    hand: state.hand.filter(c => c.id !== cardId),
    discard: [...state.discard, card],
    energy: state.energy - card.cost,
  }
}

function makeRewardOptions(): Card[] {
  const pool: PieceType[] = ['sand', 'sand', 'wall', 'wall', 'tower', 'tower', 'flag']
  return shuffle(pool).slice(0, 3).map((p, i) => makeCard(p, `reward-${p}-${Date.now()}-${i}`))
}

export function endTurn(state: GameState): GameState {
  if (state.phase !== 'playing') return state

  const newTurnsUntil = state.turnsUntilTide - 1
  const tideRises = newTurnsUntil <= 0
  const tideLevel = tideRises ? state.tideLevel + 1 : state.tideLevel

  // Lose when tide is so high there's no room to build to WIN_ROW
  const isLose = tideLevel > WIN_ROW

  const { hand, deck, discard } = drawCards(state.deck, state.discard, HAND_SIZE)

  let phase: Phase = 'playing'
  if (isLose) phase = 'lose'
  else if (tideRises) phase = 'reward'

  return {
    ...state,
    phase,
    tideLevel,
    turnsUntilTide: tideRises ? TURNS_PER_TIDE : newTurnsUntil,
    energy: ENERGY_PER_TURN,
    turn: state.turn + 1,
    hand,
    deck,
    discard,
    rewardOptions: tideRises && !isLose ? makeRewardOptions() : state.rewardOptions,
  }
}

export function pickReward(state: GameState, card: Card): GameState {
  return {
    ...state,
    phase: 'playing',
    deck: [...state.deck, card],
    rewardOptions: [],
  }
}
