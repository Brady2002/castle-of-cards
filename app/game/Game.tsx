'use client'

import { useState } from 'react'
import { createGame, endTurn, pickReward, playCard } from './logic'
import { ENERGY_PER_TURN } from './logic'
import type { Card, GameState } from './types'
import Grid from './Grid'
import Hand from './Hand'
import RewardModal from './RewardModal'

export default function Game() {
  const [state, setState] = useState<GameState>(createGame)
  const [dragging, setDragging] = useState<Card | null>(null)

  function handleDragStart(card: Card) {
    setDragging(card)
  }

  function handleDragEnd() {
    setDragging(null)
  }

  function handleDrop(row: number, col: number) {
    if (!dragging) return
    setState(s => playCard(s, dragging.id, row, col))
    setDragging(null)
  }

  function handleEndTurn() {
    setState(s => endTurn(s))
  }

  function handlePickReward(card: Card) {
    setState(s => pickReward(s, card))
  }

  function handleRestart() {
    setState(createGame())
    setDragging(null)
  }

  if (state.phase === 'win') {
    return (
      <div className="min-h-screen bg-sky-300 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-sm">
          <div className="text-7xl mb-4">🚩</div>
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Your Flag Stands!</h1>
          <p className="text-gray-600 mb-8">
            You built your sandcastle high enough before the tide came in.
          </p>
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  if (state.phase === 'lose') {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-sm">
          <div className="text-7xl mb-4">🌊</div>
          <h1 className="text-4xl font-bold text-blue-800 mb-2">The Tide Won!</h1>
          <p className="text-gray-600 mb-8">
            The sea swallowed your sandcastle. Better luck next time!
          </p>
          <button
            onClick={handleRestart}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const tideWarning = state.turnsUntilTide === 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-amber-100 flex flex-col items-center py-6 px-4 gap-4">

      {/* Header bar */}
      <div className="w-full max-w-3xl">
        <div className="bg-amber-900 text-white rounded-2xl px-6 py-3 flex items-center justify-between shadow-lg">
          <h1 className="text-xl font-bold">🏖️ Sandcastle</h1>
          <div className="flex gap-5 text-sm font-medium">
            <span>Turn {state.turn}</span>
            <span className={tideWarning ? 'text-red-300 font-bold' : 'text-amber-200'}>
              {tideWarning ? '⚠️ Tide rising!' : `Tide in ${state.turnsUntilTide}`}
            </span>
            <span>🌊 Level {state.tideLevel}</span>
          </div>
        </div>
      </div>

      {/* Main area: grid + sidebar */}
      <div className="flex gap-4 items-start">
        <Grid
          grid={state.grid}
          tideLevel={state.tideLevel}
          dragging={dragging}
          onDrop={handleDrop}
        />

        {/* Sidebar */}
        <div className="flex flex-col gap-3 w-36 text-sm">
          <div className="bg-white/80 rounded-xl p-3 shadow">
            <div className="font-bold text-amber-800 mb-2">Energy</div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: ENERGY_PER_TURN }, (_, i) => (
                <span key={i} className={i < state.energy ? 'text-yellow-400' : 'text-gray-200'}>
                  ⚡
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3 shadow">
            <div className="font-bold text-amber-800 mb-1">Deck</div>
            <div className="text-gray-600">{state.deck.length} left</div>
            <div className="text-gray-400 text-xs">{state.discard.length} discarded</div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 shadow">
            <div className="font-bold text-amber-800 mb-1">🎯 Goal</div>
            <div className="text-xs text-gray-600">Plant 🚩 at row 7 or higher</div>
          </div>

          <div className="bg-white/80 rounded-xl p-3 shadow text-xs text-gray-500">
            <div className="font-semibold text-gray-700 mb-1">How to play</div>
            <p>Drag cards onto the grid to build. Pieces need support below them.</p>
          </div>
        </div>
      </div>

      {/* Hand */}
      <Hand
        cards={state.hand}
        energy={state.energy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onEndTurn={handleEndTurn}
      />

      {/* Reward modal (shown after each tide rise) */}
      {state.phase === 'reward' && (
        <RewardModal options={state.rewardOptions} onPick={handlePickReward} />
      )}
    </div>
  )
}
