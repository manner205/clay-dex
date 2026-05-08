'use client'
import Image from 'next/image'

type EquippedWeapon = {
  id: string
  slot_position: number
  weapon: {
    id: string
    name: string
    photo_url: string | null
    hp_bonus: number
    attack_bonus: number
    weapon_type: string | null
  }
}

type Props = {
  slots: EquippedWeapon[]
  isAdmin: boolean
  onSlotClick: (slotPosition: number) => void
  onUnequip: (slotPosition: number) => void
}

const MAX_SLOTS = 5

export function EquipSlots({ slots, isAdmin, onSlotClick, onUnequip }: Props) {
  const slotMap = new Map(slots.map(s => [s.slot_position, s]))

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-muted-foreground">장착 무기 (최대 {MAX_SLOTS})</span>
      <div className="flex gap-2">
        {Array.from({ length: MAX_SLOTS }, (_, i) => i + 1).map(pos => {
          const equipped = slotMap.get(pos)
          return (
            <div key={pos} className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  if (!isAdmin) return
                  if (equipped) {
                    if (confirm(`"${equipped.weapon.name}"을 탈착할까요?`)) {
                      onUnequip(pos)
                    }
                  } else {
                    onSlotClick(pos)
                  }
                }}
                className={`relative w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                  equipped
                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                    : isAdmin
                      ? 'border-dashed border-muted-foreground/30 bg-muted hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'
                      : 'border-dashed border-muted-foreground/20 bg-muted'
                }`}
              >
                {equipped ? (
                  equipped.weapon.photo_url ? (
                    <Image
                      src={equipped.weapon.photo_url}
                      alt={equipped.weapon.name}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  ) : (
                    <span className="text-lg">⚔️</span>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground/50">{pos}</span>
                )}
              </button>
              <span className="text-[10px] text-muted-foreground truncate max-w-14 text-center">
                {equipped ? equipped.weapon.name : '빈 슬롯'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
