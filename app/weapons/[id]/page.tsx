'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, Home } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'

type Weapon = {
  id: string; dex_number: number; name: string; photo_url: string | null
  description: string | null; durability: number | null
  weapon_type: string | null; created_at: string
  equipped_by?: { character: { id: string; name: string } } | null
}

export default function WeaponDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [w, setW] = useState<Weapon | null>(null)

  useEffect(() => {
    fetch(`/api/weapons/${id}`).then(r => r.json()).then(setW)
  }, [id])

  const handleDelete = async () => {
    if (!confirm(`"${w?.name}"을 삭제할까요?`)) return
    await fetch(`/api/weapons/${id}`, { method: 'DELETE' })
    router.push('/weapons')
  }

  if (!w) return <div className="flex items-center justify-center h-screen text-muted-foreground">불러오는 중...</div>

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold flex-1">#{w.dex_number} {w.name}</h1>
        <Link href="/" className="p-2 rounded-full hover:bg-muted inline-flex">
          <Home size={18} />
        </Link>
        <div className="flex gap-1">
          {isAdmin && (
            <>
              <Link href={`/weapons/${id}/edit`} className="p-2 rounded-full hover:bg-muted inline-flex">
                <Pencil size={18} />
              </Link>
              <button onClick={handleDelete} className="p-2 rounded-full hover:bg-muted text-red-500">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="relative w-full aspect-square bg-muted">
        {w.photo_url ? (
          <Image src={w.photo_url} alt={w.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex items-center justify-center h-full text-8xl">⚔️</div>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        <div>
          <h2 className="text-2xl font-bold">{w.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {w.weapon_type ?? '종류없음'} · #{w.dex_number}
          </p>
        </div>

        {w.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{w.description}</p>
        )}

        {w.durability != null && (
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="font-medium">내구도</span>
              <span className="font-bold">{w.durability}</span>
            </div>
          </div>
        )}

        {w.equipped_by && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm">
              <span className="text-blue-500 font-semibold">장착 중</span>
              {' → '}
              <Link href={`/characters/${w.equipped_by.character.id}`} className="text-blue-600 underline">
                {w.equipped_by.character.name}
              </Link>
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          등록일 {new Date(w.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  )
}
