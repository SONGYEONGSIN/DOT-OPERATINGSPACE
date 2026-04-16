# Neumorphism Implementation Spec

> DESIGN.md(typeui.sh 자동 관리 템플릿)의 프로젝트 특화 구현 스펙.
> DESIGN.md는 브리프·가이드라인 메타이고, 이 문서가 실제 구현 기준.
> 모든 컴포넌트 작업은 이 문서를 참조한다.

## 0. 확정된 방향성

- **의도 충돌 해소**: **뉴모피즘 우위**. DESIGN.md의 "high-contrast, matrix" 키워드는 **폐기**. 저대비·단색조 soft extruded 시스템이 본 프로젝트의 미학 기준.
- **마이그레이션 전략**: `feat/neumorphism-redesign` 브랜치에서 in-place 수정. main 브랜치는 현 M3 light 유지.
- **테마 모드**: Light-only (1차). 다크 모드는 v2 이후 별도 스펙.

## 1. Visual Theme & Atmosphere

뉴모피즘 라이트 쿠션 UI — 플라스틱 또는 실리콘 소재가 surface에서 부드럽게 솟아오르거나 눌린 듯한 촉각성. 극도의 저대비 단색조 위에서 **shadow와 depth만으로 hierarchy를 표현**한다. 관리자 대시보드의 정보 밀도를 해치지 않도록, 뉴모피즘 특유의 여백 낭비를 억제하고 compact density를 유지한다.

**핵심 특성**:
- Surface `#E7E5E4` 위에서 동색계 shadow 두 쌍(light/dark)이 만드는 입체감
- Teal primary `#006666`는 **색 포인트가 아니라 의미 포인트** — 활성 상태, CTA, 링크 등 기능 지시자에만 사용
- 정보 집약 영역(테이블, 대시보드 숫자)은 flat 처리로 가독성 확보, 입체는 "interactable" 시그널로 한정
- 저대비 인해 발생하는 a11y 리스크는 focus ring과 텍스트 대비 AA 강제로 보완

## 2. Color Palette (확장)

### Core 7 Tokens (DESIGN.md 원본 계승)

| 역할 | 토큰 | Hex | 용도 |
|---|---|---|---|
| Primary | `--color-primary` | `#006666` | teal — 활성/CTA/링크 |
| Secondary | `--color-secondary` | `#F1F2F5` | 보조 표면 (input, chip 배경) |
| Surface | `--color-surface` | `#E7E5E4` | 페이지·카드 기본 배경 |
| Text | `--color-text` | `#1E2938` | 본문·제목 |
| Success | `--color-success` | `#00A63D` | 완료·승인 상태 |
| Warning | `--color-warning` | `#FE9900` | 주의·대기 상태 |
| Danger | `--color-danger` | `#FF2157` | 에러·파괴 동작 |

### 확장 — Neumorphism Shadow Colors

Shadow는 surface `#E7E5E4`의 밝기를 축으로 2방향으로 변형:

| 토큰 | 값 | 용도 |
|---|---|---|
| `--shadow-neu-light` | `rgba(255, 255, 255, 0.85)` | 좌상단 highlight (빛 받는 면) |
| `--shadow-neu-dark` | `rgba(166, 164, 163, 0.45)` | 우하단 shadow (그림자 지는 면) |
| `--shadow-neu-inset-light` | `rgba(255, 255, 255, 0.7)` | inset 상태 좌상단 |
| `--shadow-neu-inset-dark` | `rgba(166, 164, 163, 0.35)` | inset 상태 우하단 |

### 확장 — Text Hierarchy

단일 `--color-text`만으로는 부족. 보조 토큰 2종 추가:

| 토큰 | Hex | 용도 | AA 대비 |
|---|---|---|---|
| `--color-text` | `#1E2938` | Primary text | 11.5:1 vs surface ✅ |
| `--color-text-muted` | `#4A5565` | Secondary text | 7.8:1 vs surface ✅ |
| `--color-text-faint` | `#6B7280` | Tertiary/meta | 4.7:1 vs surface ✅ |

모두 `#E7E5E4` 대비 WCAG AA 이상 확보.

## 3. Typography

### Font Family

- **Primary (UI/Body)**: `"Pretendard"`, fallback to system sans. **이유**: Space Mono는 영문 전용 고정폭이라 한국어 UI에 부적합(한글 fallback이 섞이면 비일관 비주얼 발생). 프로젝트 본문은 한국어 70%+이므로 Pretendard 유지.
- **Display / Stat (큰 숫자/헤드라인)**: `"Space Mono"`, fallback to `"JetBrains Mono"`, monospace. **적용 범위**: 대시보드 숫자 카드(2,485건 등), 통계, 코드, 타임스탬프. 라틴 문자/숫자만 해당되는 영역으로 한정.
- **Mono (code inline)**: `"JetBrains Mono"`, monospace.

### Scale

| Role | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Display Stat | Space Mono | 32px | 700 | 1.1 |
| Page Title | Pretendard | 24px | 700 | 1.3 |
| Section Heading | Pretendard | 18px | 600 | 1.4 |
| Body | Pretendard | 14px | 400 | 1.5 |
| Label / Overline | Pretendard | 11px | 600 | 1.4, uppercase, letter-spacing 0.08em |
| Caption | Pretendard | 12px | 400 | 1.4 |
| Mono Inline | JetBrains Mono | 13px | 400 | 1.5 |

## 4. Shadow System (뉴모피즘 공식)

### 4.1 Shadow Levels (2단계)

**Soft** — 일반 카드, 버튼 default

```css
box-shadow:
  -3px -3px 6px var(--shadow-neu-light),
   3px  3px 6px var(--shadow-neu-dark);
```

**Strong** — 강조 카드, 모달, 플로팅 요소

```css
box-shadow:
  -6px -6px 14px var(--shadow-neu-light),
   6px  6px 14px var(--shadow-neu-dark);
```

### 4.2 Shadow Modes (3상태)

| Mode | 토큰명 | 의미 | 사용처 |
|---|---|---|---|
| **Extruded** | `shadow-neu-soft` / `shadow-neu-strong` | 표면에서 솟음 | default 버튼, 카드, 네비 컨테이너 |
| **Inset** | `shadow-neu-inset-soft` / `shadow-neu-inset-strong` | 표면에서 눌림 | 활성 메뉴, pressed 버튼, input focus, 검색창 |
| **Flat** | shadow 없음 | 평평함 | disabled, 테이블 행, 정보 밀도 영역 |

Inset 공식:

```css
box-shadow:
  inset -3px -3px 6px var(--shadow-neu-inset-light),
  inset  3px  3px 6px var(--shadow-neu-inset-dark);
```

### 4.3 Border Radius Scale

- Pill (9999px): 상태 칩, 태그
- Large (20px): 카드, 모달, 주요 컨테이너 — 뉴모피즘 특성상 radius가 커야 shadow 곡선이 자연스러움
- Medium (14px): 버튼, input, 작은 카드
- Small (8px): 테이블 셀 group, 내부 구획

### 4.4 Motion Tokens

뉴모피즘의 플라스틱/실리콘 촉각성과 어울리는 soft/slow 곡선. 관리자 대시보드 생산성 요구를 고려해 과도하게 느리지 않도록 상한 300ms.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--duration-press` | `100ms` | 버튼 press (extruded → inset transition) |
| `--duration-hover` | `200ms` | 카드 hover(soft→strong), 메뉴 hover bg |
| `--duration-modal` | `300ms` | 모달/drawer 등장·퇴장 |
| `--ease-neu` | `cubic-bezier(0.4, 0, 0.2, 1)` | 표준 ease-out 기반 (material standard) |

**필수 조건**: 모든 transition은 `@media (prefers-reduced-motion: reduce)` 블록에서 duration 0 또는 제거로 대체.

## 5. Component Anatomy (핵심 5종)

### 5.1 Sidebar

```
┌─ aside (surface, flat) ──────────────┐
│  ┌─ brand (extruded-soft) ────────┐  │
│  │  Logo                          │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Category overline]                 │
│  ┌─ nav item (flat, hover bg) ──┐    │
│  │  🎯 대시보드                  │    │
│  └──────────────────────────────┘    │
│  ┌─ nav item active (inset-soft)┐    │
│  │  🎯 대시보드                  │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌─ account btn (extruded-soft)─┐    │
│  │  [avatar]  이름               │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

- Aside 자체는 flat (shadow 없음). 배경은 surface.
- **활성 메뉴**: `shadow-neu-inset-soft` + Pretendard 14px weight 600 + `color-primary` (`#006666`) 텍스트
- **기본 메뉴**: flat + `color-text-muted` + hover 시 background-color subtle(`rgba(0,0,0,0.02)`) + radius 14px
- **활성 아이콘 색**: primary teal. 비활성은 `color-text-faint`.
- **카테고리 overline**: Pretendard 11px weight 600 uppercase letter-spacing 0.08em color `text-faint`.
- **계정 버튼**: `shadow-neu-soft` extruded, 클릭 시 `shadow-neu-inset-soft`로 전환 (150ms).

### 5.2 Card

```
┌─ card (extruded-soft, radius-20) ──┐
│                                    │
│  [Title]                           │
│  ──────                            │
│  Content                           │
│                                    │
└────────────────────────────────────┘
```

- Background: surface (`#E7E5E4`) — 카드와 페이지 배경이 같아야 뉴모피즘 성립
- Shadow: `shadow-neu-soft` 기본. Hover 시 `shadow-neu-strong` (200ms transition)
- Radius: 20px
- Padding: 20px (compact density 반영)
- **Stat 카드**(대시보드 숫자)는 Display Stat 타이포(Space Mono 32px 700) 사용

### 5.3 Button

**Default (Primary)**:
```
extruded-soft + background surface + color primary (#006666) + Pretendard 14px 600 + radius 14px + padding 10px 18px
```

**Press (active)**:
```
inset-soft + background surface + 동일 텍스트 + transition 100ms
```

**Disabled**:
```
flat + opacity 0.5 + cursor not-allowed
```

**Secondary (Ghost)**:
```
flat + border 1px solid color-text-faint/30 + color text-muted + hover: background rgba(0,0,0,0.02)
```

**Danger**:
```
Default + color danger (#FF2157) 텍스트 (배경은 surface 유지)
```

### 5.4 Modal

```
┌─ backdrop (surface 동색조 + rgba(231,229,228,0.72)) ─┐
│                                                      │
│       ┌─ modal (extruded-strong, radius-20) ──┐      │
│       │                                       │      │
│       │   [Title — Pretendard 18px 600]       │      │
│       │   ─────                                │      │
│       │   Body content                         │      │
│       │                                       │      │
│       │   [Cancel Ghost]   [Primary Button]    │      │
│       └───────────────────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- **Backdrop**: `rgba(231, 229, 228, 0.72)` (surface 동색조 반투명) + `backdrop-filter: blur(4px)`. 어둡게 깔지 않음 — 뉴모피즘 "같은 세계의 소재" 원칙.
- **Modal**: `shadow-neu-strong` 필수 (backdrop 대비 약해서 경계 뚜렷해야 함). Radius 20px. Background는 surface.
- **크기**: max-width 480px (기본), 콘텐츠 따라 520/680 variant.
- **Padding**: 24px.
- **Transition**: `opacity` + `transform: scale(0.96 → 1)` + `duration-modal` (300ms) + `ease-neu`. Backdrop은 `opacity` 만 transition.
- **a11y**: `role="dialog"` `aria-modal="true"` + focus trap + Escape 닫기 + 첫 focusable에 자동 focus.

### 5.5 Toast

```
┌─[info]─────────────────────────────┐
│▌ ℹ️  저장되었습니다                 │  ← 좌측 세로바 4px (status color)
└────────────────────────────────────┘
  extruded-strong + radius-14
```

- **Container**: `shadow-neu-strong` extruded + surface background + radius 14px + padding 14px 18px.
- **Status indicator**: 왼쪽 4px 세로바, 상태 색(`--color-success`/`--color-warning`/`--color-danger`/`--color-primary` for info). 배경 전체를 tint하지 않음 (뉴모피즘 동일소재 원칙).
- **Position**: 우하단 고정, stack 시 gap 12px 아래서 위로.
- **Duration**: success/info 3000ms 자동 닫힘, warning 5000ms, danger 수동 닫힘(× 버튼).
- **Entry**: `transform: translateY(12px) → 0` + `opacity 0 → 1` + `duration-modal` (300ms). Exit는 역순.
- **a11y**: `role="status"` (info/success) 또는 `role="alert"` (warning/danger).

## 6. Spacing & Density

**Compact density mode** 해석:

| 영역 | 값 |
|---|---|
| Card padding | 20px |
| Card 간 gap | 16px |
| 버튼 padding | 10px 18px (standard), 8px 14px (small) |
| Section 수직 간격 | 32px |
| Input height | 40px |
| 테이블 행 높이 | 44px |
| Sidebar 메뉴 아이템 높이 | 36px |

## 7. Accessibility

- **Focus ring**: 모든 interactive 요소에 `outline: 2px solid var(--color-primary); outline-offset: 2px;` — 뉴모피즘 shadow와 겹쳐도 우선 표시. `:focus-visible`만 적용(마우스 클릭엔 안 보임).
- **텍스트 대비**: 모든 본문 텍스트는 surface 대비 WCAG AA (4.5:1) 이상. `color-text-faint`(4.7:1)가 하한.
- **Shadow는 hierarchy 시그널일 뿐 의미 전달 수단이 아님** — 활성/비활성 같은 상태는 색과 텍스트로도 구분 가능해야 함 (shadow는 중복 시그널).
- **키보드 탐색**: Tab 순서는 시각 순서와 일치. `inset-soft` 활성 메뉴는 `aria-current="page"` 같이 부여.
- **Reduced motion**: `@media (prefers-reduced-motion)` 에서 shadow transition 제거.

## 8. Don'ts

### 뉴모피즘 고유 안티패턴

- ❌ Surface와 다른 색 카드 배경 사용 (surface 동색이어야 shadow가 성립)
- ❌ 흰색(#FFFFFF) surface 사용 — highlight shadow가 안 보여 입체감 사라짐
- ❌ 강한 그림자(0.5+ opacity) — 뉴모피즘 저대비 원칙 위반
- ❌ Hard shadow (blur 0px) — 뉴모피즘은 soft blur 6~14px 기본
- ❌ Emerald/Blue 같은 선명 accent 큰 면적 사용 — teal primary는 점으로만
- ❌ 테이블/리스트 모든 행에 extruded shadow — 정보 밀도 파괴, flat 유지

### 안티 AI 쿠키커터 가드레일

- ❌ `shadow-sm` + `rounded-lg` + `bg-white` 조합 (Tailwind 스타터킷 시그니처)
- ❌ `blue-600` 또는 `indigo-500` primary
- ❌ Hero(`text-5xl font-bold`) + 3열 Feature Grid (SaaS 랜딩 템플릿)
- ❌ 디폴트 shadow 토큰을 넣고 정당화 없이 사용 — Tailwind 기본 shadow 클래스(`shadow-md`, `shadow-lg`) 금지, 뉴모피즘 전용 토큰만 사용
- ❌ `divide-y` 리스트 + `rounded-full` 아바타 (스타터킷 패턴)

### 저대비 테마의 일반 안티패턴

- ❌ `color-text-faint`(#6B7280)를 본문에 사용 — AA 하한이라 caption/meta에만
- ❌ Primary teal을 본문 텍스트에 섞기 — 링크/CTA에만

## 9. QA Checklist (컴포넌트 리뷰 기준)

- [ ] Surface가 `#E7E5E4`이고 shadow가 `shadow-neu-soft` 또는 `shadow-neu-strong`을 사용하는가
- [ ] 활성 상태는 `inset` shadow 또는 `color-primary` 텍스트로 2중 시그널인가
- [ ] Focus ring이 보이는가(`:focus-visible` 시)
- [ ] 텍스트 대비가 AA(4.5:1) 이상인가 (caption은 AA Large OK)
- [ ] Space Mono는 숫자/라틴 영역에만, 한국어는 Pretendard인가
- [ ] `shadow-sm`, `rounded-lg`, `bg-white` 같은 Tailwind 기본 shadow/surface 클래스 사용 0건인가
- [ ] Reduced motion 미디어 쿼리 대응하는가
- [ ] 테이블/리스트 같은 정보 밀도 영역은 flat이고 extruded 남발하지 않았는가
- [ ] Border radius가 20/14/8/pill 중 하나인가

## 10. 마이그레이션 매핑 (기존 M3 → 뉴모피즘)

| 기존 (M3) | 뉴모피즘 | 비고 |
|---|---|---|
| `bg-surface-container-*` | `bg-[var(--color-surface)]` 단일 | 계층 구분은 shadow로 |
| `shadow-card`, `shadow-elevated` | `shadow-neu-soft`, `shadow-neu-strong` | |
| `text-on-surface-variant` | `text-[var(--color-text-muted)]` | |
| `text-on-surface` | `text-[var(--color-text)]` | |
| `text-primary` | `text-[var(--color-primary)]` | 색은 teal로 교체 |
| `border-outline-variant/*` | 대부분 제거 (shadow로 대체) | |
| `rounded-lg` (8px) | `rounded-[14px]` 또는 `rounded-[20px]` | |
| `bg-primary` (large surface) | **사용 금지** | primary는 텍스트/아이콘에만 |

## 11. Decisions Log (확정)

아래 결정은 이번 세션에서 확정됨. 번복 시 해당 섹션 업데이트 + 사유 기록 필수.

| 항목 | 결정 | 위치 |
|---|---|---|
| 의도 충돌 (neumorphism vs matrix) | 뉴모피즘 우위, matrix/high-contrast 키워드 폐기 | §0, §1 |
| 다크 모드 | v2 이후 별도 작업 — v1은 light-only | §0 |
| 폰트 전략 | Pretendard 유지(UI/본문) + Space Mono는 숫자/라틴 영역 한정 | §3 |
| 모달 backdrop | surface 동색조 `rgba(231,229,228,0.72)` + blur 4px — 어둡게 깔지 않음 | §5.4 |
| Toast 스타일 | extruded-strong shadow + 좌측 세로바 상태색 — 배경 전체 tint 금지 | §5.5 |
| Motion duration | hover 200ms / press 100ms / modal 300ms + ease-out | §4.4 |

## 12. 미정 항목 (나중에 결정)

- [x] **Chart 색 팔레트** — 확정. `globals.css` @theme에 6색 토큰 추가 완료:
  - `--color-chart-primary: #006666` (처리완료 — SPEC primary)
  - `--color-chart-warning: #FE9900` (할 일 — SPEC warning)
  - `--color-chart-danger: #FF2157` (보류 — SPEC danger)
  - `--color-chart-blue: #4A90D9` (진행 중 — muted blue 보조)
  - `--color-chart-purple: #7C6BA0` (처리예정 — muted purple 보조)
  - `--color-chart-muted: #6B7280` (fallback — SPEC text-faint)
- [ ] **Form 복잡 패턴** — multi-step wizard, conditional 필드 anatomy는 구현 시 추가 스펙.

---

**다음 단계**: 이 SPEC이 확정되면 B2(design-audit)에서 현재 M3 코드베이스와의 gap 정량 측정 → C(적용 플랜)에서 `/pair` 큐로 페이지별 마이그레이션 진행.
