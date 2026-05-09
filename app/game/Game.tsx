'use client'

import { useEffect, useReducer, useState } from 'react'
import { createGame, gameReducer } from './logic'
import type { GameState } from './types'
import Hand from './Hand'
import CombatHeader from './CombatHeader'
import PlayerStatus from './PlayerStatus'
import EnemyView from './EnemyView'
import VictoryModal from './VictoryModal'
import RewardModal from './RewardModal'
import CastleBuildScreen from './CastleBuildScreen'
import GameOverScreen from './GameOverScreen'
import MapScreen from './MapScreen'
import EventScreen from './EventScreen'

export default function Game() {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    dispatch({ type: 'restart' })
    setInitialized(true)
  }, [])

  // Enemy turn auto-resolve with delay
  useEffect(() => {
    if (!state || state.phase !== 'combat_enemy_turn') return
    const timer = setTimeout(() => {
      dispatch({ type: 'resolve_enemy_turn' })
    }, 800)
    return () => clearTimeout(timer)
  }, [state?.phase])

  if (!initialized || !state) {
    return <div className="min-h-screen game-bg" />
  }

  // Full-screen phases
  if (state.phase === 'win' || state.phase === 'lose') {
    return <GameOverScreen state={state} dispatch={dispatch} />
  }

  if (state.phase === 'map') {
    return <MapScreen state={state} dispatch={dispatch} />
  }

  if (state.phase === 'event' || state.phase === 'event_result' || state.phase === 'event_remove_card') {
    return <EventScreen state={state} dispatch={dispatch} />
  }

  if (state.phase === 'castle_build') {
    return <CastleBuildScreen state={state} dispatch={dispatch} />
  }

  // Combat phases
  const isTargeting = state.phase === 'targeting'
  const isEnemyTurn = state.phase === 'combat_enemy_turn'

  return (
    <div className="min-h-screen game-bg flex flex-col items-center px-4 pt-4 pb-0 gap-3">
      {/* Header */}
      <CombatHeader
        encounter={state.encounter}
        playerHp={state.playerHp}
        playerMaxHp={state.playerMaxHp}
        sandDollars={state.sandDollars}
        castleScore={state.castleScore}
        nodeType={state.currentNodeId ? state.map.nodes.find(n => n.id === state.currentNodeId)?.type : undefined}
      />

      {/* Enemy area */}
      <div className="flex gap-4 justify-center items-end w-full max-w-5xl py-4">
        {state.enemies.map(enemy => (
          <EnemyView
            key={enemy.id}
            enemy={enemy}
            targetable={isTargeting}
            onClick={isTargeting ? () => dispatch({ type: 'target_enemy', enemyId: enemy.id }) : undefined}
          />
        ))}
      </div>

      {/* Targeting banner */}
      {isTargeting && (
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between px-4 py-2 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '2px solid #fca5a5' }}>
            <span className="text-red-700 font-bold text-sm">
              Click an enemy to target
            </span>
            <button
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold border border-red-300 cursor-pointer"
              onClick={() => dispatch({ type: 'cancel_target' })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Enemy turn indicator */}
      {isEnemyTurn && (
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-center px-4 py-2 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b' }}>
            <span className="text-amber-800 font-bold text-sm animate-pulse">
              Enemy Turn...
            </span>
          </div>
        </div>
      )}

      {/* Player status */}
      <div className="w-full max-w-5xl">
        <PlayerStatus state={state} />
      </div>

      {/* Hand */}
      <div className="mt-auto w-full flex justify-center">
        <Hand state={state} dispatch={dispatch} />
      </div>

      {/* Victory modal */}
      {state.phase === 'combat_victory' && (
        <VictoryModal sandDollarsEarned={state.sandDollarsEarned} dispatch={dispatch} />
      )}

      {/* Reward modal */}
      {state.phase === 'card_reward' && (
        <RewardModal state={state} dispatch={dispatch} />
      )}
    </div>
  )
}
