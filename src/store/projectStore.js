import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../utils/api/BaseAPI";
import { API_BASE_URL } from "../config/appConfig";
import { getToken } from "../utils/auth";
import { useAuthStore } from "./authStore";

/**
 * 진행 중인 프로젝트 상태 (서버 project_progress 의 사본).
 *
 * 이전에는 화면 사이에 넘기는 값(기획서 분석 결과, 선택한 유형, 고른 포스터…)을
 * 브라우저 sessionStorage 에만 두었다. 그래서 새로고침·탭 종료·다른 기기에서는 이어갈 수 없었고,
 * 키 하나가 덮어써지면(예: proposalData 의 pNo 누락) 엉뚱한 프로젝트로 저장되는 문제가 생겼다.
 *
 * 지금은 서버가 원본이다.
 *  - 화면은 utils/projectSession.js 로 sessionStorage 와 같은 방식으로 읽고 쓴다(동기).
 *  - 쓰기는 이 스토어에 바로 반영되고, 서버에는 모아서(디바운스) PUT /api/progress/{pNo} 로 저장한다.
 *  - ProjectGate 가 화면에 들어가기 전에 서버에서 상태를 불러온다.
 * 브라우저에는 "지금 보는 프로젝트 번호(pNo)"만 남긴다 (탭 단위, sessionStorage).
 */

const FLUSH_DELAY_MS = 400;

let pending = { set: {}, remove: new Set(), route: null };
let flushTimer = null;

const hasPending = () =>
  Object.keys(pending.set).length > 0 || pending.remove.size > 0 || pending.route !== null;

const takePending = () => {
  const body = { set: pending.set, remove: [...pending.remove], route: pending.route };
  pending = { set: {}, remove: new Set(), route: null };
  return body;
};

export const useProjectStore = create(
  persist(
    (set, get) => ({
      pNo: null,
      title: null,
      route: null,
      state: {},
      /** idle: 아직 안 불러옴 / loading / ready / none: 진행 중인 프로젝트 없음 / error */
      status: "idle",

      /** 특정 프로젝트를 서버에서 불러와 현재 프로젝트로 삼는다 (마이페이지에서 골라 이어하기) */
      load: async (pNo) => {
        await get().flush();
        set({ status: "loading" });
        try {
          const res = await api.get(`/api/progress/${pNo}`);
          get()._apply(res.data);
          return res.data;
        } catch (e) {
          set({ status: "error" });
          throw e;
        }
      },

      /** 가장 최근에 진행한 프로젝트를 불러온다 (이어서 하기). 없으면 null */
      loadCurrent: async () => {
        await get().flush();
        set({ status: "loading" });
        try {
          const res = await api.get("/api/progress/current");
          if (res.status === 204 || !res.data) {
            set({ pNo: null, title: null, route: null, state: {}, status: "none" });
            return null;
          }
          get()._apply(res.data);
          return res.data;
        } catch (e) {
          set({ status: "error" });
          throw e;
        }
      },

      /** 기획서 분석으로 새 프로젝트가 만들어졌을 때 */
      start: async (pNo) => {
        pending = { set: {}, remove: new Set(), route: null };
        set({ pNo, title: null, route: null, state: {}, status: "idle" });
        return get().load(pNo);
      },

      /** 새 기획서를 올리기 전 / 로그아웃 시 */
      reset: () => {
        pending = { set: {}, remove: new Set(), route: null };
        clearTimeout(flushTimer);
        set({ pNo: null, title: null, route: null, state: {}, status: "idle" });
      },

      getItem: (key) => {
        const v = get().state[key];
        return v === undefined ? null : v;
      },

      setItem: (key, value) => {
        const str = String(value);
        set((s) => ({ state: { ...s.state, [key]: str } }));
        pending.set[key] = str;
        pending.remove.delete(key);
        get()._schedule();
      },

      removeItem: (key) => {
        set((s) => {
          if (!(key in s.state)) return s;
          const next = { ...s.state };
          delete next[key];
          return { state: next };
        });
        delete pending.set[key];
        pending.remove.add(key);
        get()._schedule();
      },

      /** 마지막으로 머문 화면 ("이어서 하기"가 돌아갈 곳) */
      setRoute: (route) => {
        if (get().route === route) return;
        set({ route });
        pending.route = route;
        get()._schedule();
      },

      /** 모아둔 변경을 서버에 저장 */
      flush: async () => {
        clearTimeout(flushTimer);
        const pNo = get().pNo;
        if (!pNo || !hasPending()) return;
        const body = takePending();
        try {
          await api.put(`/api/progress/${pNo}`, body);
        } catch (e) {
          // 실패하면 다음 저장 때 다시 보낸다 (그 사이 새로 바뀐 값이 우선)
          pending.set = { ...body.set, ...pending.set };
          body.remove.forEach((k) => {
            if (!(k in pending.set)) pending.remove.add(k);
          });
          if (pending.route === null) pending.route = body.route;
          console.warn("[projectStore] 진행 상태 저장 실패, 다음에 다시 시도합니다.", e);
        }
      },

      _schedule: () => {
        clearTimeout(flushTimer);
        flushTimer = setTimeout(() => get().flush(), FLUSH_DELAY_MS);
      },

      _apply: (progress) => {
        set({
          pNo: progress.pNo,
          title: progress.title ?? null,
          route: progress.route ?? null,
          // 서버 값 위에, 아직 서버에 못 보낸 로컬 변경을 얹는다
          state: { ...(progress.state || {}), ...pending.set },
          status: "ready",
        });
      },
    }),
    {
      name: "acc_project",
      storage: createJSONStorage(() => sessionStorage),
      // 브라우저에는 "지금 보는 프로젝트 번호"만 남긴다. 내용은 서버가 원본
      partialize: (s) => ({ pNo: s.pNo }),
    }
  )
);

// 로그아웃하면 이전 계정의 프로젝트가 남지 않게 비운다
useAuthStore.subscribe((s, prev) => {
  if (prev.token && !s.token) {
    useProjectStore.getState().reset();
  }
});

// 탭을 닫거나 다른 페이지로 나가기 직전, 아직 못 보낸 변경을 보낸다 (keepalive)
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    const { pNo } = useProjectStore.getState();
    const token = getToken();
    if (!pNo || !token || !hasPending()) return;
    clearTimeout(flushTimer);
    fetch(`${API_BASE_URL}/api/progress/${pNo}`, {
      method: "PUT",
      keepalive: true,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(takePending()),
    }).catch(() => {});
  });
}
