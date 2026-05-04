import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '비밀번호 틀림' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin', 'true', {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin')
  return res
}

export async function GET() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('admin')?.value === 'true'
  return NextResponse.json({ isAdmin })
}
