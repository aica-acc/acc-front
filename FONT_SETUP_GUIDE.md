# 눈누(noonnu.cc) 폰트 추가 가이드

## 📋 단계별 가이드

### 1단계: 눈누에서 폰트 다운로드

1. [눈누 사이트](https://noonnu.cc) 방문
2. 원하는 폰트 선택 (예: Pretendard, 나눔스퀘어 등)
3. 다운로드 버튼 클릭 → `.ttf` 또는 `.otf` 파일 다운로드

### 2단계: 웹 폰트로 변환 (필수! 🔥)

**왜 변환이 필요한가요?**

- `.ttf`/`.otf`는 파일 크기가 큼 (1~3MB)
- `.woff2`는 압축되어 크기가 작음 (100~300KB, **70% 감소!**)
- 웹 로딩 속도 향상

**변환 방법:**

#### 방법 A: Transfonter (추천 ⭐)

1. [Transfonter.org](https://transfonter.org) 접속
2. "Add fonts" 클릭 → 다운받은 `.ttf` 파일 업로드
3. 옵션 설정:
   - ✅ **WOFF2** 체크 (필수)
   - ✅ **WOFF** 체크 (호환성용)
   - ✅ **Add Local() Rule** 체크 해제
   - ✅ **Base64 encode** 체크 해제
4. "Convert" 클릭
5. 다운로드된 `.zip` 파일 압축 해제

#### 방법 B: CloudConvert

1. [CloudConvert](https://cloudconvert.com/ttf-to-woff2) 접속
2. `.ttf` → `.woff2` 선택
3. 파일 업로드 후 변환

### 3단계: 프로젝트에 폰트 파일 저장

**폴더 구조:**

```
src/assets/fonts/
├── Pretendard/
│   ├── Pretendard-Regular.woff2
│   ├── Pretendard-Bold.woff2
│   └── Pretendard-Light.woff2
├── NanumSquare/
│   ├── NanumSquare-Regular.woff2
│   └── NanumSquare-Bold.woff2
└── README.md
```

**저장 위치:**

```
src/assets/fonts/[폰트이름]/파일.woff2
```

### 4단계: CSS에 폰트 등록

`src/index.css` 파일을 열고 다음 코드를 추가:

```css
/* Pretendard 폰트 */
@font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard/Pretendard-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap; /* 폰트 로딩 중 기본 폰트로 표시 */
}

@font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard/Pretendard-Bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

/* 나눔스퀘어 폰트 */
@font-face {
    font-family: 'NanumSquare';
    src: url('/src/assets/fonts/NanumSquare/NanumSquare-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}
```

### 5단계: EditorPage 폰트 옵션에 추가

`src/pages/EditorPage.jsx` 파일의 `FONT_OPTIONS` 배열에 추가:

```javascript
const FONT_OPTIONS = [
  { label: "맑은 고딕", value: "Malgun Gothic" },
  { label: "굴림", value: "Gulim" },
  { label: "돋움", value: "Dotum" },
  { label: "바탕", value: "Batang" },
  { label: "Pretendard", value: "Pretendard" }, // 🔥 추가
  { label: "나눔스퀘어", value: "NanumSquare" }, // 🔥 추가
];
```

## 🎯 빠른 시작 (예시)

### 1. Pretendard 폰트 사용 (무료, 상업적 이용 가능)

**다운로드:**

- [Pretendard GitHub](https://github.com/orioncactus/pretendard/releases)
- 또는 [눈누 - Pretendard](https://noonnu.cc/font_page/694)

**파일 위치:**

```
src/assets/fonts/Pretendard/
├── Pretendard-Regular.woff2
├── Pretendard-Bold.woff2
└── Pretendard-Light.woff2
```

**CSS 추가:**

```css
@font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard/Pretendard-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('/src/assets/fonts/Pretendard/Pretendard-Bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

## 📌 주의사항

1. **파일 크기 확인**

   - `.woff2` 파일은 보통 100~300KB
   - 1MB 이상이면 변환이 제대로 안된 것
2. **경로 확인**

   - Vite에서는 `/src/assets/...` 경로 사용
   - `public/` 폴더에 넣으면 `/fonts/...` 경로 사용
3. **폰트 라이센스 확인**

   - 눈누에서 상업적 이용 가능 폰트인지 확인
   - 대부분 무료지만 일부는 제한이 있을 수 있음
4. **여러 굵기(weight) 등록**

   - Regular (400), Bold (700) 등 각각 등록
   - 같은 `font-family` 이름, 다른 `font-weight`

## 🔍 폰트가 안 나올 때 체크리스트

- [ ] 파일 경로가 정확한가요?
- [ ] `.woff2` 형식으로 변환했나요?
- [ ] CSS에 `@font-face` 추가했나요?
- [ ] 브라우저 개발자 도구 > Network 탭에서 폰트 파일이 로드되나요?
- [ ] `EditorPage.jsx`의 `FONT_OPTIONS`에 추가했나요?

## 🎨 추천 무료 폰트 (눈누)

1. **Pretendard** - 현대적이고 깔끔한 폰트
2. **나눔스퀘어** - 네이버에서 만든 무료 폰트
3. **마루 부리** - 바탕체 계열
4. **Noto Sans KR** - 구글 폰트
5. **배달의민족 주아체** - 귀여운 느낌

모두 상업적 이용 가능!
