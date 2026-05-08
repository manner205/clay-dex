import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const weaponType = searchParams.get('weapon_type')
    const sort = searchParams.get('sort') || 'dex_number'
    const available = searchParams.get('available')

    const weapons = await prisma.weapon.findMany({
      where: {
        ...(search ? { name: { contains: search } } : {}),
        ...(weaponType ? { weapon_type: weaponType } : {}),
        ...(available === 'true' ? { equipped_by: null } : {}),
      },
      include: {
        equipped_by: {
          include: { character: { select: { id: true, name: true } } },
        },
      },
      orderBy:
        sort === 'name' ? { name: 'asc' } :
        sort === 'latest' ? { created_at: 'desc' } :
        { dex_number: 'asc' },
    })

    return NextResponse.json(weapons)
  } catch (e) {
    console.error('[GET /api/weapons]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    if (cookieStore.get('admin')?.value !== 'true') {
      return NextResponse.json({ error: '권한 없음' }, { status: 401 })
    }

    const body = await req.json()

    let dexNumber = body.dex_number ? Number(body.dex_number) : null
    if (!dexNumber) {
      const last = await prisma.weapon.findFirst({ orderBy: { dex_number: 'desc' } })
      dexNumber = last ? last.dex_number + 1 : 1
    }

    const weapon = await prisma.weapon.create({
      data: {
        dex_number: dexNumber,
        name: body.name,
        photo_url: body.photo_url ?? null,
        description: body.description ?? null,
        durability: body.durability ? Number(body.durability) : null,
        weapon_type: body.weapon_type ?? null,
      },
    })

    return NextResponse.json(weapon, { status: 201 })
  } catch (e) {
    console.error('[POST /api/weapons]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
