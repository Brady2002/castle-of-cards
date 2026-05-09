'use client'

import { useEffect, useReducer, useState, type CSSProperties } from 'react'
import { gameReducer } from './logic'
import type { GameState } from './types'
import Hand from './Hand'
import CombatHeader from './CombatHeader'
import EnemyView from './EnemyView'
import PlayerView from './PlayerView'
import VictoryModal from './VictoryModal'
import RewardModal from './RewardModal'
import CastleBuildScreen from './CastleBuildScreen'
import GameOverScreen from './GameOverScreen'
import MapScreen from './MapScreen'
import EventScreen from './EventScreen'
import PilePeekModal from './PilePeekModal'
import MapPeekModal from './MapPeekModal'

type Peek = null | 'draw' | 'discard' | 'map'

export default function Game() {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState)
  const [initialized, setInitialized] = useState(false)
  const [peek, setPeek] = useState<Peek>(null)

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
    <div className="game-bg flex flex-col px-4 pt-5" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="w-full flex justify-center">
        <CombatHeader
          encounter={state.encounter}
          playerHp={state.playerHp}
          playerMaxHp={state.playerMaxHp}
          sandDollars={state.sandDollars}
          castleScore={state.castleScore}
          nodeType={state.currentNodeId ? state.map.nodes.find(n => n.id === state.currentNodeId)?.type : undefined}
          onOpenMap={() => setPeek('map')}
          turnNumber={state.turnNumber}
        />
      </div>

      {/* Battlefield — fills available vertical space, player on left, enemies on right */}
      <div className="battle-ground w-full">
        <BattleScenery />
        <div className="relative z-[1] w-full max-w-7xl mx-auto px-2 flex items-end justify-between gap-6">
          {/* Player side */}
          <div className="flex items-end shrink-0">
            <PlayerView state={state} />
          </div>

          {/* Enemy side */}
          <div className="flex items-end gap-5 flex-wrap justify-end max-w-[60%]">
            {state.enemies.map(enemy => (
              <EnemyView
                key={enemy.id}
                enemy={enemy}
                targetable={isTargeting}
                onClick={isTargeting ? () => dispatch({ type: 'target_enemy', enemyId: enemy.id }) : undefined}
              />
            ))}
          </div>
        </div>

        {/* Banners — overlay so they don't push content */}
        {(isTargeting || isEnemyTurn) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            {isTargeting && (
              <div className="banner banner-targeting flex items-center gap-4">
                <span className="text-sm">Click an enemy to target</span>
                <button
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold border border-red-300 cursor-pointer"
                  onClick={() => dispatch({ type: 'cancel_target' })}
                >
                  Cancel
                </button>
              </div>
            )}
            {isEnemyTurn && (
              <div className="banner banner-enemy-turn animate-pulse text-sm">
                Enemy Turn...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hand */}
      <Hand
        state={state}
        dispatch={dispatch}
        onPeekDraw={() => setPeek('draw')}
        onPeekDiscard={() => setPeek('discard')}
      />

      {/* Peek modals */}
      {peek === 'draw' && (
        <PilePeekModal
          title="Draw Pile"
          cards={[...state.deck].sort((a, b) => a.defName.localeCompare(b.defName))}
          shuffled
          onClose={() => setPeek(null)}
        />
      )}
      {peek === 'discard' && (
        <PilePeekModal
          title="Discard Pile"
          cards={state.discard}
          onClose={() => setPeek(null)}
        />
      )}
      {peek === 'map' && (
        <MapPeekModal state={state} onClose={() => setPeek(null)} />
      )}

      {/* Victory modal */}
      {state.phase === 'combat_victory' && (
        <VictoryModal sandDollarsEarned={state.sandDollarsEarned} dispatch={dispatch} />
      )}

      {/* Reward modal */}
      {state.phase === 'card_reward' && (
        <RewardModal state={state} dispatch={dispatch} />
      )}

      {/* Debug: instakill all enemies */}
      <button
        className="debug-button fixed top-3 left-3 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
        onClick={() => dispatch({ type: 'debug_kill_all' })}
        title="Debug: instakill all enemies"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#fca5a5',
          border: '1px dashed rgba(252, 165, 165, 0.6)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.6px',
          opacity: 0.65,
          transition: 'opacity 0.12s ease, background 0.12s ease, transform 0.12s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.opacity = '1'
          el.style.background = 'rgba(127, 29, 29, 0.92)'
          el.style.color = '#fee2e2'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.opacity = '0.65'
          el.style.background = 'rgba(15, 23, 42, 0.85)'
          el.style.color = '#fca5a5'
          el.style.transform = 'translateY(0)'
        }}
      >
        <span aria-hidden>☠</span>
        <span>KILL ALL</span>
      </button>
    </div>
  )
}

// Atmospheric beach decorations — sits behind the player & enemies.
// Clouds drift in the sky, gulls glide near the horizon, a faint shore
// line gives the sand a sense of depth, and a few seashells sit on the beach.
function BattleScenery() {
  return (
    <div className="scene-decor" aria-hidden>
      {/* Clouds */}
      <Cloud className="cloud" style={{ top: '8%', left: '12%' }} width={120} />
      <Cloud className="cloud cloud-2" style={{ top: '4%', left: '58%' }} width={160} />
      <Cloud className="cloud cloud-3" style={{ top: '14%', left: '78%' }} width={90} />

      {/* Distant gulls */}
      <Gull className="gull" style={{ top: '22%', left: '32%' }} />
      <Gull className="gull gull-2" style={{ top: '18%', left: '66%' }} flip />

      {/* Faint horizon shore line — implies a distant ocean edge */}
      <div className="shore-wave" style={{ top: '40%' }} />

      {/* Beach trinkets scattered on the sand */}
      <Shell className="beach-trinket" style={{ bottom: '12%', left: '34%' }} />
      <Starfish className="beach-trinket" style={{ bottom: '8%', left: '70%' }} />
      <Shell className="beach-trinket" style={{ bottom: '6%', left: '20%' }} small />
    </div>
  )
}

type DecorProps = { className?: string; style?: CSSProperties }

function Cloud({ className, style, width = 120 }: DecorProps & { width?: number }) {
  return (
    <svg className={className} style={style} width={width} height={width * 0.45} viewBox="0 0 120 54" fill="none">
      <ellipse cx="30" cy="34" rx="22" ry="14" fill="#fff" />
      <ellipse cx="58" cy="26" rx="26" ry="18" fill="#fff" />
      <ellipse cx="86" cy="34" rx="22" ry="14" fill="#fff" />
      <ellipse cx="60" cy="40" rx="44" ry="10" fill="#fff" />
    </svg>
  )
}

function Gull({ className, style, flip }: DecorProps & { flip?: boolean }) {
  return (
    <svg
      className={className}
      style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }}
      width="38"
      height="14"
      viewBox="0 0 38 14"
      fill="none"
    >
      <path d="M2 10 Q9 2 18 10 Q27 2 36 10" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Shell({ className, style, small }: DecorProps & { small?: boolean }) {
  const s = small ? 22 : 30
  return (
    <svg className={className} style={style} width={s} height={s * 0.85} viewBox="0 0 30 26" fill="none">
      <path d="M15 2 Q28 14 25 24 L5 24 Q2 14 15 2 Z" fill="#f9c0a5" stroke="#b87355" strokeWidth="1.2" />
      <path d="M15 4 L15 22 M11 6 L9 22 M19 6 L21 22 M7 10 L5 22 M23 10 L25 22"
        stroke="#b87355" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

function Starfish({ className, style }: DecorProps) {
  return (
    <svg className={className} style={style} width="34" height="34" viewBox="0 0 34 34" fill="none">
      <path d="M17 3 L21 13 L31 13 L23 19 L26 29 L17 23 L8 29 L11 19 L3 13 L13 13 Z"
        fill="#ff8a5b" stroke="#c0392b" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="14" cy="16" r="0.9" fill="#7f1d1d" />
      <circle cx="20" cy="16" r="0.9" fill="#7f1d1d" />
      <circle cx="17" cy="20" r="0.9" fill="#7f1d1d" />
    </svg>
  )
}
