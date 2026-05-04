'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Home } from 'lucide-react'
import Link from 'next/link'
import { CharacterForm } from '@/components/CharacterForm'
import { useAdmin } from '@/components/AdminProvider'

export default function EditCharacterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (isAdmin === false) { router.replace('/'); return }
    fetch(`/api/characters/${id}`)
      .then(r => r.json())
      .then(c => setInitial({
        ...c,
        dex_numbers: Array.isArray(c.dex_numbers) ? c.dex_numbers.join(',') : '',
        hp: c.hp != null ? String(c.hp) : '',
        attack: c.attack != null ? String(c.attack) : '',
      }))
  }, [id, isAdmin, router])

  if (!initial) return <div className="flex items-center justify-center h-screen text-muted-foreground">불러오는 중...</div>

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1">캐릭터 수정</h1>
        <Link href="/" className="p-2 rounded-full hover:bg-muted inline-flex">
          <Home size={18} />
        </Link>
        <button onClick={() => router.push('/characters/new')} className="p-1 rounded-full hover:bg-muted">
          <Plus size={22} />
        </button>
      </header>
      <CharacterForm initial={initial as Parameters<typeof CharacterForm>[0]['initial']} characterId={id} />
    </div>
  )
}
