import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * 로그인 상태(JWT + 회원 정보) 전역 스토어.
 *  - localStorage("acc_auth") 에 저장되어 새로고침해도 로그인이 유지된다.
 *  - 컴포넌트는 훅으로 구독한다:  const member = useAuthStore((s) => s.member);
 *    → 로그인/로그아웃/프로필 수정 시 해당 컴포넌트가 자동으로 다시 그려진다.
 *  - axios 인터셉터처럼 React 밖에서는 useAuthStore.getState() 로 읽는다 (utils/auth.js 참고).
 *  - 저장소 접근이 막힌 환경(시크릿 모드 등)에서는 메모리에서만 동작한다.
 */

const STORAGE_KEY = "acc_auth";

// localStorage 접근이 throw 해도 앱이 죽지 않도록 감싼 저장소
const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* 저장 불가: 새로고침하면 로그인이 풀린다 */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      member: null,

      /** 로그인/가입 성공 시 호출: { token, member } */
      setSession: ({ token, member }) => {
        // 이전 계정이 남긴 작성 중인 폼이 다음 계정에 보이지 않게 비운다
        safeStorage.removeItem("festivalForm");
        set({ token, member });
      },

      /** 프로필 수정 후 회원 정보만 갱신 (토큰은 유지) */
      updateMember: (member) => set((s) => (s.token ? { member } : s)),

      /** 로그아웃 / 토큰 만료 */
      clearSession: () => {
        safeStorage.removeItem("festivalForm");
        set({ token: null, member: null });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      // 함수는 저장하지 않고 데이터만 저장
      partialize: (s) => ({ token: s.token, member: s.member }),
    }
  )
);

// 다른 탭에서 로그인/로그아웃하면 이 탭에도 즉시 반영
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      useAuthStore.persist.rehydrate();
    }
  });
}
