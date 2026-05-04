'use client'
import Link from 'next/link'
import Image from 'next/image'
import { AttributeBadge } from './AttributeBadge'

type Character = {
  id: string
  dex_numbers: number[]
  name: string
  location: string
  photo_url: string | null
  attributes: string[]
  race: string[]
}

function formatDex(nums: number[]): string {
  if (!nums || nums.length === 0) return '?'
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? `${min}` : `${min}~${max}`
}

export function CharacterCard({ c }: { c: Character }) {
  return (
    <Link href={`/characters/${c.id}`} className="block">
      <div className="rounded-2xl overflow-hidden border bg-card shadow-sm active:scale-95 transition-transform">
        <div className="relative aspect-square bg-muted">
          {c.photo_url ? (
            <Image
              src={c.photo_url}
              alt={c.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl text-muted-foreground">
              🧱
            </div>
          )}
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
            #{formatDex(c.dex_numbers)}
          </span>
        </div>
        <div className="p-3 space-y-1.5">
          <p className="font-bold truncate">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.location} · {c.race?.length > 0 ? c.race.join(', ') : '—'}</p>
          <div className="flex flex-wrap gap-1">
            {c.attributes.slice(0, 3).map((a) => (
              <AttributeBadge key={a} name={a} />
            ))}
            {c.attributes.length > 3 && (
              <span className="text-xs text-muted-foreground">+{c.attributes.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
