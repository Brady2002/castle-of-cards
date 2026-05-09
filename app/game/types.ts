export type PieceType = 'sand' | 'wall' | 'tower' | 'flag'

export type Cell = PieceType | null

export type Card = {
  id: string
  piece: PieceType
  name: string
  description: string
  cost: number
}

export type Phase = 'playing' | 'reward' | 'win' | 'lose'

export type GameState = {
  phase: Phase
  grid: Cell[][]       // grid[row][col], row 0 = beach (bottom of screen)
  hand: Card[]
  deck: Card[]
  discard: Card[]
  tideLevel: number    // rows submerged from bottom (0 = dry)
  turnsUntilTide: number
  energy: number
  turn: number
  rewardOptions: Card[]
}
