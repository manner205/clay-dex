import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import sharp from 'sharp'

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'D:/uploads/clay'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin')?.value !== 'true') {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: '파일 없음' }, { status: 400 })

  const filename = `${Date.now()}.jpg`
  const dest = path.join(UPLOAD_DIR, filename)

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const buf = Buffer.from(await file.arrayBuffer())
  await sharp(buf)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(dest)

  return NextResponse.json({ url: `/api/images/${filename}` })
}
