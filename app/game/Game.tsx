'use client'

import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react'
import { gameReducer, canPlayCard } from './logic'
import { getCardTargetMode, getDef, type CardTargetMode } from './cards'
import type { CardInstance, GameState } from './types'
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

type ActingKind = 'attack' | 'defend' | 'buff' | 'debuff'

// CSS lift amount for a dragged card. Must match `.game-card.dragging` in globals.css.
const CARD_LIFT = 220

function playSfx(src: string, volume = 0.7) {
  try {
    const a = new Audio(src)
    a.volume = volume
    void a.play().catch(() => {})
  } catch {}
}

function playCardSfx(card: CardInstance) {
  const def = getDef(card)
  const hasAttack = def.effects.some(e => e.kind === 'damage' || e.kind === 'multi_hit' || e.kind === 'damage_eq_block')
  const hasBlock = def.effects.some(e => e.kind === 'block')
  if (hasAttack) playSfx('/audio/throw.wav')
  if (hasBlock) playSfx('/audio/sand.wav')
}

// Drag state: where the dragged card is anchored, where the cursor is now,
// and which target (if any) is currently being aimed at.
type DragState = {
  cardId: string
  cardCenterX: number  // visual center of the dragged card after lifting
  cardCenterY: number
  mouseX: number
  mouseY: number
  mode: CardTargetMode
  hoveredEnemyId: string | null
  handTopY: number
}

export default function Game() {
  const [state, dispatch] = useReducer(gameReducer, null as unknown as GameState)
  const [initialized, setInitialized] = useState(false)
  const [peek, setPeek] = useState<Peek>(null)

  // Drag state lives in useState (for re-renders) AND a ref (so global mouse
  // listeners can read the latest value without re-attaching every frame).
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const stateRef = useRef<GameState | null>(null)
  stateRef.current = state

  function updateDrag(next: DragState | null) {
    dragRef.current = next
    setDrag(next)
  }

  useEffect(() => {
    dispatch({ type: 'restart' })
    setInitialized(true)
  }, [])

  // Enemy turn — animate each enemy acting on a stagger, then resolve.
  // Damage still applies in a single batch at the end of resolve_enemy_turn,
  // but visually each enemy plays a lunge/pulse keyed to its intent type so
  // you can see who's doing what.
  const [actingEnemies, setActingEnemies] = useState<Map<string, ActingKind>>(new Map())
  useEffect(() => {
    if (!state || state.phase !== 'combat_enemy_turn') return
    const ENEMY_ANIM_MS = 420
    const STAGGER_MS = 280
    const list = state.enemies
    const timers: number[] = []
    list.forEach((e, i) => {
      const intent = e.intent.type
      const kind: ActingKind =
        intent === 'attack' || intent === 'multi_attack' ? 'attack' :
        intent === 'defend' ? 'defend' :
        intent === 'buff' ? 'buff' :
        'debuff'
      timers.push(window.setTimeout(() => {
        setActingEnemies(prev => {
          const next = new Map(prev)
          next.set(e.id, kind)
          return next
        })
        if (kind === 'attack') playSfx('/audio/throw.wav', 0.45)
      }, i * STAGGER_MS))
      timers.push(window.setTimeout(() => {
        setActingEnemies(prev => {
          const next = new Map(prev)
          next.delete(e.id)
          return next
        })
      }, i * STAGGER_MS + ENEMY_ANIM_MS))
    })
    const total = (list.length - 1) * STAGGER_MS + ENEMY_ANIM_MS
    timers.push(window.setTimeout(() => {
      dispatch({ type: 'resolve_enemy_turn' })
    }, total + 120))
    return () => {
      timers.forEach(t => window.clearTimeout(t))
      setActingEnemies(new Map())
    }
  }, [state?.phase])

  // Ambient waves — loop forever at low volume, started on first user interaction
  // (autoplay-blocked browsers won't let it start before then).
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    const a = new Audio('/audio/waves.wav')
    a.loop = true
    a.volume = 0.06
    ambientAudioRef.current = a
    const tryPlay = () => { void a.play().catch(() => {}) }
    tryPlay()
    // Retry on first interaction in case autoplay was blocked
    const onInteract = () => { tryPlay() }
    window.addEventListener('pointerdown', onInteract, { once: true })
    window.addEventListener('keydown', onInteract, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onInteract)
      window.removeEventListener('keydown', onInteract)
      a.pause()
      ambientAudioRef.current = null
    }
  }, [])

  // Card draw — fire card.wav and animate each new card into hand on a stagger
  // so a 5-card draw fans out one card at a time. `drawDelays` maps cardId to
  // its animation-delay in ms; entries are cleared after the animation finishes
  // so the .drawing class doesn't linger and fight hover transforms.
  const STAGGER_MS = 90
  const ANIM_MS = 420
  const prevHandIdsRef = useRef<Set<string>>(new Set())
  const [drawDelays, setDrawDelays] = useState<Map<string, number>>(new Map())
  useEffect(() => {
    if (!state) return
    const newIds: string[] = []
    const currentIds = new Set<string>()
    for (const card of state.hand) {
      currentIds.add(card.id)
      if (!prevHandIdsRef.current.has(card.id)) newIds.push(card.id)
    }
    prevHandIdsRef.current = currentIds
    if (newIds.length === 0) return

    setDrawDelays(prev => {
      const next = new Map(prev)
      newIds.forEach((id, i) => next.set(id, i * STAGGER_MS))
      return next
    })
    const sfxTimers = newIds.map((_, i) =>
      window.setTimeout(() => playSfx('/audio/card.wav', 0.45), i * STAGGER_MS)
    )
    const clearTimer = window.setTimeout(() => {
      setDrawDelays(prev => {
        const next = new Map(prev)
        newIds.forEach(id => next.delete(id))
        return next
      })
    }, (newIds.length - 1) * STAGGER_MS + ANIM_MS + 60)
    return () => {
      sfxTimers.forEach(t => window.clearTimeout(t))
      window.clearTimeout(clearTimer)
    }
  }, [state?.hand])

  // Combat music — loop LowTide while in active combat, fade out when leaving.
  // Browsers block autoplay until a user interaction; the first play() may reject
  // silently (caught below), and subsequent phase changes after the player has
  // clicked anything will succeed.
  const combatAudioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    const TARGET_VOLUME = 0.5
    const FADE_MS = 2500
    const FADE_STEPS = 50
    if (!combatAudioRef.current) {
      const a = new Audio('/audio/LowTide.wav')
      a.loop = true
      a.volume = TARGET_VOLUME
      combatAudioRef.current = a
    }
    const audio = combatAudioRef.current
    const inCombat =
      state?.phase === 'combat_player_turn' ||
      state?.phase === 'combat_enemy_turn' ||
      state?.phase === 'targeting'
    // Cancel any in-flight fade so re-entering combat snaps back to full volume
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
    if (inCombat) {
      audio.volume = TARGET_VOLUME
      void audio.play().catch(() => {})
      return
    }
    if (audio.paused || audio.volume <= 0) {
      audio.pause()
      audio.volume = TARGET_VOLUME
      return
    }
    const stepDelta = audio.volume / FADE_STEPS
    fadeIntervalRef.current = setInterval(() => {
      const a = combatAudioRef.current
      if (!a) return
      const next = Math.max(0, a.volume - stepDelta)
      a.volume = next
      if (next <= 0) {
        a.pause()
        a.volume = TARGET_VOLUME
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
      }
    }, FADE_MS / FADE_STEPS)
  }, [state?.phase])

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
        fadeIntervalRef.current = null
      }
      combatAudioRef.current?.pause()
      combatAudioRef.current = null
    }
  }, [])

  // Cancel an active drag if the player's turn ends out from under us
  // (enemy turn, victory, etc.) — otherwise the arrow would linger.
  useEffect(() => {
    if (!drag) return
    if (state?.phase !== 'combat_player_turn' && state?.phase !== 'targeting') {
      updateDrag(null)
    }
  }, [state?.phase, drag])

  // Global mouse listeners — attached once, read live state via refs.
  useEffect(() => {
    function findEnemyAt(x: number, y: number): string | null {
      const els = document.elementsFromPoint(x, y)
      for (const el of els) {
        const id = (el as HTMLElement).getAttribute?.('data-enemy-id')
        if (id) return id
      }
      return null
    }

    function onMove(e: MouseEvent) {
      const d = dragRef.current
      if (!d) return
      const hoveredEnemyId = d.mode === 'enemy_single' ? findEnemyAt(e.clientX, e.clientY) : null
      updateDrag({ ...d, mouseX: e.clientX, mouseY: e.clientY, hoveredEnemyId })
    }

    function onUp(e: MouseEvent) {
      const d = dragRef.current
      if (!d) return
      const s = stateRef.current
      if (!s) { updateDrag(null); return }
      const card = s.hand.find(c => c.id === d.cardId)
      if (card && canPlayCard(s, card)) {
        if (d.mode === 'enemy_single') {
          const id = findEnemyAt(e.clientX, e.clientY)
          if (id) {
            playCardSfx(card)
            dispatch({ type: 'play_card', cardId: d.cardId, targetId: id })
          }
        } else if (e.clientY < d.handTopY) {
          // AOE / self: any release above the hand plays the card.
          playCardSfx(card)
          dispatch({ type: 'play_card', cardId: d.cardId })
        }
      }
      updateDrag(null)
    }

    function onCancel() { updateDrag(null) }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('blur', onCancel)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('blur', onCancel)
    }
  }, [])

  // Suppress text-selection / change cursor while a drag is active.
  useEffect(() => {
    if (drag) {
      document.body.classList.add('dragging-card')
      return () => document.body.classList.remove('dragging-card')
    }
  }, [drag])

  function startDrag(cardId: string, e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    if (!state) return
    const card = state.hand.find(c => c.id === cardId)
    if (!card || !canPlayCard(state, card)) return
    playSfx('/audio/card.wav', 0.5)

    const cardEl = e.currentTarget
    const rect = cardEl.getBoundingClientRect()
    const cardCenterX = rect.left + rect.width / 2
    const cardCenterY = rect.top + rect.height / 2 - CARD_LIFT

    const handEl = document.querySelector('.hand-tray') as HTMLElement | null
    const handTopY = handEl?.getBoundingClientRect().top ?? window.innerHeight - 280

    updateDrag({
      cardId,
      cardCenterX,
      cardCenterY,
      mouseX: e.clientX,
      mouseY: e.clientY,
      mode: getCardTargetMode(card),
      hoveredEnemyId: null,
      handTopY,
    })
    e.preventDefault()
  }

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
  const isEnemyTurn = state.phase === 'combat_enemy_turn'

  // Highlights derived from the drag mode.
  const playerHighlighted = !!drag && drag.mode === 'self'
  const isEnemyHighlighted = (enemyId: string): boolean => {
    if (!drag) return false
    if (drag.mode === 'enemy_all') return true
    if (drag.mode === 'enemy_single') return drag.hoveredEnemyId === enemyId
    return false
  }

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
            <PlayerView state={state} highlighted={playerHighlighted} />
          </div>

          {/* Enemy side */}
          <div className="flex items-end gap-5 flex-wrap justify-end max-w-[60%]">
            {state.enemies.map(enemy => (
              <EnemyView
                key={enemy.id}
                enemy={enemy}
                targetable={false}
                highlighted={isEnemyHighlighted(enemy.id)}
                acting={actingEnemies.get(enemy.id)}
              />
            ))}
          </div>
        </div>

        {/* Banners — overlay so they don't push content */}
        {isEnemyTurn && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="banner banner-enemy-turn animate-pulse text-sm">
              Enemy Turn...
            </div>
          </div>
        )}
      </div>

      {/* Hand */}
      <Hand
        state={state}
        dispatch={dispatch}
        onPeekDraw={() => setPeek('draw')}
        onPeekDiscard={() => setPeek('discard')}
        draggingCardId={drag?.cardId ?? null}
        onCardMouseDown={startDrag}
        drawDelays={drawDelays}
      />

      {/* Drag arrow overlay */}
      {drag && <DragArrow drag={drag} />}

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

// Curved arrow from the lifted card to the cursor — StS-style.
// Color/style follows the card's target mode so the player can read what the
// card will do at a glance.
function DragArrow({ drag }: { drag: DragState }) {
  const sx = drag.cardCenterX
  const sy = drag.cardCenterY
  const ex = drag.mouseX
  const ey = drag.mouseY
  // Pull the control point upward so the arc curves up. The further the
  // cursor moves, the more lateral arc it gets.
  const midX = (sx + ex) / 2
  const midY = Math.min(sy, ey) - 60
  const path = `M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`

  // Tangent at the end of the bezier: direction = 2*(P2 - P1)
  const dirX = ex - midX
  const dirY = ey - midY
  const angle = Math.atan2(dirY, dirX) * 180 / Math.PI

  const color =
    drag.mode === 'enemy_single' ? '#ef4444' :
    drag.mode === 'enemy_all' ? '#f59e0b' :
    '#3b82f6'
  const glow =
    drag.mode === 'enemy_single' ? 'rgba(239, 68, 68, 0.7)' :
    drag.mode === 'enemy_all' ? 'rgba(245, 158, 11, 0.7)' :
    'rgba(59, 130, 246, 0.7)'

  // Inline style + explicit width/height attributes so the SVG's coordinate
  // system maps 1:1 to viewport pixels regardless of any ancestor styling.
  // High z-index keeps it above every gameplay layer (banners, badges, etc.).
  return (
    <svg
      className="drag-arrow-overlay"
      width="100%"
      height="100%"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'visible',
      }}
      aria-hidden
    >
      {/* outer glow stroke */}
      <path d={path} fill="none" stroke={glow} strokeWidth={20} strokeLinecap="round" opacity={0.55} />
      {/* main beam */}
      <path d={path} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
      {/* origin marker on the card */}
      <circle cx={sx} cy={sy} r={11} fill={color} opacity={0.95} />
      <circle cx={sx} cy={sy} r={5} fill="#fff" />
      {/* arrowhead at the cursor */}
      <g transform={`translate(${ex} ${ey}) rotate(${angle})`}>
        <polygon
          points="0,0 -22,-12 -16,0 -22,12"
          fill={color}
          stroke="#fff"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>
    </svg>
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
