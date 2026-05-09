'use client'

import type { GameAction } from './logic'
import SandDollarIcon from './SandDollarIcon'

type Props = {
  sandDollarsEarned: number
  dispatch: (action: GameAction) => void
}

export default function VictoryModal({ sandDollarsEarned, dispatch }: Props) {
  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        {/* Radiating sun rays behind the trophy */}
        <SunRays />

        {/* Floating sparkles */}
        <Sparkle style={{ top: '14%', left: '12%' }} delay="0s" />
        <Sparkle style={{ top: '22%', right: '14%' }} delay="0.6s" size={14} />
        <Sparkle style={{ top: '50%', left: '8%' }} delay="1.1s" size={10} />
        <Sparkle style={{ top: '46%', right: '10%' }} delay="0.3s" />
        <Sparkle style={{ bottom: '28%', left: '18%' }} delay="0.9s" size={11} />
        <Sparkle style={{ bottom: '24%', right: '18%' }} delay="1.4s" size={13} />

        <div className="victory-content">
          {/* Trophy */}
          <div className="victory-trophy-wrap">
            <TrophyStarfish />
          </div>

          {/* Title */}
          <h2 className="victory-title">Victory!</h2>
          <p className="victory-subtitle">The shore is yours.</p>

          {/* Reward */}
          {sandDollarsEarned > 0 && (
            <div className="victory-reward">
              <SandDollarIcon size={42} />
              <span className="victory-reward-amount">+{sandDollarsEarned}</span>
              <span className="victory-reward-label">Sand Dollars</span>
            </div>
          )}

          {/* CTA */}
          <button
            className="victory-cta"
            onClick={() => dispatch({ type: 'continue_from_victory' })}
            autoFocus
          >
            Continue
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
    </div>
  )
}

function SunRays() {
  // 12 golden rays radiating from center; spins slowly behind the trophy.
  return (
    <svg className="victory-rays" viewBox="-100 -100 200 200" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12
        return (
          <polygon
            key={i}
            points="-7,0 0,-95 7,0"
            fill="url(#victory-ray-grad)"
            transform={`rotate(${angle})`}
            opacity={i % 2 === 0 ? 0.85 : 0.5}
          />
        )
      })}
      <defs>
        <linearGradient id="victory-ray-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0" />
          <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.95" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function TrophyStarfish() {
  // Golden starfish trophy on a pedestal — beach-themed take on a victory cup.
  return (
    <svg width="148" height="148" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <radialGradient id="trophy-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="trophy-star" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="trophy-pedestal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* halo */}
      <circle cx="60" cy="50" r="55" fill="url(#trophy-glow)" />

      {/* starfish */}
      <path
        d="M60 12 L70 42 L102 42 L76 60 L86 92 L60 72 L34 92 L44 60 L18 42 L50 42 Z"
        fill="url(#trophy-star)"
        stroke="#92400e"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* face */}
      <circle cx="52" cy="48" r="2.2" fill="#7c2d12" />
      <circle cx="68" cy="48" r="2.2" fill="#7c2d12" />
      <path d="M54 56 Q60 60 66 56" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* shimmer */}
      <path d="M50 28 L54 40" stroke="#fffbeb" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

      {/* pedestal */}
      <rect x="46" y="92" width="28" height="8" rx="2" fill="url(#trophy-pedestal)" stroke="#7c2d12" strokeWidth="1.5" />
      <rect x="38" y="100" width="44" height="10" rx="3" fill="url(#trophy-pedestal)" stroke="#7c2d12" strokeWidth="1.5" />
    </svg>
  )
}

function Sparkle({ style, delay = '0s', size = 12 }: { style: React.CSSProperties; delay?: string; size?: number }) {
  return (
    <svg
      className="victory-sparkle"
      style={{ ...style, width: size, height: size, animationDelay: delay }}
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="#fef3c7" />
    </svg>
  )
}
