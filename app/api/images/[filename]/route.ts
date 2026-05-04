import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'D:/uploads/clay'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const safe = path.basename(filename)
  const filePath = path.join(UPLOAD_DIR, safe)

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buf = fs.readFileSync(filePath)
  const ext = path.extname(safe).toLowerCase()
  const mime =
    ext === '.png' ? 'image/png' :
    ext === '.gif' ? 'image/gif' :
    ext === '.webp' ? 'image/webp' :
    'image/jpeg'

  return new NextResponse(buf, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
