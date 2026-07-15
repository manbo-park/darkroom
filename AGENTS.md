# AGENTS.md

이 파일은 **darkroom 모노레포에서 작업하는 모든 AI 에이전트를 위한 단일 진실 공급원(Single Source of Truth)** 입니다. `CLAUDE.md`(및 향후 `GEMINI.md` 등)는 이 파일을 참조만 하므로, 지침 변경은 반드시 이 파일에서만 수정합니다.

앱별 상세 지침은 각 앱의 AGENTS.md를 참조하세요 — 이 문서는 **모노레포 공통 사항만** 다룹니다.

- [apps/filo/AGENTS.md](./apps/filo/AGENTS.md) — 필름 로그북 PWA
- [apps/fixif/AGENTS.md](./apps/fixif/AGENTS.md) — EXIF 편집 웹 앱

## 개요

**darkroom** 은 필름 사진 워크플로 도구 두 개를 담은 모노레포입니다.

| 앱 | 설명 | 배포 |
| --- | --- | --- |
| **filo** | 필름 촬영을 기록하는 PWA (클라이언트 전용, 오프라인) | https://fi-lo.vercel.app/ |
| **fixif** | 스캔 JPEG의 EXIF를 일괄 편집하는 PC 웹 앱 | https://fixif.vercel.app/ |

두 앱은 클립보드(`FILO1:` 페이로드)로 연동됩니다 — filo에 기록한 롤 정보를 fixif에서 스캔 이미지에 주입합니다.

## 툴체인

| 영역 | 기술 |
| --- | --- |
| 패키지 매니저 | **pnpm 11** (워크스페이스) |
| 태스크 러너 | **Turborepo 2** |
| 런타임 | Node (`packageManager` 필드 기준 pnpm 고정) |

앱은 각자 Vite 6 + React 19 + TypeScript + Tailwind 3 + Zustand 5 스택을 씁니다. 상세는 앱 AGENTS.md 참조.

## 구조

```
darkroom/
├── apps/
│   ├── filo/          # 필름 로그북 PWA
│   └── fixif/         # EXIF 편집 앱
├── packages/
│   ├── tsconfig/      # @darkroom/tsconfig — 공유 tsconfig (base.json, node.json)
│   └── eslint-config/ # @darkroom/eslint-config — 공유 ESLint flat config
├── pnpm-workspace.yaml
├── turbo.json
└── package.json       # 루트 (private, turbo 스크립트)
```

## 명령어

루트에서 turbo가 전체 워크스페이스에 태스크를 위임합니다.

```bash
pnpm install          # 워크스페이스 전체 의존성 설치
pnpm dev              # 모든 앱 개발 서버 (turbo dev, persistent)
pnpm build            # 모든 앱 프로덕션 빌드 (turbo build, ^build 선행)
pnpm lint             # 모든 앱 ESLint

pnpm --filter filo dev      # 특정 앱만 실행
pnpm --filter fixif build   # 특정 앱만 빌드
```

작업 완료 전 대상 앱의 `lint`와 `build`(타입 검사 포함) 통과를 권장합니다.

## 공유 패키지

- **`@darkroom/tsconfig`** — 앱의 `tsconfig.app.json`은 `base.json`을, `tsconfig.node.json`은 `node.json`을 `extends` 합니다. 앱 고유 옵션(경로 별칭 등)만 각 앱에 남깁니다.
- **`@darkroom/eslint-config`** — 공유 flat config(js/tseslint recommended, react-hooks, react-refresh, prettier). 각 앱 `eslint.config.mjs`가 이를 스프레드한 뒤 앱별 규칙을 덧붙입니다.

공유 패키지는 `workspace:*`로 참조합니다.

## 새 앱/패키지 추가 시

- `apps/*` 또는 `packages/*` 아래 생성 (pnpm-workspace.yaml의 글롭).
- 공유 tsconfig·eslint-config를 `workspace:*`로 채택.
- 빌드 스크립트를 실행하는 네이티브 의존성(esbuild, sharp 등)은 `pnpm-workspace.yaml`의 `allowBuilds`에 승인 등록.
- 앱이면 자체 AGENTS.md를 두고 CLAUDE.md에서 참조.

## 배포 (Vercel)

각 앱은 **독립 Vercel 프로젝트**로, Root Directory를 `apps/<앱>`으로 지정합니다.

- Framework Preset: **Vite**
- Install/Build는 `packageManager` 필드 + `pnpm-lock.yaml`로 pnpm 자동 감지. **npm으로 설치되면 `workspace:` 프로토콜을 못 읽어 실패**하므로 pnpm이 쓰이는지 확인.
- 루트 변경이 없는 앱은 Vercel이 배포를 건너뜁니다(모노레포 스킵).

## 커밋 메시지

Conventional Commits 규칙을 따르고, 타입 접두사는 영어 소문자, 제목·본문은 한국어로 작성합니다. 제목은 명령형, 50자 이내, 끝에 마침표 없음.

## 응답 언어

모든 설명, 코드 주석, 커밋 메시지는 한국어로 작성합니다.
