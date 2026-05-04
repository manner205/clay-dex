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
import { LOCATIONS, ATTRIBUTES, RACES, BONUS_EFFECTS } from '@/lib/constants'
import { AttributeBadge } from '@/components/AttributeBadge'

type FormData = {
  dex_numbers: string; name: string; location: string; photo_url: string
  description: string; hp: string; attack: string
  attributes: string[]; race: string[]; bonus_effects: string[]
}

const defaultForm: FormData = {
  dex_numbers: '', name: '', location: '7층집', photo_url: '',
  description: '', hp: '', attack: '', attributes: [], race: [], bonus_effects: [],
}

type Props = {
  initial?: Partial<FormData>
  characterId?: string
}

async function cropAndRotateToBlob(file: File, cropArea: Area, degrees: number): Promise<Blob> {
  // EXIF 회전을 픽셀에 구워 넣은 bitmap 생성
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image' as ImageOrientation,
  })

  // 1단계: 크롭
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = cropArea.width
  cropCanvas.height = cropArea.height
  const cropCtx = cropCanvas.getContext('2d')!
  cropCtx.drawImage(
    bitmap,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
    0, 0, cropArea.width, cropArea.height,
  )
  bitmap.close()

  // 2단계: 회전
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

export function CharacterForm({ initial, characterId }: Props) {
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

  const set = (k: keyof FormData, v: string | string[]) =>
    setForm(f => ({ ...f, [k]: v }))

  const toggleArr = (k: 'attributes' | 'bonus_effects' | 'race', val: string) => {
    setForm(f => ({
      ...f,
      [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val],
    }))
  }

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
    const file = new File([blob], 'existing.jpg', { type: blob.type || 'image/jpeg' })
    handleFileSelect(file)
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const uploadImage = async () => {
    if (!localFile || !croppedAreaPixels) return
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
    }
  }

  const submit = async () => {
    if (!form.name || !form.location) return alert('이름과 보관 장소는 필수입니다')
    setSaving(true)
    const url = characterId ? `/api/characters/${characterId}` : '/api/characters'
    const method = characterId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        dex_numbers: form.dex_numbers
          ? form.dex_numbers.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
          : undefined,
        hp: form.hp ? Number(form.hp) : null,
        attack: form.attack ? Number(form.attack) : null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const c = await res.json()
      router.push(`/characters/${c.id}`)
    } else {
      alert('저장 실패')
    }
  }

  return (
    <div className="space-y-5 p-4">
      {/* 사진 */}
      <div className="space-y-2">
        <Label>캐릭터 사진</Label>

        {localFile ? (
          <div className="space-y-3">
            {/* 크롭 영역 */}
            <div className="relative w-full rounded-xl border-2 overflow-hidden bg-black" style={{ height: '300px' }}>
              <Cropper
                image={localPreviewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                rotation={rotation}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { borderRadius: '12px' },
                }}
              />
            </div>

            {/* 줌 슬라이더 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>축소</span>
                <span>확대/크롭</span>
                <span>확대</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full accent-foreground"
              />
            </div>

            {/* 회전 버튼 */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1"
                onClick={() => setRotation(r => (r - 90 + 360) % 360)}>
                ↺ 왼쪽 회전
              </Button>
              <Button type="button" variant="outline" className="flex-1"
                onClick={() => setRotation(r => (r + 90) % 360)}>
                ↻ 오른쪽 회전
              </Button>
            </div>

            <Button type="button" className="w-full" onClick={uploadImage} disabled={uploading}>
              {uploading ? '업로드 중...' : '이 사진 사용하기'}
            </Button>
            <Button type="button" variant="ghost" className="w-full text-muted-foreground"
              onClick={() => { setLocalFile(null); setLocalPreviewUrl('') }}>
              취소
            </Button>
          </div>
        ) : (
          /* 사진 선택 영역 (업로드 완료 or 미선택) */
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
                <Button type="button" variant="outline" className="flex-1"
                  onClick={handleCropExisting}>
                  ✂️ 크롭 편집
                </Button>
                <Button type="button" variant="outline" className="flex-1"
                  onClick={() => fileRef.current?.click()}>
                  사진 변경
                </Button>
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
          <Input placeholder="자동부여 (복수: 19,20,21)" value={form.dex_numbers}
            onChange={e => set('dex_numbers', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>보관 장소 *</Label>
          <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            value={form.location} onChange={e => set('location', e.target.value)}>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>이름 *</Label>
        <Input placeholder="캐릭터 이름" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>특장점 설명</Label>
        <Textarea placeholder="이 캐릭터의 특징..." value={form.description}
          onChange={e => set('description', e.target.value)} rows={3} />
      </div>

      {/* 속성치 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>체력</Label>
          <Input type="number" placeholder="0" value={form.hp} onChange={e => set('hp', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>공격력</Label>
          <Input type="number" placeholder="0" min={0} max={50} value={form.attack} onChange={e => set('attack', e.target.value)} />
        </div>
      </div>

      {/* 속성 */}
      <div className="space-y-2">
        <Label>속성 (다중 선택)</Label>
        <div className="flex flex-wrap gap-2">
          {ATTRIBUTES.map(a => (
            <button key={a} type="button" onClick={() => toggleArr('attributes', a)}
              className={`rounded-full border px-2 py-1 text-xs transition-colors ${
                form.attributes.includes(a) ? 'bg-foreground text-background border-foreground' : 'border-muted-foreground/30'
              }`}>
              {a}
            </button>
          ))}
        </div>
        {form.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {form.attributes.map(a => <AttributeBadge key={a} name={a} />)}
          </div>
        )}
      </div>

      {/* 종족 */}
      <div className="space-y-2">
        <Label>종족 (다중 선택)</Label>
        <div className="flex flex-wrap gap-2">
          {RACES.map(r => (
            <button key={r} type="button" onClick={() => toggleArr('race', r)}
              className={`rounded-full border px-2 py-1 text-xs transition-colors ${
                form.race.includes(r) ? 'bg-foreground text-background border-foreground' : 'border-muted-foreground/30'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 부과효과 */}
      <div className="space-y-2">
        <Label>부과효과 (다중 선택)</Label>
        <div className="flex flex-wrap gap-2">
          {BONUS_EFFECTS.map(b => (
            <button key={b} type="button" onClick={() => toggleArr('bonus_effects', b)}
              className={`rounded-full border px-2 py-1 text-xs transition-colors ${
                form.bonus_effects.includes(b) ? 'bg-foreground text-background border-foreground' : 'border-muted-foreground/30'
              }`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={submit} disabled={saving || uploading}>
        {saving ? '저장 중...' : characterId ? '수정 완료' : '캐릭터 추가'}
      </Button>
    </div>
  )
}
