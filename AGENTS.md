# Project Instructions & Agent Guidelines

이 파일은 이 프로젝트에서 작업하는 모든 AI 에이전트(Claude, Gemini 등)를 위한 **단일 진실 공급원(Single Source of Truth)** 입니다. `CLAUDE.md`와 `GEMINI.md`는 이 파일을 참조만 하므로, 지침 변경은 반드시 이 파일에서만 수정합니다.

## 프로젝트 개요

**filo** 는 필름 카메라 촬영 기록을 관리하는 PWA(Progressive Web App)입니다. 서버 없이 전적으로 클라이언트에서 동작하며, 모든 데이터는 브라우저 로컬 스토리지(IndexedDB)에 저장됩니다. 모바일(특히 iOS Safari) 홈 화면에 설치해 사용하는 것을 주요 시나리오로 합니다.

- 배포 URL: https://fi-lo.vercel.app/
- 백엔드 없음 (클라이언트 전용, 오프라인 동작)

## 기술 스택

| 영역             | 사용 기술                                      |
| ---------------- | ---------------------------------------------- |
| Framework        | React 19 (TypeScript)                          |
| Build Tool       | Vite 6                                          |
| Styling          | TailwindCSS 3                                   |
| State Management | Zustand 5 (`persist` 미들웨어)                 |
| Storage          | IndexedDB (`idb-keyval`) + 일부 `localStorage` |
| Routing          | React Router 7 (`createBrowserRouter`)         |
| ID 생성          | `nanoid`                                       |
| 아이콘           | `lucide-react`                                 |
| PWA              | `vite-plugin-pwa` (Workbox, autoUpdate)        |

## 명령어 (npm scripts)

- `npm run dev` — Vite 개발 서버 실행
- `npm run build` — `tsc -b` 타입 검사 후 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기
- `npm run lint` / `npm run lint:fix` — ESLint 검사 / 자동 수정
- `npm run format` / `npm run format:check` — Prettier 포맷 적용 / 검사

작업 완료 전 `npm run lint`와 `npm run build`(타입 검사 포함)를 통과시키는 것을 권장합니다.

## 폴더 구조

```
src/
├── App.tsx              # RouterProvider 진입점
├── main.tsx             # React DOM 마운트
├── router/index.tsx     # 라우트 정의 (createBrowserRouter)
├── screens/             # 페이지 단위 스크린 컴포넌트
│   ├── SplashScreen.tsx     # '/' 스플래시 → /rolls 진입
│   ├── FilmListScreen.tsx   # '/rolls' 롤 목록 + 내보내기/가져오기
│   ├── ShootingScreen.tsx   # '/shoot' 실시간 촬영 기록
│   ├── RollDetailScreen.tsx # '/rolls/:rollId' 롤 상세/프레임 편집
│   ├── MasterDataScreen.tsx # '/master' 필름/카메라/렌즈 기본 데이터
│   └── SettingsScreen.tsx   # '/settings' 앱 설정
├── components/
│   ├── ui/              # 재사용 UI 프리미티브 (Button, Input, Modal, Select, Switch, PageLayout)
│   └── roll/            # 도메인 컴포넌트 (RollCard, FrameItem)
├── store/               # Zustand 스토어
│   ├── rollStore.ts         # 롤/프레임 (IndexedDB, 'filo-rolls')
│   ├── masterDataStore.ts   # 필름/카메라/렌즈 (IndexedDB, 'filo-master')
│   └── settingsStore.ts     # 앱 설정 (localStorage, 'filo-settings')
├── lib/idb.ts           # Zustand용 IndexedDB StateStorage 어댑터
└── types/index.ts       # 전역 TypeScript 타입 정의
```

## 데이터 모델 (`src/types/index.ts`)

- **Master Data**: `Film`(name, iso, brand?), `Camera`(name, brand?), `Lens`(name, focalLength?, maxAperture?)
- **`Roll`**: `filmId`, `cameraId`, `currentLensId?`, `maxFrames`, `startedAt`, `finishedAt?`, `frames: Frame[]`, `status('active'|'finished')`, `memo?`
- **`Frame`**: `frameNumber`, `timestamp?`, `lensId?`, `aperture?`, `shutterSpeed?`, `memo?`, `latitude?`, `longitude?`, `locationAccuracy?`
- **`ExportData`**: 백업/복원용 envelope. `version: 1`, `exportedAt`, `masterData`, `rolls`, `activeRollId`. 가져오기 시 `importMasterData` / `importRolls`로 **전체 교체**됨.

## 아키텍처 규칙

- **상태 관리는 Zustand 스토어로 일원화.** 도메인 데이터는 컴포넌트 로컬 state가 아니라 해당 스토어 액션을 통해 변경합니다.
- **영속화는 `persist` 미들웨어가 자동 처리.** 롤·마스터 데이터는 IndexedDB(`idb-keyval`, 모바일 Safari의 데이터 퍼지 방지 목적), 설정은 `localStorage`를 사용합니다. 새 스토어 추가 시 영속 키(`name`)는 `filo-` 접두사를 따릅니다.
- **불변 업데이트.** 스토어 액션은 항상 새 배열/객체를 만들어 `set` 합니다 (기존 패턴 참조).
- **ID는 `nanoid()`로 생성.** 엔티티 생성 시 스토어 내부에서 부여합니다.
- **프레임 번호 정합성.** 프레임 삭제/삽입 시 `frameNumber`를 1부터 재정렬하는 기존 로직(`deleteFrame`, `insertFrame`)을 유지합니다.
- **경로 별칭 `@/`** → `src/` (vite.config.ts, tsconfig). 상대 경로 대신 `@/` 사용을 권장합니다.
- **라우팅**은 `src/router/index.tsx`에 중앙 정의. 매칭되지 않는 경로는 `/`로 리다이렉트됩니다.

## 코딩 컨벤션

- **Prettier** (`.prettierrc`): 4-space indent, single quote, semicolon, `trailingComma: all`, `printWidth: 100`, `arrowParens: always`. 커밋 전 `npm run format` 권장.
- **ESLint** (`eslint.config.mjs`):
  - 미사용 변수는 에러 (단 `_` 접두사는 허용)
  - 타입 import은 `import type` 강제 (`consistent-type-imports`)
  - `any`는 경고, `console`은 `warn`/`error`만 허용
  - React Hooks 규칙 적용
- **TypeScript strict 모드.** `any` 사용을 지양하고 `src/types/index.ts`의 타입을 재사용합니다.
- **UI 컴포넌트**는 `components/ui/`의 프리미티브(Button, Input, Modal, Select, Switch, PageLayout)를 우선 재사용합니다.
- **스타일링**은 TailwindCSS 유틸리티 클래스로 작성합니다.

## PWA 주의사항

- `vite-plugin-pwa`가 `registerType: 'autoUpdate'`로 서비스 워커를 자동 갱신합니다.
- 개발 모드에서는 PWA가 비활성(`devOptions.enabled: false`)이므로, PWA 동작 검증은 `npm run build && npm run preview`로 확인합니다.
- 정적 에셋(아이콘 등)은 `public/`에 두고 `manifest`/`includeAssets` 설정(vite.config.ts)과 일치시킵니다.

## 커밋 메시지

Conventional Commits 규칙을 따릅니다 (예: `feat:`, `fix:`, `style:`, `chore:`). 메시지는 한국어로 작성합니다.

## 응답 언어

모든 설명, 코드 주석, 커밋 메시지는 한국어로 작성합니다.
