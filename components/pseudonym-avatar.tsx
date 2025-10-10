"use client"

export default function PseudonymAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = (name || "?").slice(0, 2).toUpperCase()
  return (
    <div
      aria-label={`Avatar for ${name}`}
      className="inline-flex items-center justify-center rounded-lg"
      style={{ width: size, height: size, background: "hsl(172 32% 92%)", color: "hsl(172 32% 25%)" }}
    >
      <span className="text-sm font-semibold">{initials}</span>
    </div>
  )
}
