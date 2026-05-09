'use client'

import type { GameState } from './types'
import type { GameAction } from './logic'
import { WIN_SCORE } from './logic'
import SandDollarIcon from './SandDollarIcon'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export default function GameOverScreen({ state, dispatch }: Props) {
  const isWin = state.phase === 'win'
  const scorePct = Math.min(100, (state.castleScore / WIN_SCORE) * 100)

  return (
    <div className={`gameover-screen ${isWin ? 'gameover-win' : 'gameover-lose'}`}>
      {isWin ? <SunBackdrop /> : <StormBackdrop />}

      <div className="gameover-card">
        {isWin && (
          <>
            <Sparkle style={{ top: '6%', left: '10%' }} delay="0s" />
            <Sparkle style={{ top: '14%', right: '12%' }} delay="0.6s" size={14} />
            <Sparkle style={{ top: '46%', left: '6%' }} delay="1.1s" size={11} />
            <Sparkle style={{ top: '38%', right: '8%' }} delay="0.3s" />
            <Sparkle style={{ bottom: '10%', left: '20%' }} delay="1.5s" size={10} />
            <Sparkle style={{ bottom: '14%', right: '22%' }} delay="0.9s" size={13} />
          </>
        )}

        <div className="gameover-hero">
          {isWin ? <CastleTrophy /> : <SunkenCastle />}
        </div>

        <h1 className="gameover-title">
          {isWin ? 'Your Castle Stands!' : 'Washed Away'}
        </h1>

        <p className="gameover-subtitle">
          {isWin
            ? 'The Tide King is vanquished — the shore is yours.'
            : state.playerHp <= 0
            ? 'The beach creatures overwhelmed you.'
            : `Your castle scored only ${state.castleScore} of ${WIN_SCORE} — try again, builder.`}
        </p>

        <div className="gameover-hero-stat">
          <div className="gameover-hero-stat-label">Castle Score</div>
          <div className="gameover-hero-stat-value">
            <span className="gameover-hero-stat-num">{state.castleScore}</span>
            <span className="gameover-hero-stat-of">/ {WIN_SCORE}</span>
          </div>
          <div className="gameover-hero-stat-bar">
            <div className="gameover-hero-stat-bar-fill" style={{ width: `${scorePct}%` }} />
          </div>
        </div>

        <div className="gameover-stats">
          <Stat icon={<PartIcon />} label="Parts Built" value={state.castle.length} />
          <Stat icon={<SwordIcon />} label="Encounters" value={state.encounter} />
          <Stat icon={<SandDollarIcon size={22} />} label="Sand Dollars" value={state.sandDollars} />
          <Stat icon={<HeartIcon />} label="HP Remaining" value={`${state.playerHp}/${state.playerMaxHp}`} />
        </div>

        <button
          className="gameover-cta"
          onClick={() => dispatch({ type: 'restart' })}
          autoFocus
        >
          {isWin ? 'Play Again' : 'Try Again'}
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M5 12 H18 M13 7 L18 12 L13 17"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// === Stat row ===

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="gameover-stat">
      <div className="gameover-stat-icon">{icon}</div>
      <div className="gameover-stat-text">
        <div className="gameover-stat-label">{label}</div>
        <div className="gameover-stat-value">{value}</div>
      </div>
    </div>
  )
}

// === Backdrops ===

function SunBackdrop() {
  return (
    <>
      <svg className="gameover-rays" viewBox="-100 -100 200 200" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 360) / 14
          return (
            <polygon
              key={i}
              points="-6,0 0,-95 6,0"
              fill="url(#gameover-ray-grad)"
              transform={`rotate(${angle})`}
              opacity={i % 2 === 0 ? 0.85 : 0.45}
            />
          )
        })}
        <defs>
          <linearGradient id="gameover-ray-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
          </linearGradient>
        </defs>
      </svg>
      <div className="gameover-confetti" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => {
          const colors = ['#fbbf24', '#f59e0b', '#fde68a', '#fb7185', '#60a5fa', '#34d399']
          const left = (i * 5.5 + (i % 3) * 7) % 100
          const delay = (i * 0.27) % 4
          const dur = 5 + (i % 5)
          const color = colors[i % colors.length]
          return (
            <span
              key={i}
              className="gameover-confetti-piece"
              style={{
                left: `${left}%`,
                background: color,
                animationDelay: `${delay}s`,
                animationDuration: `${dur}s`,
              }}
            />
          )
        })}
      </div>
    </>
  )
}

function StormBackdrop() {
  return (
    <>
      <div className="gameover-rain" aria-hidden>
        {Array.from({ length: 26 }).map((_, i) => {
          const left = (i * 4 + (i % 5) * 3) % 100
          const delay = (i * 0.13) % 1.6
          const dur = 0.7 + ((i * 13) % 7) * 0.07
          return (
            <span
              key={i}
              className="gameover-rain-drop"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${dur}s`,
              }}
            />
          )
        })}
      </div>
      <svg className="gameover-waves" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0 60 Q75 20 150 60 T300 60 T450 60 T600 60 V120 H0 Z"
          fill="rgba(59, 130, 246, 0.30)"
        />
        <path
          d="M0 80 Q75 50 150 80 T300 80 T450 80 T600 80 V120 H0 Z"
          fill="rgba(37, 99, 235, 0.40)"
        />
        <path
          d="M0 100 Q75 75 150 100 T300 100 T450 100 T600 100 V120 H0 Z"
          fill="rgba(30, 64, 175, 0.55)"
        />
      </svg>
    </>
  )
}

// === Hero illustrations ===

function CastleTrophy() {
  return (
    <svg width="160" height="160" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <radialGradient id="gameover-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gameover-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#a0845c" />
        </linearGradient>
        <linearGradient id="gameover-sand-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#c4956a" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="60" cy="64" r="52" fill="url(#gameover-glow)" />

      {/* base / sand */}
      <ellipse cx="60" cy="108" rx="46" ry="6" fill="rgba(120, 53, 15, 0.35)" />
      <rect x="18" y="86" width="84" height="20" rx="4" fill="url(#gameover-sand)" stroke="#7c2d12" strokeWidth="2" />
      <line x1="34" y1="88" x2="34" y2="104" stroke="#7c2d12" strokeWidth="0.8" opacity="0.4" />
      <line x1="60" y1="88" x2="60" y2="104" stroke="#7c2d12" strokeWidth="0.8" opacity="0.4" />
      <line x1="86" y1="88" x2="86" y2="104" stroke="#7c2d12" strokeWidth="0.8" opacity="0.4" />

      {/* mid level */}
      <rect x="30" y="62" width="60" height="26" rx="3" fill="url(#gameover-sand-light)" stroke="#7c2d12" strokeWidth="2" />
      <rect x="36" y="70" width="6" height="10" fill="#7c2d12" opacity="0.7" />
      <rect x="78" y="70" width="6" height="10" fill="#7c2d12" opacity="0.7" />
      {/* arched door */}
      <path d="M54 88 V76 Q60 70 66 76 V88 Z" fill="#3d2210" />

      {/* crenellations along mid roof */}
      {[30, 38, 46, 54, 62, 70, 78].map(x => (
        <rect key={x} x={x} y={58} width="6" height="6" fill="url(#gameover-sand-light)" stroke="#7c2d12" strokeWidth="1.4" />
      ))}

      {/* tower */}
      <rect x="50" y="32" width="20" height="30" rx="2" fill="url(#gameover-sand)" stroke="#7c2d12" strokeWidth="2" />
      {[50, 56, 62, 68].map(x => (
        <rect key={x} x={x} y={28} width="4" height="6" fill="url(#gameover-sand)" stroke="#7c2d12" strokeWidth="1.4" />
      ))}

      {/* flagpole */}
      <line x1="60" y1="8" x2="60" y2="32" stroke="#3d2210" strokeWidth="2.2" strokeLinecap="round" />
      {/* waving flag */}
      <path
        className="gameover-flag"
        d="M60 10 Q70 13 78 10 Q74 16 78 22 Q70 19 60 22 Z"
        fill="#ef4444"
        stroke="#7f1d1d"
        strokeWidth="1.4"
      />

      {/* sparkle on the tower */}
      <path d="M44 38 L46 42 L50 44 L46 46 L44 50 L42 46 L38 44 L42 42 Z" fill="#fffbeb" opacity="0.9" />
    </svg>
  )
}

function SunkenCastle() {
  return (
    <svg width="160" height="160" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id="gameover-wet-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78716c" />
          <stop offset="100%" stopColor="#44403c" />
        </linearGradient>
        <linearGradient id="gameover-wet-sand-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8a29e" />
          <stop offset="100%" stopColor="#57534e" />
        </linearGradient>
      </defs>

      {/* puddle */}
      <ellipse cx="60" cy="108" rx="50" ry="7" fill="rgba(30, 58, 95, 0.55)" />

      {/* sunken base — tilted, partially eroded */}
      <g transform="rotate(-6 60 95)">
        <rect x="20" y="86" width="80" height="18" rx="4" fill="url(#gameover-wet-sand)" stroke="#1c1917" strokeWidth="2" />
        {/* cracks */}
        <path d="M44 86 L48 96 L42 104" stroke="#1c1917" strokeWidth="1.4" fill="none" />
        <path d="M70 88 L66 100" stroke="#1c1917" strokeWidth="1.2" fill="none" opacity="0.7" />
      </g>

      {/* mid level — broken, one wall collapsed */}
      <g transform="rotate(-4 60 75)">
        <path
          d="M32 64 L58 64 L62 84 L30 84 Z"
          fill="url(#gameover-wet-sand-light)"
          stroke="#1c1917"
          strokeWidth="2"
        />
        <rect x="38" y="70" width="6" height="10" fill="#1c1917" opacity="0.6" />
      </g>
      {/* rubble pile where the other half collapsed */}
      <g>
        <rect x="62" y="76" width="10" height="8" fill="url(#gameover-wet-sand)" stroke="#1c1917" strokeWidth="1.4" transform="rotate(15 67 80)" />
        <rect x="74" y="80" width="8" height="6" fill="url(#gameover-wet-sand-light)" stroke="#1c1917" strokeWidth="1.4" transform="rotate(-12 78 83)" />
        <rect x="84" y="78" width="6" height="6" fill="url(#gameover-wet-sand)" stroke="#1c1917" strokeWidth="1.4" transform="rotate(20 87 81)" />
      </g>

      {/* leaning broken tower */}
      <g transform="rotate(-12 50 50)">
        <rect x="42" y="34" width="16" height="30" rx="2" fill="url(#gameover-wet-sand)" stroke="#1c1917" strokeWidth="2" />
        {/* jagged broken top */}
        <path d="M42 34 L46 28 L50 34 L54 30 L58 34 Z" fill="url(#gameover-wet-sand)" stroke="#1c1917" strokeWidth="1.6" />
        <rect x="46" y="44" width="6" height="8" fill="#1c1917" opacity="0.6" />
      </g>

      {/* drooping flag */}
      <line x1="50" y1="14" x2="40" y2="34" stroke="#3d2210" strokeWidth="2" strokeLinecap="round" transform="rotate(-12 50 34)" />
      <path d="M40 36 Q44 42 38 46 Q34 42 36 38 Z" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1.2" opacity="0.85" />

      {/* falling raindrops on the castle */}
      <line x1="68" y1="22" x2="68" y2="32" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="80" y1="38" x2="80" y2="48" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="28" y1="48" x2="28" y2="58" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// === Stat icons ===

function PartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="14" width="18" height="7" rx="1.5" fill="#d4a574" stroke="#7c2d12" strokeWidth="1.5" />
      <rect x="6" y="8" width="12" height="6" rx="1" fill="#c4956a" stroke="#7c2d12" strokeWidth="1.5" />
      <rect x="9" y="3" width="6" height="5" rx="1" fill="#b08050" stroke="#7c2d12" strokeWidth="1.5" />
    </svg>
  )
}

function SwordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14 3 L21 3 L21 10 L11 20 L7 20 L4 17 L4 13 Z"
        fill="#cbd5e1"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="9" y1="15" x2="13" y2="19" stroke="#475569" strokeWidth="1.5" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21 C 5 16 2 12 2 8 a5 5 0 0 1 10 -1 a5 5 0 0 1 10 1 c0 4 -3 8 -10 13 Z"
        fill="#ef4444"
        stroke="#7f1d1d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Sparkle({ style, delay = '0s', size = 12 }: { style: React.CSSProperties; delay?: string; size?: number }) {
  return (
    <svg
      className="gameover-sparkle"
      style={{ ...style, width: size, height: size, animationDelay: delay }}
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="#fef3c7" />
    </svg>
  )
}
