// 로그인 상태(JWT + 회원 정보) 저장소. localStorage 를 쓰지만 접근 실패(시크릿 모드 등)에도 앱이 죽지 않게 감싼다.
const KEY = "acc_auth";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};

export const getToken = () => read()?.token || null;
export const getMember = () => read()?.member || null;
export const isLoggedIn = () => !!getToken();
export const getRole = () => getMember()?.role || null;
export const hasRole = (...roles) => roles.includes(getRole());
/** 테스트 계정 / 관리자만 샘플 데이터 자동 입력 기능을 쓴다 */
export const canUseTestTools = () => hasRole("TEST", "ADMIN");

export const setSession = ({ token, member }) => {
  try {
    // 이전 계정이 남긴 작성 중인 폼이 다음 계정에 보이지 않게 비운다
    localStorage.removeItem("festivalForm");
    localStorage.setItem(KEY, JSON.stringify({ token, member }));
  } catch {
    /* 저장 불가 환경: 새로고침하면 로그인이 풀린다 */
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("festivalForm");
  } catch {
    /* ignore */
  }
};
