# darkroom

필름 사진 워크플로 도구를 담은 모노레포입니다.

| 앱 | 설명 | 배포 |
| --- | --- | --- |
| [**filo**](./apps/filo) | 필름 촬영을 기록하는 PWA (클라이언트 전용, 오프라인) | https://fi-lo.vercel.app/ |
| [**fixif**](./apps/fixif) | 스캔 JPEG의 EXIF를 일괄 편집하는 웹 앱 | https://fixif.vercel.app/ |

두 앱은 클립보드로 연동됩니다 — filo에 기록한 롤 정보를 fixif에서 스캔 이미지의 EXIF로 주입합니다.

## 개발

pnpm 워크스페이스 + Turborepo 기반입니다.

```bash
pnpm install                # 의존성 설치
pnpm dev                    # 전체 개발 서버
pnpm build                  # 전체 빌드
pnpm --filter filo dev      # 특정 앱만 실행
```

## 구조

```
apps/       filo, fixif
packages/   @darkroom/tsconfig, @darkroom/eslint-config (공유 설정)
```

기여·아키텍처 가이드는 [AGENTS.md](./AGENTS.md)를 참조하세요.
