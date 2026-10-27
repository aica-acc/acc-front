/**
 * 전역 앱 설정 파일
 */

// 백엔드(Spring) URL (.env 의 VITE_API_BASE_URL, 없으면 로컬 기본값)
// 프론트는 백엔드만 호출한다. 생성 이미지도 백엔드의 /files/... 주소로 받는다.
// 빈 문자열("")이면 같은 도메인으로 요청한다 (nginx 가 /api/, /files/ 를 백엔드로 전달하는 배포 환경)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

/**
 * (예전) 웹 경로를 서버 public 폴더의 절대경로로 바꿔 보내던 함수.
 * 서버 폴더 구조를 화면 코드에 두지 않도록, 이제 받은 파일 주소(/files/...)를 그대로 보낸다.
 * 절대경로가 필요한 곳은 백엔드가 직접 만든다 (EditorBuildServiceImpl).
 */
export const convertToFullPath = (path) => path || "";
