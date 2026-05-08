'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Weapon = {
  id: string; dex_number: number; name: string; photo_url: string | null
  durability: number | null; weapon_type: string | null
  equipped_by?: { character: { id: string; name: string } } | null
}

type Props = {
  onSelect: (weaponId: string) => void
  onClose: () => void
}

export function WeaponSelectModal({ onSelect, onClose }: Props) {
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('available', 'true')
    if (search) params.set('search', search)
    fetch(`/api/weapons?${params}`)
      .then(r => r.json())
      .then(setWeapons)
  }, [search])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-background rounded-t-2xl p-4 space-y-3 max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">무기 선택</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="무기 검색..." value={search}
            onChange={e => setSearch(e.target.value)} autoFocus />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {weapons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">장착 가능한 무기가 없습니다</p>
          ) : (
            weapons.map(w => (
              <button key={w.id} onClick={() => onSelect(w.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors text-left">
                <div className="relative w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  {w.photo_url ? (
                    <Image src={w.photo_url} alt={w.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl">⚔️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">#{w.dex_number} {w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.weapon_type ?? '종류없음'}
                    {w.durability != null ? ` · 내구도 ${w.durability}` : ''}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
