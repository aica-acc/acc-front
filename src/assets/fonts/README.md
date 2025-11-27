# 폰트 파일 저장소

## 폰트 파일 추가 방법

### 1. 눈누(noonnu.cc)에서 폰트 다운로드

- 원하는 폰트 다운로드 (.ttf, .otf 파일)

### 2. 웹 폰트 형식으로 변환 (권장)

- [Transfonter](https://transfonter.org/) 또는 [CloudConvert](https://cloudconvert.com/ttf-to-woff2) 사용
- .woff2 형식으로 변환 (가장 최적화된 형식)
- .woff 형식도 함께 변환 (IE11 호환성)

### 3. 파일 저장 구조

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

### 4. 사용 가능한 형식

- ✅ .woff2 (최신 브라우저, 가장 가벼움, **권장**)
- ✅ .woff (구형 브라우저 호환)
- ✅ .ttf (폴백용)
- ❌ .otf (웹에서 비효율적, 변환 필요)

### 5. CSS 등록

`src/index.css` 파일에 @font-face 추가

### 6. Tailwind CSS 설정

`tailwind.config.js`에 폰트 패밀리 추가
