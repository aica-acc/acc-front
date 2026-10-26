# 🎨 ACC – 축제홍보 마케터 AI Agent

**기획부터 다양한 홍보물을 한 번에 생성하는 원터치 AI 플랫폼**

이 레포는 ACC 의 **프론트엔드(React + Vite)** 입니다.
백엔드는 [`acc-backend`](https://github.com/aica-acc/acc-backend), AI 서버는 [`acc-ai`](https://github.com/aica-acc/acc-ai) 입니다.

---

## 🚀 서비스소개

매년 증가하는 축제 수에 비해, 홍보물 제작은 여전히 **높은 비용·낮은 일관성·느린 제작 속도**라는 구조적 문제를 안고 있습니다.
여러 제작 업체에 분산 제작을 맡기며 **기획 의도가 반영되지 않거나**,
각 홍보물간 **디자인 통일성이 무너지는 문제**도 존재합니다.

ACC(Automatic Creative Content)는 이러한 문제를 해결하기 위해 기획되었습니다.
기획서 분석부터 트렌드 분석, 메인·파생 홍보물 생성, OCR 편집까지
**하나의 자동화된 흐름으로 연결하는 AI 기반 통합 홍보물 생성 플랫폼**입니다.

## 🎯 기대효과

- **낭비되는 홍보 제작 비용 절감**
- **기획 의도를 반영한 시각적 결과물 자동 생성**
- **포스터–배너–파생템의 브랜드 일관성 확보**
- **다양한 파생 홍보물 제작을 통한 공급자 수익 구조 확보**

## ✨ 주요기능

1. **기획서 분석** – 업로드된 기획서에서 핵심 메시지·의도·톤앤매너 분석
2. **트렌드 분석** – 키워드·지역 기반 트렌드, SNS/뉴스·시각적 트렌드 감지
3. **홍보물 자동 생성** – LLM + LangGraph + 이미지 생성 모델로 포스터/마스코트/굿즈 생성
4. **OCR 기반 편집 (Fabric.js)** – 이미지 속 텍스트를 추출해 직접 수정
5. **파생 홍보물 자동 생성** – 메인 포스터/마스코트 기반의 배너·카드뉴스·굿즈 등
6. **프로젝트 관리 (마이페이지)** – 프로젝트별 생성물 이력, 저장소, 프로필

## 🔄 User Flow

1. 메인 화면에서 **test 계정으로 로그인하기** 또는 **실제 이용하기**(가입/로그인)
2. 홍보물 유형 선택
3. 축제명/키워드/테마/기획서 입력 (test 계정은 샘플 기획서가 자동 입력됨)
4. AI 분석 결과 확인 → 수정 또는 그대로 사용
5. 메인 홍보물(포스터·마스코트) 생성
6. 파생 홍보물 생성 + OCR 기반 텍스트 편집
7. 마이페이지에서 프로젝트·저장소 관리

---

## 🛠 Tech Stack

| 구분 | 내용 |
|---|---|
| 프레임워크 | React 19, Vite 7, React Router 7 |
| 스타일 | Tailwind CSS 4, styled-components, Bootstrap Icons, lucide-react |
| 상태 관리 | **Zustand 5** (로그인 상태, `persist` 로 localStorage 저장) |
| HTTP | axios (JWT 자동 첨부 인터셉터) |
| 편집/출력 | Fabric.js 6 (이미지 편집기), html2canvas, html-to-image, jsPDF |
| 차트 | Recharts |
| 배포 | Docker 멀티 스테이지 (Node 22 빌드 → nginx 1.28) |

시스템 구성: **acc-front(nginx) → acc-backend(Spring, MySQL) / acc-ai(FastAPI)**

---

## ⚙️ 빠른 실행 (로컬 개발)

사전 준비: Node.js **22** (Vite 7 은 20.19+ / 22.12+ 필요), 백엔드(`:8081`)와 AI 서버(`:5000`)가 떠 있어야 화면이 동작합니다.

```bash
npm ci
cp .env.example .env     # 값 확인 (아래 "환경변수")
npm run dev              # http://localhost:5173
```

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (`/static` 은 AI 서버로 프록시) |
| `npm run build` | 운영 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint |

### 환경변수 (`.env`)

Vite 는 `VITE_` 로 시작하는 값만 브라우저에 노출합니다. **빌드할 때 번들에 고정**되므로 값을 바꾸면 다시 빌드해야 합니다.

| 변수 | 설명 | 기본값 |
|---|---|---|
| `VITE_API_BASE_URL` | 백엔드 주소. **빈 문자열이면 같은 도메인**(`/api/...`)으로 요청 — Docker/도메인 배포용 | `http://localhost:8081` |
| `VITE_AI_SERVER_URL` | AI 서버 주소 (`/ai` 처럼 상대경로도 가능) | `http://127.0.0.1:5000` |
| `VITE_PUBLIC_FOLDER_PATH` | 백엔드가 파일을 저장하는 `public` 폴더 경로 (**백엔드 프로세스 기준**) | |

### 레포에 없는 파일 (필수)

용량·저작권 때문에 `.gitignore` 되어 있어, 받아서 직접 넣어야 합니다.

| 위치 | 내용 | 없을 때 |
|---|---|---|
| `src/assets/sections/video/` | `main_video.mp4`, `sample1~3.mp4` | **빌드 실패** |
| `src/assets/promotion/poster/`, `mascot/` | `poster_1~8`, `mascot_1~7` 샘플 이미지 | 개발 서버에서는 깨짐. Docker 빌드는 1×1 임시 이미지로 대체 |
| `public/data/promotion/M000001/25/poster/` | few-shot 이미지 (`card.png`, `good_2.jpg`) | 생성 AI 품질 저하 |

---

## 🔐 로그인 / 권한

- 로그인 상태(`token`, `member`)는 **Zustand 스토어**(`src/store/authStore.js`)가 관리합니다. `persist` 로 `localStorage`(`acc_auth`)에 저장되어 새로고침해도 유지됩니다.
- 컴포넌트는 훅으로 구독합니다. 로그인·로그아웃·프로필 수정이 일어나면 헤더, 보호 라우트 등이 **새로고침 없이 자동으로 갱신**됩니다. 다른 탭에서 로그아웃해도 이 탭에 즉시 반영됩니다.
  ```jsx
  import { useAuthStore } from "../store/authStore";
  const member = useAuthStore((s) => s.member);           // 값 구독
  const clearSession = useAuthStore((s) => s.clearSession); // 액션
  ```
- React 밖(axios 인터셉터 등)에서는 `src/utils/auth.js` 의 `getToken()`, `getMember()` 처럼 현재 값을 읽는 함수를 씁니다. 내부적으로 같은 스토어를 사용합니다.
- `src/utils/api/BaseAPI.jsx` 의 axios 인터셉터가 `Authorization: Bearer` 를 자동 첨부하고, 토큰이 만료/무효(401)면 세션을 지우고 로그인 화면으로 보냅니다.
- `src/components/auth/RequireAuth.jsx` 가 `/`, `/login` 을 제외한 모든 화면을 로그인 필요로 막습니다. `/admin` 은 `ADMIN` 만 접근합니다.
- 권한: `USER`(일반) / `TEST`(테스트 계정, 샘플 기획서 자동 입력) / `ADMIN`(관리자 화면).
- 로그아웃하면 작성 중이던 폼(`festivalForm`)도 함께 지워 다른 계정에 보이지 않게 합니다.

## 🗺 화면 / 라우트

| 경로 | 화면 |
|---|---|
| `/` | 메인 (test 로그인 / 실제 이용하기) |
| `/login` | 로그인 · 회원가입 · test 로그인 |
| `/select` | 홍보물 유형 선택 |
| `/upload` | 기획서 업로드 (test 계정은 `TestSamplePanel` 로 샘플 자동 입력) |
| `/proposalloading`, `/analyze/*` | 분석 진행 / 결과 (개요·키워드 트렌드·지역 트렌드) |
| `/create/*`, `/generate-prompt/loading` | 프롬프트·이미지 생성 |
| `/editorpage`, `/check` | 에디터 · 확인 |
| `/report/*` | 홍보 리포트 |
| `/mypage/project`, `/mypage/project/:id` | 내 프로젝트 목록 / 상세 |
| `/mypage/drive` | 저장소 (내 모든 홍보물 필터·미리보기·다운로드) |
| `/mypage/profile` | 프로필 수정 · 비밀번호 변경 |
| `/admin` | 관리자 (회원 권한·정지·데이터 초기화) |
| 그 외 | 404 |

---

## 🐳 Docker

`Dockerfile` 은 멀티 스테이지입니다.

1. **빌드** (`node:22-alpine`): `npm ci` → `npm run build`
   - Linux 는 파일명 대소문자를 구분하므로 `cardnews/*.PNG` 를 `*.png` 로 바꿔서 빌드합니다.
   - `src/assets/promotion/*` 이 없으면 1×1 임시 이미지로 채웁니다 (실제 이미지를 넣으면 그대로 사용).
2. **실행** (`nginx:1.28-alpine`): `dist/` 를 서빙하고 `nginx.conf` 템플릿으로 프록시합니다.

빌드 인자 (`--build-arg`): `VITE_PUBLIC_FOLDER_PATH`, `VITE_API_BASE_URL`, `VITE_AI_SERVER_URL`

### nginx 라우팅 (`nginx.conf`)

브라우저는 nginx 하나만 바라보고, nginx 가 경로별로 나눠 전달합니다.

| 경로 | 전달 대상 |
|---|---|
| `/` | React 정적 파일 (SPA 라우팅 지원) |
| `/api/` | 백엔드 (`BACKEND_HOST:BACKEND_PORT`) |
| `/ai/` | AI 서버 (`AI_HOST:AI_PORT`), `/ai` 접두어는 제거 |
| `/static/` | AI 서버 정적 파일 |
| `/data/` | 백엔드가 생성한 홍보물 (공유 볼륨 `/srv/public/data/`) |

업스트림 주소는 환경변수(기본 `BACKEND_HOST=ai`, `BACKEND_PORT=8081`, `AI_HOST=ai`, `AI_PORT=5000`)로 바꿀 수 있습니다.

```bash
docker build -t scv3114/acc-front \
  --build-arg VITE_API_BASE_URL="" --build-arg VITE_AI_SERVER_URL=/ai .
docker run -p 5173:80 -v /경로/public:/srv/public:ro scv3114/acc-front
```

도커 허브 이미지는 `scv3114/acc-front` 입니다. 전체 서비스(DB + AI + 백엔드 + 프론트)를 한 번에 띄우는 방법은 배포용 폴더의 `docker-compose.yml` / README 를 참고하세요.

---

## 📁 폴더 구조

```
src/
├─ main.jsx, App.jsx
├─ utils/
│  ├─ routes.jsx        라우트 정의 (RequireAuth 로 보호)
│  ├─ auth.js           스토어를 읽고 쓰는 헬퍼 (React 밖에서 사용)
│  └─ api/BaseAPI.jsx   axios 인스턴스 (토큰 첨부, 401 처리)
├─ store/authStore.js   Zustand 스토어 (로그인 상태)
├─ config/appConfig.js  API / AI 서버 주소, 경로 변환
├─ pages/               화면 (analyze, create, mypage, report, Login, Admin, NotFound ...)
├─ components/          auth, editor, select_promotion, mypage, report ...
├─ layout/              Header, StepHeader, 각 영역 레이아웃
├─ sections/            메인 화면 섹션
└─ assets/              이미지·영상 (일부는 git 제외)
```

## 📌 알아두면 좋은 점

- 백엔드가 `C:\...` 같은 윈도우 경로를 DB 에 저장한 과거 데이터가 있어, `canvasLoader.js` / `imageUtils.js` 는 이런 경로를 `/data/...` 웹 경로로 바꿔 줍니다. 새 데이터는 `/data/...` 로 저장됩니다.
- 새 화면은 `src/utils/routes.jsx` 의 `RequireAuth` 안에 추가하세요 (로그인 필요).
- API 호출은 `src/utils/api/BaseAPI.jsx` 의 `api` 인스턴스를 사용하세요. 토큰과 회원번호가 자동으로 붙습니다.
- 화면에서 로그인 정보가 필요하면 `useAuthStore` 훅을 쓰세요. 일반 함수(`getMember()`)는 값이 바뀌어도 화면을 다시 그리지 않습니다.
- 그 밖의 임시 상태(`festivalForm`, `selectedPromotions` 등)는 아직 `localStorage`/`sessionStorage` 를 직접 쓰고 있습니다. 필요하면 같은 방식으로 스토어로 옮길 수 있습니다.
