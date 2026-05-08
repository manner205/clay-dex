import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const weapon = await prisma.weapon.findUnique({
    where: { id },
    include: {
      equipped_by: {
        include: { character: { select: { id: true, name: true } } },
      },
    },
  })
  if (!weapon) return NextResponse.json({ error: '무기 없음' }, { status: 404 })
  return NextResponse.json(weapon)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const weapon = await prisma.weapon.update({
    where: { id },
    data: {
      dex_number: body.dex_number ? Number(body.dex_number) : undefined,
      name: body.name,
      photo_url: body.photo_url ?? null,
      description: body.description ?? null,
      durability: body.durability ? Number(body.durability) : null,
      weapon_type: body.weapon_type ?? null,
    },
  })

  return NextResponse.json(weapon)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id } = await params
  await prisma.weapon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
