import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

const MAX_SLOTS = 5

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: characterId } = await params

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      equipped_weapons: {
        include: { weapon: true },
        orderBy: { slot_position: 'asc' },
      },
    },
  })

  if (!character) return NextResponse.json({ error: '캐릭터 없음' }, { status: 404 })

  const synergySettings = await prisma.synergySetting.findMany()

  return NextResponse.json({
    equipped_weapons: character.equipped_weapons,
    synergy_settings: synergySettings,
  })
}

export async function POST(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id: characterId } = await params
  const body = await req.json()
  const { weapon_id, slot_position } = body

  if (!weapon_id || !slot_position) {
    return NextResponse.json({ error: 'weapon_id와 slot_position 필수' }, { status: 400 })
  }

  if (slot_position < 1 || slot_position > MAX_SLOTS) {
    return NextResponse.json({ error: `슬롯은 1~${MAX_SLOTS} 사이여야 합니다` }, { status: 400 })
  }

  const existingEquip = await prisma.characterWeapon.findUnique({
    where: { weapon_id },
    include: { character: { select: { name: true } } },
  })
  if (existingEquip) {
    return NextResponse.json(
      { error: `이 무기는 "${existingEquip.character.name}"에 이미 장착돼 있습니다` },
      { status: 409 }
    )
  }

  await prisma.characterWeapon.deleteMany({
    where: { character_id: characterId, slot_position },
  })

  const equipped = await prisma.characterWeapon.create({
    data: {
      character_id: characterId,
      weapon_id,
      slot_position,
    },
    include: { weapon: true },
  })

  return NextResponse.json(equipped, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id: characterId } = await params
  const { searchParams } = new URL(req.url)
  const slotPosition = Number(searchParams.get('slot'))

  if (!slotPosition || slotPosition < 1 || slotPosition > MAX_SLOTS) {
    return NextResponse.json({ error: '유효한 slot 번호를 입력하세요 (1~5)' }, { status: 400 })
  }

  await prisma.characterWeapon.deleteMany({
    where: { character_id: characterId, slot_position: slotPosition },
  })

  return NextResponse.json({ ok: true })
}
