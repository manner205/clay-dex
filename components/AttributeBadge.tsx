'use client'
import { ATTRIBUTE_COLORS } from '@/lib/constants'

export function AttributeBadge({ name }: { name: string }) {
  const color = ATTRIBUTE_COLORS[name] ?? { bg: '#6b7280', text: '#fff' }
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {name}
    </span>
  )
}
