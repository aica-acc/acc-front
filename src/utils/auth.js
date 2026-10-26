// 로그인 상태 헬퍼. 실제 상태는 Zustand 스토어(src/store/authStore.js)에 있다.
//
//  - React 컴포넌트에서는 화면이 자동 갱신되도록 훅을 쓴다:
//      import { useAuthStore } from "../store/authStore";
//      const member = useAuthStore((s) => s.member);
//  - 아래 함수들은 React 밖(axios 인터셉터 등)이나 이벤트 핸들러에서 "현재 값"을 한 번 읽거나 바꿀 때 쓴다.
import { useAuthStore } from "../store/authStore";

const state = () => useAuthStore.getState();

export const getToken = () => state().token;
export const getMember = () => state().member;
export const isLoggedIn = () => !!state().token;
export const getRole = () => state().member?.role || null;
export const hasRole = (...roles) => roles.includes(getRole());
/** 테스트 계정 / 관리자만 샘플 데이터 자동 입력 기능을 쓴다 */
export const canUseTestTools = () => hasRole("TEST", "ADMIN");

export const setSession = (session) => state().setSession(session);
export const updateMember = (member) => state().updateMember(member);
export const clearSession = () => state().clearSession();
