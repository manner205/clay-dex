'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { CharacterForm } from '@/components/CharacterForm'
import { useAdmin } from '@/components/AdminProvider'
import { useEffect } from 'react'

export default function NewCharacterPage() {
  const router = useRouter()
  const { isAdmin } = useAdmin()

  useEffect(() => {
    if (isAdmin === false) router.replace('/')
  }, [isAdmin, router])

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1">캐릭터 추가</h1>
        <Link href="/" className="p-2 rounded-full hover:bg-muted inline-flex">
          <Home size={18} />
        </Link>
      </header>
      <CharacterForm />
    </div>
  )
}
