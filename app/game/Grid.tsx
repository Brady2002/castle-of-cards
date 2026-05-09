'use client'

import { canPlace, COLS, ROWS, WIN_ROW } from './logic'
import { PIECE_EMOJI } from './Card'
import type { Card, Cell } from './types'

const PIECE_BG: Record<string, string> = {
  sand:  'bg-amber-300',
  wall:  'bg-amber-600',
  tower: 'bg-stone-500',
  flag:  'bg-red-500',
}

type Props = {
  grid: Cell[][]
  tideLevel: number
  dragging: Card | null
  onDrop: (row: number, col: number) => void
}

export default function Grid({ grid, tideLevel, dragging, onDrop }: Props) {
  return (
    <div className="flex gap-2">
      {/* Row labels on left side */}
      <div className="flex flex-col justify-around pb-0.5">
        {Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i).map(row => (
          <div
            key={row}
            className={`
              h-14 flex items-center justify-end pr-1 text-xs font-mono font-bold w-6
              ${row === WIN_ROW ? 'text-yellow-500' : 'text-gray-400'}
            `}
          >
            {row === WIN_ROW ? '🎯' : row}
          </div>
        ))}
      </div>

      {/* The grid itself */}
      <div className="border-4 border-amber-800 rounded-xl overflow-hidden shadow-2xl">
        {Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i).map(row => (
          <div key={row} className="flex">
            {Array.from({ length: COLS }, (_, col) => {
              const cell = grid[row][col]
              const submerged = row < tideLevel
              const isValidDrop = dragging !== null && canPlace(grid, row, col, tideLevel)

              let bg = 'bg-amber-50'
              if (submerged) bg = 'bg-blue-700'
              else if (cell) bg = PIECE_BG[cell]
              if (isValidDrop) bg = 'bg-green-200'

              let border = 'border-amber-200/60'
              if (submerged) border = 'border-blue-600'
              if (isValidDrop) border = 'border-green-500 border-2'

              return (
                <div
                  key={col}
                  className={`w-14 h-14 border flex items-center justify-center text-2xl transition-colors duration-75 ${bg} ${border}`}
                  onDragOver={isValidDrop ? e => e.preventDefault() : undefined}
                  onDrop={isValidDrop ? () => onDrop(row, col) : undefined}
                >
                  {submerged && '🌊'}
                  {!submerged && cell && PIECE_EMOJI[cell]}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
