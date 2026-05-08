import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location')
  const search = searchParams.get('search')
  const attribute = searchParams.get('attribute')
  const race = searchParams.get('race')
  const sort = searchParams.get('sort') || 'dex_number'

  const characters = await prisma.character.findMany({
    where: {
      ...(location ? { location } : {}),
      ...(search ? { name: { contains: search } } : {}),
      ...(attribute ? { attributes: { has: attribute } } : {}),
      ...(race ? { race: { has: race } } : {}),
    },
    include: {
      equipped_weapons: {
        include: { weapon: { select: { id: true, name: true, photo_url: true, weapon_type: true } } },
        orderBy: { slot_position: 'asc' },
      },
    },
    orderBy:
      sort === 'name' ? { name: 'asc' } :
      sort === 'latest' ? { created_at: 'desc' } :
      { created_at: 'asc' },
  })

  if (sort === 'dex_number') {
    characters.sort((a, b) => {
      const aMin = a.dex_numbers.length > 0 ? Math.min(...a.dex_numbers) : 9999
      const bMin = b.dex_numbers.length > 0 ? Math.min(...b.dex_numbers) : 9999
      return aMin - bMin
    })
  }

  return NextResponse.json(characters)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const body = await req.json()

  let dexNums: number[] = []
  if (body.dex_numbers && body.dex_numbers.length > 0) {
    dexNums = body.dex_numbers.map(Number)
  } else {
    const allChars = await prisma.character.findMany({ select: { dex_numbers: true } })
    const allNums = allChars.flatMap(c => c.dex_numbers)
    const nextDex = allNums.length > 0 ? Math.max(...allNums) + 1 : 1
    dexNums = [nextDex]
  }

  const character = await prisma.character.create({
    data: {
      dex_numbers: dexNums,
      name: body.name,
      location: body.location,
      photo_url: body.photo_url ?? null,
      description: body.description ?? null,
      hp: body.hp ? Number(body.hp) : null,
      attack: body.attack ? Number(body.attack) : null,
      attributes: body.attributes ?? [],
      race: body.race ?? [],
      bonus_effects: body.bonus_effects ?? [],
    },
  })

  return NextResponse.json(character, { status: 201 })
}
