'use client'
import Link from 'next/link'
import Image from 'next/image'

type Weapon = {
  id: string
  dex_number: number
  name: string
  photo_url: string | null
  durability: number | null
  weapon_type: string | null
  equipped_by?: { character: { id: string; name: string } } | null
}

export function WeaponCard({ w }: { w: Weapon }) {
  return (
    <Link href={`/weapons/${w.id}`} className="block">
      <div className="rounded-2xl overflow-hidden border bg-card shadow-sm active:scale-95 transition-transform">
        <div className="relative aspect-square bg-muted">
          {w.photo_url ? (
            <Image src={w.photo_url} alt={w.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl text-muted-foreground">⚔️</div>
          )}
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
            #{w.dex_number}
          </span>
          {w.equipped_by && (
            <span className="absolute top-2 right-2 bg-blue-500/80 text-white text-xs rounded-full px-2 py-0.5">
              장착 중
            </span>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="font-bold truncate">{w.name}</p>
          <p className="text-xs text-muted-foreground">
            {w.weapon_type ?? '종류없음'}
            {w.durability != null ? ` · 내구도 ${w.durability}` : ''}
          </p>
          {w.equipped_by && (
            <p className="text-xs text-blue-500 truncate">→ {w.equipped_by.character.name}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
