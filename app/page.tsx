'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Lock, LockOpen, Plus, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CharacterCard } from '@/components/CharacterCard'
import { AdminModal } from '@/components/AdminModal'
import { useAdmin } from '@/components/AdminProvider'
import { LOCATIONS, ATTRIBUTES, RACES } from '@/lib/constants'

type Character = {
  id: string; dex_numbers: number[]; name: string; location: string
  photo_url: string | null; attributes: string[]; race: string[]
}

const SORT_OPTIONS = [
  { value: 'dex_number', label: '도감번호순' },
  { value: 'name', label: '이름순' },
  { value: 'latest', label: '최신순' },
]

export default function Home() {
  const { isAdmin, refresh } = useAdmin()
  const [characters, setCharacters] = useState<Character[]>([])
  const [tab, setTab] = useState('전체')
  const [search, setSearch] = useState('')
  const [attribute, setAttribute] = useState('')
  const [race, setRace] = useState('')
  const [sort, setSort] = useState('dex_number')
  const [showFilter, setShowFilter] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (tab !== '전체') params.set('location', tab)
    if (search) params.set('search', search)
    if (attribute) params.set('attribute', attribute)
    if (race) params.set('race', race)
    params.set('sort', sort)
    const res = await fetch(`/api/characters?${params}`)
    setCharacters(await res.json())
  }, [tab, search, attribute, race, sort])

  useEffect(() => { load() }, [load])

  const handleLogout = async () => {
    await fetch('/api/admin', { method: 'DELETE' })
    refresh()
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">🧱 클레이 도감</h1>
          <div className="flex gap-1">
            <button onClick={() => setShowFilter(v => !v)} className="p-2 rounded-full hover:bg-muted">
              <SlidersHorizontal size={18} />
            </button>
            {isAdmin ? (
              <>
                <Link href="/characters/new" className="p-2 rounded-full hover:bg-muted inline-flex items-center">
                  <Plus size={18} />
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-muted">
                  <LockOpen size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => setShowAdminModal(true)} className="p-2 rounded-full hover:bg-muted">
                <Lock size={18} />
              </button>
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

        {/* 위치 탭 */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {['전체', ...LOCATIONS].map(loc => {
            const cnt = loc === '전체' ? characters.length : characters.filter(c => c.location === loc).length
            return (
              <button
                key={loc}
                onClick={() => setTab(loc)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === loc ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                }`}
              >
                {loc} {cnt}
              </button>
            )
          })}
        </div>

        {/* 필터 패널 */}
        {showFilter && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <select
              className="border rounded-md px-2 py-1.5 text-sm bg-background"
              value={attribute}
              onChange={e => setAttribute(e.target.value)}
            >
              <option value="">속성 전체</option>
              {ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              className="border rounded-md px-2 py-1.5 text-sm bg-background"
              value={race}
              onChange={e => setRace(e.target.value)}
            >
              <option value="">종족 전체</option>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
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
      </header>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <span className="text-5xl">🔍</span>
            <p>캐릭터가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {characters.map(c => <CharacterCard key={c.id} c={c} />)}
          </div>
        )}
      </div>

      {showAdminModal && (
        <AdminModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={() => { setShowAdminModal(false); refresh() }}
        />
      )}
    </div>
  )
}
