import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  const settings = await prisma.synergySetting.findMany({
    orderBy: { attribute: 'asc' },
  })
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const body = await req.json()
  const { attribute, bonus_type, bonus_value } = body

  if (!attribute) {
    return NextResponse.json({ error: 'attribute 필수' }, { status: 400 })
  }

  if (bonus_type && !['fixed', 'percent'].includes(bonus_type)) {
    return NextResponse.json({ error: 'bonus_type은 fixed 또는 percent' }, { status: 400 })
  }

  const setting = await prisma.synergySetting.upsert({
    where: { attribute },
    update: {
      bonus_type: bonus_type ?? 'fixed',
      bonus_value: bonus_value != null ? Number(bonus_value) : 10,
    },
    create: {
      attribute,
      bonus_type: bonus_type ?? 'fixed',
      bonus_value: bonus_value != null ? Number(bonus_value) : 10,
    },
  })

  return NextResponse.json(setting)
}
