'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WEAPON_TYPES } from '@/lib/constants'

type FormData = {
  dex_number: string; name: string; photo_url: string
  description: string; durability: string; weapon_type: string
}

const defaultForm: FormData = {
  dex_number: '', name: '', photo_url: '',
  description: '', durability: '', weapon_type: '',
}

type Props = {
  initial?: Partial<FormData>
  weaponId?: string
}

async function cropAndRotateToBlob(file: File, cropArea: Area, degrees: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image' as ImageOrientation,
  })
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = cropArea.width
  cropCanvas.height = cropArea.height
  const cropCtx = cropCanvas.getContext('2d')!
  cropCtx.drawImage(bitmap, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height)
  bitmap.close()

  const swap = degrees === 90 || degrees === 270
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = swap ? cropArea.height : cropArea.width
  finalCanvas.height = swap ? cropArea.width : cropArea.height
  const finalCtx = finalCanvas.getContext('2d')!
  finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2)
  finalCtx.rotate((degrees * Math.PI) / 180)
  finalCtx.drawImage(cropCanvas, -cropArea.width / 2, -cropArea.height / 2)

  return new Promise((resolve) => {
    finalCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92)
  })
}

export function WeaponForm({ initial, weaponId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ ...defaultForm, ...initial })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(initial?.photo_url || '')
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState('')
  const [rotation, setRotation] = useState(0)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleFileSelect = (file: File) => {
    setLocalFile(file)
    setLocalPreviewUrl(URL.createObjectURL(file))
    setRotation(0)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const handleCropExisting = async () => {
    if (!preview) return
    const res = await fetch(preview)
    const blob = await res.blob()
    handleFileSelect(new File([blob], 'existing.jpg', { type: blob.type || 'image/jpeg' }))
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const uploadImage = async (): Promise<string | null> => {
    if (!localFile || !croppedAreaPixels) return null
    setUploading(true)
    const blob = await cropAndRotateToBlob(localFile, croppedAreaPixels, rotation)
    const fd = new FormData()
    fd.append('file', blob, localFile.name)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) {
      set('photo_url', data.url)
      setPreview(data.url)
      setLocalFile(null)
      setLocalPreviewUrl('')
      return data.url
    }
    return null
  }

  const submit = async () => {
    if (!form.name) return alert('이름을 입력하세요')
    setSaving(true)

    let photoUrl = form.photo_url
    if (localFile && croppedAreaPixels) {
      const uploaded = await uploadImage()
      if (uploaded) photoUrl = uploaded
    }

    const url = weaponId ? `/api/weapons/${weaponId}` : '/api/weapons'
    const method = weaponId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        photo_url: photoUrl,
        dex_number: form.dex_number ? Number(form.dex_number) : undefined,
        durability: form.durability ? Number(form.durability) : null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const w = await res.json()
      router.push(`/weapons/${w.id}`)
    } else {
      alert('저장 실패')
    }
  }

  return (
    <div className="space-y-5 p-4">
      {/* 사진 */}
      <div className="space-y-2">
        <Label>무기 사진</Label>
        {localFile ? (
          <div className="space-y-3">
            <div className="relative w-full rounded-xl border-2 overflow-hidden bg-black" style={{ height: '300px' }}>
              <Cropper
                image={localPreviewUrl}
                crop={crop} zoom={zoom} aspect={1} rotation={rotation}
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
                style={{ containerStyle: { borderRadius: '12px' } }}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>축소</span><span>기본/확대</span><span>확대</span>
              </div>
              <input type="range" min={1} max={5} step={0.05} value={zoom}
                onChange={e => setZoom(Number(e.target.value))} className="w-full accent-foreground" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1"
                onClick={() => setRotation(r => (r - 90 + 360) % 360)}>↺ 왼쪽 회전</Button>
              <Button type="button" variant="outline" className="flex-1"
                onClick={() => setRotation(r => (r + 90) % 360)}>↻ 오른쪽 회전</Button>
            </div>
            <Button type="button" className="w-full" onClick={() => uploadImage()} disabled={uploading}>
              {uploading ? '업로드 중...' : '이 사진 사용하기'}
            </Button>
            <Button type="button" variant="ghost" className="w-full text-muted-foreground"
              onClick={() => { setLocalFile(null); setLocalPreviewUrl('') }}>취소</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="relative w-full aspect-square rounded-xl border-2 border-dashed bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
              ) : (
                <span className="text-muted-foreground text-sm">사진 선택</span>
              )}
            </div>
            {preview && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCropExisting}>기존 사진 편집</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>사진 변경</Button>
              </div>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>도감번호</Label>
          <Input placeholder="자동입력" value={form.dex_number}
            onChange={e => set('dex_number', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>무기 종류</Label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            value={form.weapon_type} onChange={e => set('weapon_type', e.target.value)}>
            <option value="">선택 안 함</option>
            {WEAPON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>이름 *</Label>
        <Input placeholder="무기 이름" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>내구도</Label>
        <Input type="number" placeholder="숫자 입력" value={form.durability}
          onChange={e => set('durability', e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>설명</Label>
        <Textarea placeholder="이 무기에 대한 설명..." value={form.description}
          onChange={e => set('description', e.target.value)} rows={3} />
      </div>

      <Button className="w-full" onClick={submit} disabled={saving || uploading}>
        {saving ? '저장 중...' : weaponId ? '수정 완료' : '무기 추가'}
      </Button>
    </div>
  )
}
