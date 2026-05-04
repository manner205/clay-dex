e# CHANGELOG

## 2026-05-02 (3차 작업)

### 크롭+줌 기능 추가 (`components/CharacterForm.tsx`)
- `react-easy-crop` 라이브러리 설치 및 적용
- 사진 선택 후 300px 높이 크롭 UI 표시 (드래그로 위치 조정)
- 줌 슬라이더(1x~5x)로 캐릭터 확대 후 정사각형 크롭 가능
- 회전 버튼은 크롭 결과에 추가 적용
- `cropAndRotateToBlob()`: EXIF 보정 → 크롭 → 회전 순서로 Canvas 처리
- "제작일" → "등록일" 문구 변경 (`app/characters/[id]/page.tsx`)

## 2026-05-02 (2차 작업)

### 도감번호 다중 지원 (형제 슬롯)
- DB 스키마 변경: `dex_number Int @unique` → `dex_numbers Int[]` (배열로 여러 번호 저장)
- 폼 입력: 숫자 하나 → 쉼표 구분 텍스트 (예: `19,20,21,22,23`)
- 표기: 단일 번호면 `#19`, 복수면 `#19~23` (최솟값~최댓값) 형식
- 도감번호순 정렬: Prisma 배열 정렬 한계로 JS에서 min 기준 정렬
- 수정된 파일: `prisma/schema.prisma`, `api/characters/route.ts`, `api/characters/[id]/route.ts`, `CharacterForm.tsx`, `CharacterCard.tsx`, `characters/[id]/page.tsx`, `characters/[id]/edit/page.tsx`, `page.tsx`

## 2026-05-02 (1차 작업)

### UI 수정 3건
- **공격력 최대값 50 적용**: CharacterForm 입력 `max=50`, StatBar 바 기준도 50으로 변경 (기존 999)
- **보관 장소 기본값 변경**: `장식장` → `7층집`
- **속성·종족·부과효과 통합 표시**: 상세 페이지에서 세 항목을 하나의 회색 박스 안에 라벨별로 묶어 표기. 종족은 헤더 텍스트에서 제거

## 2026-05-01 (5차 작업)

### 사진 회전 기능 추가 + EXIF 버그 수정 (`components/CharacterForm.tsx`)
- 사진 선택 시 바로 업로드 안 하고 로컬 미리보기 먼저 표시
- "↺ 왼쪽 회전" / "↻ 오른쪽 회전" 버튼으로 90도 단위 방향 조정 가능
- "이 사진 사용하기" 클릭 시 Canvas API로 회전을 이미지에 실제 적용 후 서버 업로드
- **EXIF 버그 수정**: iPhone 사진은 EXIF 회전 메타데이터를 가짐. 브라우저 `<img>`는 이를 자동 보정해 미리보기가 정상으로 보이지만, Canvas는 EXIF를 무시해 저장 후 돌아감. `createImageBitmap({ imageOrientation: 'from-image' })`로 EXIF를 픽셀에 구워넣어 해결
- 회전 0도여도 항상 Canvas 처리 (EXIF 제거 목적)

## 2026-05-01 (4차 작업)

### Node.js 메모리 부족 오류 수정
- 증상: 재부팅 후 서버 실행 시 `FATAL ERROR: Allocation failed - JavaScript heap out of memory`
- 원인: Turbopack이 여러 워커 프로세스를 동시 실행하면서 기본 메모리 한도(~1.5GB) 초과
- 수정: `start-claybook.bat`에 `set NODE_OPTIONS=--max-old-space-size=4096` 추가 (4GB로 한도 확장)
- 참고: 이미지 route 첫 로드 56초는 Turbopack 컴파일 시간이며 재부팅 직후 한 번만 발생하는 정상 동작

## 2026-05-01 (3차 작업)

### Turbopack tailwindcss 경로 오류 수정
- 증상: 재부팅 후 URL 접속 시 `Can't resolve 'tailwindcss' in 'd:\Claude-code-app'` 에러
- 원인: Next.js Turbopack이 CSS `@import "tailwindcss"` 모듈 경로를 프로젝트 상위 폴더(`d:\Claude-code-app`)에서 찾는 버그
- 수정: `next.config.ts`에 `turbopack.resolveAlias` 추가로 명시적 경로 지정
- 추가 조치: `.next` 캐시 삭제 (재빌드 강제)

## 2026-05-01 (2차 작업)

### Tailscale Funnel 설정
- Tailscale 설치 (`winget install tailscale.tailscale`)
- Tailscale Funnel 활성화 → 고정 공개 URL 확보
- **고정 URL**: `https://desktop-u7m999c.tailb434f9.ts.net`
- `next.config.ts`에 `allowedDevOrigins` 추가 (Tailscale 도메인 신뢰 등록)
- Funnel이 port 3000을 바라보도록 설정 (`tailscale funnel --bg 3000`)

### 자동 시작 설정
- `start-claybook.bat` 배치파일 생성
- Windows 작업 스케줄러에 "ClayBook Server" 등록 (로그인 시 자동 실행)

### 기능 추가
- 종족(race) 단일 선택 → 다중 선택으로 변경 (DB 스키마 포함)
- 수정 화면에 캐릭터 추가(+) 버튼 추가
- 전체 페이지 헤더에 홈(🏠) 버튼 추가
- Hydration 경고 억제 (`suppressHydrationWarning`) — 브라우저 확장 프로그램 충돌 방지

### DB 스키마 변경
- `race` 컬럼: `String?` → `String[]` (다중 종족 지원)
- `prisma db push --accept-data-loss` 로 적용
- Prisma 클라이언트 재생성 (`prisma generate`)

## 2026-05-01

### 클레이 도감 앱 구현
- Next.js 15 (App Router) 프로젝트 생성
- **기술 스택**: Next.js + PostgreSQL(로컬) + Prisma 7 + Cloudflare Tunnel
- **DB**: Prisma 스키마 정의 (`prisma/schema.prisma`) — characters 테이블
- **이미지**: `D:\uploads\clay\` 로컬 저장, `/api/images/[filename]` 라우트로 서빙
- **API 라우트**: 캐릭터 CRUD (`/api/characters`), 이미지 업로드 (`/api/upload`), 관리자 인증 (`/api/admin`)
- **페이지**: 메인 목록, 캐릭터 상세, 추가/수정 폼
- **컴포넌트**: CharacterCard, CharacterForm, AttributeBadge, StatBar, AdminModal, AdminProvider
- **상수**: 16종 속성 + 색상맵, 19종 종족, 23종 부과효과 (`lib/constants.ts`)
- `workflows/add-character.md` 업무 매뉴얼 작성

> 진행중: PostgreSQL 비밀번호 입력 후 `prisma migrate dev` 실행 필요

### 프로젝트 초기화
- `CLAUDE.md` 생성 — AI 신입사원 운영 규칙 및 3단계 구조 정의
- `CHANGELOG.md` 생성 — 개발이력 추적 시작
- `workflows/` 디렉토리 생성 — 업무 매뉴얼 저장 공간
- `tools/` 디렉토리 생성 — Python 실행 도구 저장 공간
- `.env.example` 생성 — API 키 템플릿
- `.gitignore` 생성 — 민감 정보 제외 설정
