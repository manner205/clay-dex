'use client'
import { calculateStats } from '@/lib/synergy'

type Weapon = {
  hp_bonus: number
  attack_bonus: number
  attributes: string[]
}

type SynergySetting = {
  attribute: string
  bonus_type: string
  bonus_value: number
}

type Props = {
  baseHp: number | null
  baseAttack: number | null
  characterAttributes: string[]
  weapons: Weapon[]
  synergySettings: SynergySetting[]
}

export function CombinedStats({ baseHp, baseAttack, characterAttributes, weapons, synergySettings }: Props) {
  const hp = baseHp ?? 0
  const atk = baseAttack ?? 0

  if (weapons.length === 0) return null

  const stats = calculateStats(characterAttributes, hp, atk, weapons, synergySettings)

  return (
    <div className="space-y-3 p-4 rounded-xl bg-muted/50 border">
      <span className="text-xs font-semibold text-muted-foreground">무기 장착 합산 스탯</span>

      {/* 체력 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium w-12">체력</span>
          <span>{hp}</span>
          {stats.totalHpBonus > 0 && (
            <span className="text-green-600 font-medium">(+{stats.totalHpBonus})</span>
          )}
          {stats.synergyHpBonus > 0 && (
            <span className="text-amber-500 font-medium">[시너지+{stats.synergyHpBonus}]</span>
          )}
          <span className="font-bold">= {stats.finalHp}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full flex">
            <div
              className="h-full bg-green-500"
              style={{ width: `${Math.min(100, (hp / 999) * 100)}%` }}
            />
            {stats.totalHpBonus > 0 && (
              <div
                className="h-full bg-green-300"
                style={{ width: `${Math.min(100 - (hp / 999) * 100, (stats.totalHpBonus / 999) * 100)}%` }}
              />
            )}
            {stats.synergyHpBonus > 0 && (
              <div
                className="h-full bg-amber-400"
                style={{ width: `${Math.min(100 - ((hp + stats.totalHpBonus) / 999) * 100, (stats.synergyHpBonus / 999) * 100)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 공격력 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium w-12">공격력</span>
          <span>{atk}</span>
          {stats.totalAttackBonus > 0 && (
            <span className="text-red-500 font-medium">(+{stats.totalAttackBonus})</span>
          )}
          {stats.synergyAttackBonus > 0 && (
            <span className="text-amber-500 font-medium">[시너지+{stats.synergyAttackBonus}]</span>
          )}
          <span className="font-bold">= {stats.finalAttack}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full flex">
            <div
              className="h-full bg-red-500"
              style={{ width: `${Math.min(100, (atk / 50) * 100)}%` }}
            />
            {stats.totalAttackBonus > 0 && (
              <div
                className="h-full bg-red-300"
                style={{ width: `${Math.min(100 - (atk / 50) * 100, (stats.totalAttackBonus / 50) * 100)}%` }}
              />
            )}
            {stats.synergyAttackBonus > 0 && (
              <div
                className="h-full bg-amber-400"
                style={{ width: `${Math.min(100 - ((atk + stats.totalAttackBonus) / 50) * 100, (stats.synergyAttackBonus / 50) * 100)}%` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
