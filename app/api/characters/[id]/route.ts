import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const character = await prisma.character.findUnique({ where: { id } })
  if (!character) return NextResponse.json({ error: '없음' }, { status: 404 })
  return NextResponse.json(character)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const character = await prisma.character.update({
    where: { id },
    data: {
      dex_numbers: body.dex_numbers ? body.dex_numbers.map(Number) : undefined,
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

  return NextResponse.json(character)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id } = await params
  await prisma.character.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
