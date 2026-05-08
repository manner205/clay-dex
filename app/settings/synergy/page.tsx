'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdmin } from '@/components/AdminProvider'
import { ATTRIBUTES } from '@/lib/constants'
import { AttributeBadge } from '@/components/AttributeBadge'

type SynergySetting = {
  id?: string
  attribute: string
  bonus_type: string
  bonus_value: number
}

export default function SynergySettingsPage() {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [settings, setSettings] = useState<Map<string, SynergySetting>>(new Map())
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin === false) { router.replace('/'); return }
    fetch('/api/synergy')
      .then(r => r.json())
      .then((list: SynergySetting[]) => {
        const map = new Map<string, SynergySetting>()
        for (const s of list) map.set(s.attribute, s)
        setSettings(map)
      })
  }, [isAdmin, router])

  const updateLocal = (attr: string, field: keyof SynergySetting, value: string | number) => {
    setSettings(prev => {
      const next = new Map(prev)
      const existing = next.get(attr) ?? { attribute: attr, bonus_type: 'fixed', bonus_value: 10 }
      next.set(attr, { ...existing, [field]: value })
      return next
    })
  }

  const saveSetting = async (attr: string) => {
    const setting = settings.get(attr)
    if (!setting) return
    setSaving(attr)
    const res = await fetch('/api/synergy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attribute: attr,
        bonus_type: setting.bonus_type,
        bonus_value: Number(setting.bonus_value),
      }),
    })
    setSaving(null)
    if (res.ok) {
      const saved = await res.json()
      setSettings(prev => {
        const next = new Map(prev)
        next.set(attr, saved)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold flex-1">시너지 설정</h1>
        <Link href="/" className="p-2 rounded-full hover:bg-muted inline-flex">
          <Home size={18} />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          캐릭터 속성과 무기 속성이 일치하면 추가 보너스를 설정합니다.
          <br />
          <strong>고정값</strong>: 일치 시 체력/공격력에 고정값 추가
          <br />
          <strong>퍼센트</strong>: 일치 시 해당 캐릭터 스탯의 n% 추가
        </p>

        {ATTRIBUTES.map(attr => {
          const setting = settings.get(attr)
          const bonusType = setting?.bonus_type ?? 'fixed'
          const bonusValue = setting?.bonus_value ?? 0

          return (
            <div key={attr} className="flex items-center gap-2 p-3 rounded-xl border bg-card">
              <div className="w-20">
                <AttributeBadge name={attr} />
              </div>
              <select
                className="border rounded-md px-2 py-1.5 text-sm bg-background w-24"
                value={bonusType}
                onChange={e => updateLocal(attr, 'bonus_type', e.target.value)}
              >
                <option value="fixed">고정값</option>
                <option value="percent">퍼센트</option>
              </select>
              <Input
                type="number"
                className="w-20"
                value={bonusValue}
                onChange={e => updateLocal(attr, 'bonus_value', Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground">
                {bonusType === 'fixed' ? '+' + bonusValue : bonusValue + '%'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveSetting(attr)}
                disabled={saving === attr}
              >
                <Save size={14} />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
