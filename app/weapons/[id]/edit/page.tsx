// 2026-05-04: 臾닿린 ?섏젙 ?섏씠吏
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { WeaponForm } from '@/components/WeaponForm'
import { useAdmin } from '@/components/AdminProvider'

export default function EditWeaponPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (isAdmin === false) { router.replace('/weapons'); return }
    fetch(`/api/weapons/${id}`)
      .then(r => r.json())
      .then(w => setInitial({
        ...w,
        dex_number: w.dex_number != null ? String(w.dex_number) : '',
        hp_bonus: w.hp_bonus != null ? String(w.hp_bonus) : '0',
        attack_bonus: w.attack_bonus != null ? String(w.attack_bonus) : '0',
        weapon_type: w.weapon_type ?? '',
      }))
  }, [id, isAdmin, router])

  if (!initial) return <div className="flex items-center justify-center h-screen text-muted-foreground">불러오는 중...</div>

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1">무기 수정</h1>
        <Link href="/" className="p-2 rounded-full hover:bg-muted inline-flex">
          <Home size={18} />
        </Link>
      </header>
      <WeaponForm initial={initial as Parameters<typeof WeaponForm>[0]['initial']} weaponId={id} />
    </div>
  )
}
