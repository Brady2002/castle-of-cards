// Shared sand-dollar currency icon — five-petal star pattern on a sandy disc.
// Replaces the older "$"-in-circle icon throughout the UI.
type Props = {
  size?: number
}

export default function SandDollarIcon({ size = 24 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="13" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
      <circle cx="16" cy="16" r="13" fill="none" stroke="#fffbeb" strokeWidth="0.8" opacity="0.8" />
      {[0, 72, 144, 216, 288].map(a => {
        const r = (a * Math.PI) / 180
        const x2 = 16 + Math.cos(r - Math.PI / 2) * 8
        const y2 = 16 + Math.sin(r - Math.PI / 2) * 8
        return (
          <line
            key={a}
            x1={16}
            y1={16}
            x2={x2}
            y2={y2}
            stroke="#b45309"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="16" cy="16" r="2" fill="#b45309" />
    </svg>
  )
}
