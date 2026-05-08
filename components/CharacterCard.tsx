'use client'
import Link from 'next/link'
import Image from 'next/image'
import { AttributeBadge } from './AttributeBadge'

type EquippedWeapon = {
  slot_position: number
  weapon: { id: string; name: string; photo_url: string | null; weapon_type: string | null }
}

type Character = {
  id: string
  dex_numbers: number[]
  name: string
  location: string
  photo_url: string | null
  attributes: string[]
  race: string[]
  equipped_weapons?: EquippedWeapon[]
}

const MAX_SLOTS = 5

function formatDex(nums: number[]): string {
  if (!nums || nums.length === 0) return '?'
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? `${min}` : `${min}~${max}`
}

export function CharacterCard({ c }: { c: Character }) {
  const slotMap = new Map((c.equipped_weapons ?? []).map(e => [e.slot_position, e.weapon]))
  const equippedCount = slotMap.size

  return (
    <Link href={`/characters/${c.id}`} className="block">
      <div className="rounded-2xl overflow-hidden border bg-card shadow-sm active:scale-95 transition-transform">
        <div className="relative aspect-square bg-muted">
          {c.photo_url ? (
            <Image src={c.photo_url} alt={c.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl text-muted-foreground">
              🧱
            </div>
          )}
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs rounded-full px-2 py-0.5">
            #{formatDex(c.dex_numbers)}
          </span>
          {equippedCount > 0 && (
            <span className="absolute top-2 right-2 bg-blue-500/80 text-white text-xs rounded-full px-2 py-0.5">
              ⚔️ {equippedCount}
            </span>
          )}
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

          {/* 장착 무기 슬롯 */}
          <div className="flex gap-1 pt-0.5">
            {Array.from({ length: MAX_SLOTS }, (_, i) => i + 1).map(pos => {
              const weapon = slotMap.get(pos)
              return (
                <div
                  key={pos}
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden
                    ${weapon ? 'border border-blue-300 bg-blue-50' : 'border border-dashed border-muted-foreground/20 bg-muted/50'}`}
                  title={weapon ? weapon.name : `슬롯 ${pos} 비어있음`}
                >
                  {weapon ? (
                    weapon.photo_url ? (
                      <Image src={weapon.photo_url} alt={weapon.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="text-xs">⚔️</span>
                    )
                  ) : (
                    <span className="text-[9px] text-muted-foreground/40">{pos}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Link>
  )
}
