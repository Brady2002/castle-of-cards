'use client'

import type { CastlePartType } from './types'
import { CASTLE_PART_DEFS, PART_TIER } from './castleParts'

type Props = {
  castle: CastlePartType[]
}

const TIER_LABELS = ['Shore', 'Structure', 'Features', 'Peak']

const PART_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  foundation: { bg: '#d4a574', border: '#a0845c', text: '#fff' },
  moat: { bg: '#60a5fa', border: '#2563eb', text: '#fff' },
  seawall: { bg: '#8b7355', border: '#5c4a32', text: '#fff' },
  wall: { bg: '#c4956a', border: '#8b6914', text: '#fff' },
  decoration: { bg: '#f9a8d4', border: '#db2777', text: '#fff' },
  tower: { bg: '#b08050', border: '#78350f', text: '#fff' },
  battlement: { bg: '#a0845c', border: '#5c4a32', text: '#fff' },
  flag: { bg: '#ef4444', border: '#991b1b', text: '#fff' },
}

export default function CastleView({ castle }: Props) {
  // Group built parts by tier
  const tiers: Record<number, CastlePartType[]> = { 0: [], 1: [], 2: [], 3: [] }
  for (const part of castle) {
    tiers[PART_TIER[part]].push(part)
  }

  return (
    <div className="panel min-w-[340px] w-[380px] p-6 flex flex-col">
      <div className="font-bold text-amber-900 text-2xl mb-4 pb-2 border-b border-amber-700/20">Your Castle</div>

      {/* Render tiers top-to-bottom (3→0) so it looks like a castle */}
      <div className="flex flex-col gap-2 flex-1">
        {[3, 2, 1, 0].map(tier => {
          const parts = tiers[tier]
          const hasParts = parts.length > 0

          return (
            <div key={tier} className={`castle-tier ${hasParts ? 'has-parts' : ''}`}>
              <div className="text-[12px] text-amber-700/65 font-bold uppercase tracking-wider mb-1.5">
                {TIER_LABELS[tier]}
              </div>
              {hasParts ? (
                <div className="flex gap-2 flex-wrap">
                  {parts.map((partType, i) => {
                    const def = CASTLE_PART_DEFS[partType]
                    const style = PART_STYLES[partType]
                    return (
                      <div
                        key={`${partType}-${i}`}
                        className="castle-part px-3 py-2 flex items-center gap-2.5"
                        style={{ background: style.bg, borderColor: style.border }}
                      >
                        <PartIcon type={partType} />
                        <div className="flex flex-col">
                          <span className="font-bold text-[14px] capitalize" style={{ color: style.text }}>
                            {partType}
                          </span>
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            +{def.score} · {def.bonus}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-[13px] text-gray-400/70 italic py-1 px-1.5">—</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Castle illustration */}
      <div className="mt-3 flex justify-center">
        <CastleIllustration castle={castle} />
      </div>

      {/* Water line */}
      <div className="water-line mt-2" />
    </div>
  )
}

function CastleIllustration({ castle }: { castle: CastlePartType[] }) {
  const has = (p: CastlePartType) => castle.includes(p)
  const w = 200
  const h = 120

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Sand base */}
      <rect x="20" y="100" width="160" height="20" rx="4" fill="#e8d5b7" />

      {/* Moat */}
      {has('moat') && (
        <>
          <path d="M10 105 Q30 95 50 105 Q70 115 90 105 Q110 95 130 105 Q150 115 170 105 Q190 95 200 100"
            fill="none" stroke="#60a5fa" strokeWidth="3" opacity="0.7" />
          <path d="M10 110 Q40 100 70 110 Q100 120 130 110 Q160 100 190 110"
            fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.5" />
        </>
      )}

      {/* Seawall */}
      {has('seawall') && (
        <rect x="25" y="88" width="150" height="14" rx="2" fill="#8b7355" stroke="#5c4a32" strokeWidth="1.5" />
      )}

      {/* Foundation */}
      {has('foundation') && (
        <rect x="45" y="74" width="110" height="16" rx="3" fill="#d4a574" stroke="#a0845c" strokeWidth="1.5" />
      )}

      {/* Wall */}
      {has('wall') && (
        <>
          <rect x="55" y="44" width="90" height="32" rx="2" fill="#c4956a" stroke="#8b6914" strokeWidth="1.5" />
          {/* Brick lines */}
          <line x1="55" y1="56" x2="145" y2="56" stroke="#a07840" strokeWidth="0.8" opacity="0.5" />
          <line x1="55" y1="66" x2="145" y2="66" stroke="#a07840" strokeWidth="0.8" opacity="0.5" />
          <line x1="80" y1="44" x2="80" y2="56" stroke="#a07840" strokeWidth="0.8" opacity="0.4" />
          <line x1="120" y1="44" x2="120" y2="56" stroke="#a07840" strokeWidth="0.8" opacity="0.4" />
          <line x1="100" y1="56" x2="100" y2="66" stroke="#a07840" strokeWidth="0.8" opacity="0.4" />
        </>
      )}

      {/* Battlement */}
      {has('battlement') && (
        <path d="M55 44 L55 36 L63 36 L63 40 L71 40 L71 36 L79 36 L79 40 L87 40 L87 36 L95 36 L95 40 L103 40 L103 36 L111 36 L111 40 L119 40 L119 36 L127 36 L127 40 L135 40 L135 36 L145 36 L145 44"
          fill="#a0845c" stroke="#5c4a32" strokeWidth="1" />
      )}

      {/* Decoration */}
      {has('decoration') && (
        <>
          <circle cx="75" cy="58" r="3" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
          <circle cx="100" cy="52" r="3" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
          <circle cx="125" cy="58" r="3" fill="#f9a8d4" stroke="#db2777" strokeWidth="1" />
          {/* Small shells */}
          <ellipse cx="88" cy="68" rx="2.5" ry="2" fill="#fce7f3" stroke="#db2777" strokeWidth="0.5" />
          <ellipse cx="112" cy="68" rx="2.5" ry="2" fill="#fce7f3" stroke="#db2777" strokeWidth="0.5" />
        </>
      )}

      {/* Tower */}
      {has('tower') && (
        <>
          <rect x="85" y="16" width="30" height="30" rx="2" fill="#b08050" stroke="#78350f" strokeWidth="1.5" />
          {/* Tower top crenellation */}
          <rect x="83" y="10" width="34" height="8" rx="1.5" fill="#a07040" stroke="#78350f" strokeWidth="1" />
          <line x1="83" y1="14" x2="117" y2="14" stroke="#78350f" strokeWidth="0.5" opacity="0.4" />
          {/* Window */}
          <rect x="95" y="22" width="10" height="12" rx="5" fill="#5c3a1a" />
        </>
      )}

      {/* Flag */}
      {has('flag') && (
        <>
          <line x1="100" y1="-2" x2="100" y2="12" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M100 -2 L120 4 L100 11" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
        </>
      )}

      {/* Empty state */}
      {castle.length === 0 && (
        <text x="100" y="60" textAnchor="middle" fontSize="12" fill="#a0845c" opacity="0.5">
          Build to see your castle!
        </text>
      )}
    </svg>
  )
}

function PartIcon({ type }: { type: string }) {
  const sz = 18
  const c = 'rgba(255,255,255,0.9)'

  switch (type) {
    case 'foundation':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><rect x="2" y="12" width="16" height="5" rx="1" fill="none" stroke={c} strokeWidth="1.5"/></svg>
    case 'moat':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><path d="M2 12 Q5 8 8 12 Q11 16 14 12 Q17 8 20 12" fill="none" stroke={c} strokeWidth="1.5"/></svg>
    case 'seawall':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="12" rx="1" fill="none" stroke={c} strokeWidth="1.5"/><line x1="3" y1="9" x2="17" y2="9" stroke={c} strokeWidth="1" opacity="0.5"/><line x1="3" y1="13" x2="17" y2="13" stroke={c} strokeWidth="1" opacity="0.5"/></svg>
    case 'wall':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><rect x="4" y="4" width="12" height="13" rx="1" fill="none" stroke={c} strokeWidth="1.5"/><line x1="4" y1="10" x2="16" y2="10" stroke={c} strokeWidth="1"/></svg>
    case 'decoration':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="none" stroke={c} strokeWidth="1.5"/><circle cx="10" cy="10" r="1.5" fill={c}/></svg>
    case 'tower':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><rect x="6" y="4" width="8" height="13" rx="1" fill="none" stroke={c} strokeWidth="1.5"/><rect x="5" y="2" width="10" height="3" rx="1" fill="none" stroke={c} strokeWidth="1"/></svg>
    case 'battlement':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><rect x="4" y="10" width="12" height="7" rx="1" fill="none" stroke={c} strokeWidth="1.5"/><path d="M4 10 L4 6 L7 6 L7 8 L10 8 L10 6 L13 6 L13 8 L16 8 L16 6 L16 10" fill="none" stroke={c} strokeWidth="1.2"/></svg>
    case 'flag':
      return <svg width={sz} height={sz} viewBox="0 0 20 20"><line x1="7" y1="3" x2="7" y2="18" stroke={c} strokeWidth="1.5"/><path d="M7 3 L16 6 L7 10" fill={c} opacity="0.6"/></svg>
    default:
      return null
  }
}
