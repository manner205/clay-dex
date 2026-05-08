'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { WeaponCard } from '@/components/WeaponCard'
import { useAdmin } from '@/components/AdminProvider'
import { WEAPON_TYPES } from '@/lib/constants'

type Weapon = {
  id: string; dex_number: number; name: string; photo_url: string | null
  hp_bonus: number; attack_bonus: number; attributes: string[]
  weapon_type: string | null
  equipped_by?: { character: { id: string; name: string } } | null
}

const SORT_OPTIONS = [
  { value: 'dex_number', label: '도감번호순' },
  { value: 'name', label: '이름순' },
  { value: 'latest', label: '최신순' },
]

export default function WeaponsPage() {
  const { isAdmin } = useAdmin()
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [search, setSearch] = useState('')
  const [weaponType, setWeaponType] = useState('')
  const [sort, setSort] = useState('dex_number')
  const [showFilter, setShowFilter] = useState(false)

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (weaponType) params.set('weapon_type', weaponType)
    params.set('sort', sort)
    const res = await fetch(`/api/weapons?${params}`)
    const data = await res.json()
    setWeapons(Array.isArray(data) ? data : [])
  }, [search, weaponType, sort])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 rounded-full hover:bg-muted inline-flex">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold">무기 도감</h1>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowFilter(v => !v)} className="p-2 rounded-full hover:bg-muted">
              <SlidersHorizontal size={18} />
            </button>
            {isAdmin && (
              <Link href="/weapons/new" className="p-2 rounded-full hover:bg-muted inline-flex items-center">
                <Plus size={18} />
              </Link>
            )}
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="이름으로 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            suppressHydrationWarning
          />
        </div>

        {/* 필터 영역 */}
        {showFilter && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <select
              className="border rounded-md px-2 py-1.5 text-sm bg-background"
              value={weaponType}
              onChange={e => setWeaponType(e.target.value)}
            >
              <option value="">종류 전체</option>
              {WEAPON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              className="border rounded-md px-2 py-1.5 text-sm bg-background"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {/* 결과 수 */}
        <div className="flex gap-1 pb-1">
          <span className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-foreground text-background">
            전체 {weapons.length}
          </span>
        </div>
      </header>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {weapons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <span className="text-5xl">⚔️</span>
            <p>무기가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {weapons.map(w => <WeaponCard key={w.id} w={w} />)}
          </div>
        )}
      </div>
    </div>
  )
}
