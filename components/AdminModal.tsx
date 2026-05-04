'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = { onClose: () => void; onSuccess: () => void }

export function AdminModal({ onClose, onSuccess }: Props) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    setLoading(false)
    if (res.ok) { onSuccess() } else { setError('비밀번호가 틀렸습니다') }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-md mx-auto bg-background rounded-t-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold">관리자 로그인</h2>
        <Input
          type="password"
          placeholder="비밀번호 입력"
          value={pw}
          onChange={e => { setPw(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>취소</Button>
          <Button className="flex-1" onClick={submit} disabled={loading}>
            {loading ? '확인 중...' : '로그인'}
          </Button>
        </div>
      </div>
    </div>
  )
}
