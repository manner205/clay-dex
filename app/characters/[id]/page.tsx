'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, Share2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AttributeBadge } from '@/components/AttributeBadge'
import { StatBar } from '@/components/StatBar'
import { useAdmin } from '@/components/AdminProvider'

type Character = {
  id: string; dex_numbers: number[]; name: string; location: string
  photo_url: string | null; description: string | null
  hp: number | null; attack: number | null
  attributes: string[]; race: string[]; bonus_effects: string[]
  created_at: string
}

function formatDex(nums: number[]): string {
  if (!nums || nums.length === 0) return '?'
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? `${min}` : `${min}~${max}`
}

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [c, setC] = useState<Character | null>(null)

  useEffect(() => {
    fetch(`/api/characters/${id}`)
      .then(r => r.json())
      .then(setC)
  }, [id])

  const handleDelete = async () => {
    if (!confirm(`"${c?.name}"을 삭제할까요?`)) return
    await fetch(`/api/characters/${id}`, { method: 'DELETE' })
    router.push('/')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: c?.name ?? '클레이 도감', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사됐습니다!')
    }
  }

  if (!c) return <div className="flex items-center justify-center h-screen text-muted-foreground">불러오는 중...</div>

  return (
    <div className="pb-8">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold flex-1">#{formatDex(c.dex_numbers)} {c.name}</h1>
        <Link href="/" className="p-2 rounded-full hover:bg-muted inline-flex">
          <Home size={18} />
        </Link>
        <div className="flex gap-1">
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted">
            <Share2 size={18} />
          </button>
          {isAdmin && (
            <>
              <Link href={`/characters/${id}/edit`} className="p-2 rounded-full hover:bg-muted inline-flex">
                <Pencil size={18} />
              </Link>
              <button onClick={handleDelete} className="p-2 rounded-full hover:bg-muted text-red-500">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* 사진 */}
      <div className="relative w-full aspect-square bg-muted">
        {c.photo_url ? (
          <Image src={c.photo_url} alt={c.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex items-center justify-center h-full text-8xl">🧱</div>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-2xl font-bold">{c.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {c.location} · #{formatDex(c.dex_numbers)}
          </p>
        </div>

        {c.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
        )}

        {/* 속성치 */}
        {(c.hp != null || c.attack != null) && (
          <div className="space-y-3 p-4 rounded-xl bg-muted/50">
            <StatBar label="체력" value={c.hp} color="#22c55e" />
            <StatBar label="공격력" value={c.attack} max={50} color="#ef4444" />
          </div>
        )}

        {/* 속성 · 종족 · 부과효과 */}
        {(c.attributes.length > 0 || c.race.length > 0 || c.bonus_effects.length > 0) && (
          <div className="space-y-3 p-4 rounded-xl bg-muted/50">
            {c.attributes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">속성</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.attributes.map(a => <AttributeBadge key={a} name={a} />)}
                </div>
              </div>
            )}
            {c.race.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">종족</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.race.map(r => (
                    <span key={r} className="inline-block rounded-full px-2 py-0.5 text-xs bg-background border">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {c.bonus_effects.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">부과효과</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.bonus_effects.map(b => (
                    <span key={b} className="inline-block rounded-full px-2 py-0.5 text-xs bg-muted border">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 등록일 */}
        <p className="text-xs text-muted-foreground">
          등록일 {new Date(c.created_at).toLocaleDateString('ko-KR')}
        </p>

        <Button variant="outline" className="w-full" onClick={handleShare}>
          <Share2 size={16} className="mr-2" /> 링크 공유
        </Button>
      </div>
    </div>
  )
}
