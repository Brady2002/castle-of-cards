'use client'

import type { GameAction } from './logic'

type Props = {
  dispatch: (action: GameAction) => void
}

export default function StartScreen({ dispatch }: Props) {
  return (
    <div className="start-screen">
      <SkyBackdrop />
      <SeaBackdrop />
      <SandBackdrop />

      <div className="start-card">
        <Sparkle style={{ top: '8%', left: '12%' }} delay="0s" />
        <Sparkle style={{ top: '16%', right: '14%' }} delay="0.5s" size={14} />
        <Sparkle style={{ top: '52%', left: '8%' }} delay="1.1s" size={11} />
        <Sparkle style={{ bottom: '14%', right: '18%' }} delay="0.8s" size={13} />

        <div className="start-hero">
          <CastleHero />
        </div>

        <h1 className="start-title">Castle of Cards</h1>
        <p className="start-tagline">A Deckbuilder by the Sea</p>

        <p className="start-pitch">
          Fend off the creatures of the rising tide, gather sand dollars,
          and shape your fortress before The Tide King reclaims the shore.

          *NOTE* On smaller screens like laptops, I recommend zooming out to around 80% so you can view your whole hand at once.
        </p>

        <div className="start-howto">
          <HowTo
            icon={<SwordIcon />}
            label="Battle"
            text="Drag cards to attack crabs, gulls, and worse."
          />
          <HowTo
            icon={<SandDollar />}
            label="Earn"
            text="Win sand dollars from every encounter."
          />
          <HowTo
            icon={<CastleIcon />}
            label="Build"
            text="Spend them on castle parts that bend the rules."
          />
        </div>

        <button
          className="start-cta"
          onClick={() => dispatch({ type: 'start_game' })}
          autoFocus
        >
          Begin
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

function HowTo({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="start-howto-row">
      <div className="start-howto-icon">{icon}</div>
      <div className="start-howto-text">
        <div className="start-howto-label">{label}</div>
        <div className="start-howto-desc">{text}</div>
      </div>
    </div>
  )
}

// === Backdrops ===

function SkyBackdrop() {
  return (
    <div className="start-sky" aria-hidden>
      <Cloud style={{ top: '10%', left: '8%' }} width={140} />
      <Cloud style={{ top: '4%', left: '60%' }} width={180} drift="2" />
      <Cloud style={{ top: '20%', left: '78%' }} width={100} drift="3" />
      <Gull style={{ top: '28%', left: '24%' }} />
      <Gull style={{ top: '22%', left: '70%' }} flip delay="0.6s" />
      <Gull style={{ top: '34%', left: '50%' }} delay="1.2s" />
    </div>
  )
}

function SeaBackdrop() {
  return (
    <svg className="start-waves" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 60 Q75 30 150 60 T300 60 T450 60 T600 60 V120 H0 Z"
        fill="rgba(96, 165, 250, 0.30)"
      />
      <path
        d="M0 80 Q75 55 150 80 T300 80 T450 80 T600 80 V120 H0 Z"
        fill="rgba(56, 189, 248, 0.40)"
      />
      <path
        d="M0 100 Q75 78 150 100 T300 100 T450 100 T600 100 V120 H0 Z"
        fill="rgba(14, 165, 233, 0.55)"
      />
    </svg>
  )
}

function SandBackdrop() {
  return (
    <div className="start-sand" aria-hidden>
      <Shell style={{ bottom: '6%', left: '10%' }} />
      <Starfish style={{ bottom: '10%', left: '78%' }} />
      <Shell style={{ bottom: '4%', left: '32%' }} small />
      <Shell style={{ bottom: '8%', left: '88%' }} small />
    </div>
  )
}

// === Hero ===

function CastleHero() {
  return (
    <svg width="200" height="200" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <radialGradient id="start-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="start-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#a0845c" />
        </linearGradient>
        <linearGradient id="start-sand-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#c4956a" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="64" r="54" fill="url(#start-glow)" />

      <ellipse cx="60" cy="108" rx="48" ry="6" fill="rgba(120, 53, 15, 0.35)" />
      <rect x="16" y="86" width="88" height="20" rx="4" fill="url(#start-sand)" stroke="#7c2d12" strokeWidth="2" />
      <line x1="34" y1="88" x2="34" y2="104" stroke="#7c2d12" strokeWidth="0.8" opacity="0.4" />
      <line x1="60" y1="88" x2="60" y2="104" stroke="#7c2d12" strokeWidth="0.8" opacity="0.4" />
      <line x1="86" y1="88" x2="86" y2="104" stroke="#7c2d12" strokeWidth="0.8" opacity="0.4" />

      <rect x="28" y="62" width="64" height="26" rx="3" fill="url(#start-sand-light)" stroke="#7c2d12" strokeWidth="2" />
      <rect x="36" y="70" width="6" height="10" fill="#7c2d12" opacity="0.7" />
      <rect x="78" y="70" width="6" height="10" fill="#7c2d12" opacity="0.7" />
      <path d="M54 88 V76 Q60 70 66 76 V88 Z" fill="#3d2210" />

      {[28, 36, 44, 52, 60, 68, 76, 84].map(x => (
        <rect key={x} x={x} y={58} width="6" height="6" fill="url(#start-sand-light)" stroke="#7c2d12" strokeWidth="1.4" />
      ))}

      <rect x="48" y="30" width="24" height="32" rx="2" fill="url(#start-sand)" stroke="#7c2d12" strokeWidth="2" />
      {[48, 54, 60, 66].map(x => (
        <rect key={x} x={x} y={26} width="4" height="6" fill="url(#start-sand)" stroke="#7c2d12" strokeWidth="1.4" />
      ))}

      <line x1="60" y1="6" x2="60" y2="30" stroke="#3d2210" strokeWidth="2.2" strokeLinecap="round" />
      <path
        className="start-flag"
        d="M60 8 Q72 11 80 8 Q76 14 80 20 Q72 17 60 20 Z"
        fill="#ef4444"
        stroke="#7f1d1d"
        strokeWidth="1.4"
      />

      <path d="M44 38 L46 42 L50 44 L46 46 L44 50 L42 46 L38 44 L42 42 Z" fill="#fffbeb" opacity="0.9" />
    </svg>
  )
}

// === Decorations ===

function Cloud({ style, width = 120, drift = '1' }: { style?: React.CSSProperties; width?: number; drift?: string }) {
  return (
    <svg
      className={`start-cloud start-cloud-drift-${drift}`}
      style={style}
      width={width}
      height={width * 0.45}
      viewBox="0 0 120 54"
      fill="none"
      aria-hidden
    >
      <ellipse cx="30" cy="34" rx="22" ry="14" fill="#fff" />
      <ellipse cx="58" cy="26" rx="26" ry="18" fill="#fff" />
      <ellipse cx="86" cy="34" rx="22" ry="14" fill="#fff" />
      <ellipse cx="60" cy="40" rx="44" ry="10" fill="#fff" />
    </svg>
  )
}

function Gull({ style, flip, delay = '0s' }: { style?: React.CSSProperties; flip?: boolean; delay?: string }) {
  return (
    <svg
      className="start-gull"
      style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined, animationDelay: delay }}
      width="40"
      height="14"
      viewBox="0 0 40 14"
      fill="none"
      aria-hidden
    >
      <path d="M2 10 Q9 2 18 10 Q27 2 36 10" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Shell({ style, small }: { style?: React.CSSProperties; small?: boolean }) {
  const s = small ? 22 : 30
  return (
    <svg className="start-trinket" style={style} width={s} height={s * 0.85} viewBox="0 0 30 26" fill="none" aria-hidden>
      <path d="M15 2 Q28 14 25 24 L5 24 Q2 14 15 2 Z" fill="#f9c0a5" stroke="#b87355" strokeWidth="1.2" />
      <path d="M15 4 L15 22 M11 6 L9 22 M19 6 L21 22 M7 10 L5 22 M23 10 L25 22"
        stroke="#b87355" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

function Starfish({ style }: { style?: React.CSSProperties }) {
  return (
    <svg className="start-trinket" style={style} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
      <path d="M17 3 L21 13 L31 13 L23 19 L26 29 L17 23 L8 29 L11 19 L3 13 L13 13 Z"
        fill="#ff8a5b" stroke="#c0392b" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="14" cy="16" r="0.9" fill="#7f1d1d" />
      <circle cx="20" cy="16" r="0.9" fill="#7f1d1d" />
      <circle cx="17" cy="20" r="0.9" fill="#7f1d1d" />
    </svg>
  )
}

function Sparkle({ style, delay = '0s', size = 12 }: { style: React.CSSProperties; delay?: string; size?: number }) {
  return (
    <svg
      className="start-sparkle"
      style={{ ...style, width: size, height: size, animationDelay: delay }}
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill="#fef3c7" />
    </svg>
  )
}

// === HowTo icons ===

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

function SandDollar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
      <path d="M12 6 L12 18 M6 12 L18 12 M8 8 L16 16 M16 8 L8 16"
        stroke="#92400e" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
      <circle cx="12" cy="12" r="1.4" fill="#92400e" />
    </svg>
  )
}

function CastleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="14" width="18" height="7" rx="1.5" fill="#d4a574" stroke="#7c2d12" strokeWidth="1.5" />
      <rect x="6" y="8" width="12" height="6" rx="1" fill="#c4956a" stroke="#7c2d12" strokeWidth="1.5" />
      <rect x="9" y="3" width="6" height="5" rx="1" fill="#b08050" stroke="#7c2d12" strokeWidth="1.5" />
    </svg>
  )
}
