# 클레이 도감 — 기술 스택 및 데이터 흐름

## 전체 구조 한눈에 보기

```
[친구 핸드폰 / 브라우저]
        ↓ HTTPS
[Tailscale Funnel] — 공개 URL: https://desktop-u7m999c.tailb434f9.ts.net
        ↓
[내 노트북 localhost:3000]
        ↓
[Next.js 16 앱] — d:\Claude-code-app\clay-book\
        ↓                    ↓
[PostgreSQL DB]        [D:\uploads\clay\]
localhost:5432           (사진 파일 저장)
database: claybook
```

---

## 기술 스택

| 역할 | 기술 | 설명 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) | 웹앱 전체 |
| 언어 | TypeScript | 타입 안전성 |
| DB | PostgreSQL 18 (로컬) | 캐릭터 데이터 저장 |
| ORM | Prisma 7 | DB 연결 및 쿼리 |
| Prisma 어댑터 | @prisma/adapter-pg | Prisma 7 필수 (Driver Adapter 방식) |
| 이미지 저장 | 로컬 파일시스템 | D:\uploads\clay\ |
| UI | Tailwind CSS + shadcn/ui | 모바일 우선 디자인 |
| 외부 접속 | Tailscale Funnel | 고정 공개 URL, 무료 |
| 인증 | HTTP-only 쿠키 | 관리자 세션 24시간 |

---

## 폴더 구조

```
clay-book/
├── app/
│   ├── page.tsx                      # 메인 목록 페이지 (/)
│   ├── layout.tsx                    # 전체 레이아웃, AdminProvider 감싸기
│   ├── characters/
│   │   ├── [id]/
│   │   │   ├── page.tsx              # 캐릭터 상세 (/characters/[id])
│   │   │   └── edit/page.tsx         # 캐릭터 수정 (관리자 전용)
│   │   └── new/page.tsx              # 캐릭터 추가 (관리자 전용)
│   └── api/
│       ├── characters/route.ts       # GET 목록, POST 추가
│       ├── characters/[id]/route.ts  # GET 상세, PUT 수정, DELETE 삭제
│       ├── upload/route.ts           # 이미지 업로드 → D:\uploads\clay\ 저장
│       ├── images/[filename]/route.ts # 저장된 이미지 서빙
│       └── admin/route.ts            # 관리자 로그인/로그아웃/상태확인
├── components/
│   ├── CharacterCard.tsx             # 목록 카드 UI
│   ├── CharacterForm.tsx             # 추가/수정 폼 (사진 업로드 포함)
│   ├── AttributeBadge.tsx            # 속성 뱃지 (색상 포함)
│   ├── StatBar.tsx                   # 체력/공격력 게이지 바
│   ├── AdminModal.tsx                # 비밀번호 입력 모달
│   └── AdminProvider.tsx             # 전역 관리자 상태 (React Context)
├── lib/
│   ├── prisma.ts                     # Prisma 싱글턴 (Driver Adapter 방식)
│   ├── constants.ts                  # 속성/종족/부과효과 목록 + 색상맵
│   └── generated/prisma/             # Prisma 자동생성 클라이언트 (수정 금지)
├── prisma/
│   └── schema.prisma                 # DB 스키마 정의
├── docs/
│   └── architecture.md              # 이 파일
├── workflows/
│   └── add-character.md              # 캐릭터 추가 업무 매뉴얼
├── start-claybook.bat                # 서버 시작 배치파일
├── next.config.ts                    # Next.js 설정 (allowedDevOrigins 포함)
├── .env.local                        # 환경변수 (DB URL, 관리자 비밀번호, 업로드 경로)
└── .env                              # Prisma CLI용 DB URL
```

---

## 데이터베이스 스키마

```prisma
model Character {
  id            String   @id @default(uuid())
  dex_number    Int      @unique          // 도감번호 (자동부여 가능)
  name          String                   // 캐릭터 이름 (필수)
  location      String                   // 보관장소: 장식장 | 7층집 | 텐트
  photo_url     String?                  // 이미지 URL (/api/images/파일명)
  description   String?                  // 특장점 설명
  hp            Int?                     // 체력
  attack        Int?                     // 공격력
  attributes    String[]                 // 속성 다중선택 (16종)
  race          String[]                 // 종족 다중선택 (19종)
  bonus_effects String[]                 // 부과효과 다중선택 (23종)
  created_at    DateTime @default(now()) // 제작일자 자동기록
  updated_at    DateTime @updatedAt      // 수정일자 자동기록

  @@map("characters")
}
```

**DB 접속 정보**
- 호스트: localhost:5432
- 데이터베이스: claybook
- 스키마: public
- 테이블: characters

**GUI 관리 도구**: pgAdmin 4 또는 `npx prisma studio` (localhost:5555)

---

## 데이터 흐름

### 캐릭터 목록 조회
```
브라우저 → GET /api/characters?location=장식장&search=호떡
         → Prisma → PostgreSQL SELECT
         → JSON 응답 → 화면 카드 렌더링
```

### 캐릭터 추가
```
관리자 → 폼 작성 + 사진 선택
       → POST /api/upload → 파일을 D:\uploads\clay\에 저장 → URL 반환
       → POST /api/characters → Prisma INSERT → DB 저장
       → 상세 페이지로 이동
```

### 이미지 서빙
```
브라우저 → GET /api/images/1234567890.jpg
         → app/api/images/[filename]/route.ts
         → D:\uploads\clay\1234567890.jpg 파일 읽기
         → Content-Type: image/jpeg 로 응답
```

### 관리자 인증
```
자물쇠 클릭 → 비밀번호 입력
            → POST /api/admin → .env.local의 ADMIN_PASSWORD와 비교
            → 일치하면 HTTP-only 쿠키 'admin=true' 설정 (24시간)
            → 이후 모든 수정/삭제 API는 쿠키 확인
```

---

## 환경변수 (.env.local)

```
DATABASE_URL="postgresql://postgres:비밀번호@localhost:5432/claybook"
ADMIN_PASSWORD=관리자비밀번호
UPLOAD_DIR=D:/uploads/clay
```

---

## Prisma 7 주의사항

Prisma 7부터 `new PrismaClient()` 단독 사용 불가. 반드시 Driver Adapter 필요.

```typescript
// lib/prisma.ts
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}
```

---

## 스키마 변경 방법

1. `prisma/schema.prisma` 수정
2. `npx prisma db push` (개발 중, 데이터 손실 주의)
   또는 `npx prisma migrate dev --name 변경명` (마이그레이션 파일 생성)
3. `npx prisma generate` (클라이언트 재생성)
4. Next.js 서버 재시작

---

## 서버 실행 방법

### 개발 모드 (코드 수정 중)
```
cd d:\Claude-code-app\clay-book
npm run dev
```

### 프로덕션 모드 (개발 완료 후)
```
cd d:\Claude-code-app\clay-book
npm run build   ← 기존 서버 먼저 종료 후 실행
npm start
```

> 기존 서버가 실행 중이면 `EADDRINUSE: port 3000` 오류 발생.
> 반드시 기존 PowerShell 창 닫고(또는 Ctrl+C) 실행할 것.

---

## Tailscale Funnel

- **고정 URL**: `https://desktop-u7m999c.tailb434f9.ts.net`
- 노트북 켜고 Next.js 실행 중이면 친구들 접속 가능
- 친구 핸드폰에 Tailscale 설치 불필요
- Funnel 자체는 자동 실행 (Windows 서비스)
- Next.js 서버만 켜져 있으면 됨

**Funnel 상태 확인**:
```
& "C:\Program Files\Tailscale\tailscale.exe" funnel status
```

---

## 자동 시작 (Windows 작업 스케줄러)

- 작업 이름: "ClayBook Server"
- 트리거: 로그인 시 자동 실행
- 실행 파일: `start-claybook.bat`
- 현재 설정: `npm run dev` (개발 완료 후 `npm start`로 변경 예정)
