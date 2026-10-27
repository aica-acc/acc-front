import axios from "axios";
import { API_BASE_URL } from "../../config/appConfig";
import { getToken, getMember, clearSession } from "../auth";

/**
 * 🧩 Base API 설정 (JSON + FormData 자동 인식 + 기본 m_no 주입)
 */

const api = axios.create({
  baseURL: API_BASE_URL, // 👉 백엔드 주소 (.env: VITE_API_BASE_URL)
  withCredentials: true,
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // ✅ 로그인 토큰 첨부 (백엔드는 토큰의 회원만 신뢰한다. m_no 는 기존 API 호환용)
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    const mNo = getMember()?.mNo || "";

    // ✅ FormData면 Content-Type 자동 처리
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      // ✅ m_no 자동 추가
      if (!config.data.has("m_no")) {
        config.data.append("m_no", mNo);
      }
    } else {
      // JSON 요청이면 m_no 필드 추가
      // 단, editor 관련 엔드포인트는 m_no 추가 안 함
      const url = config.url || "";
      const isEditorEndpoint = url.includes("/api/editor/");
      
      if (typeof config.data === "object" && config.data !== null && !isEditorEndpoint) {
        config.data = { m_no: mNo, ...config.data };
      }
      config.headers["Content-Type"] = "application/json";
    }

    // ✅ 개발 모드 로깅
    if (import.meta.env.MODE === "development") {
      console.log(`[Axios Request] ${config.method?.toUpperCase()} → ${config.url}`, config.data || "");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[Axios Error] ${error.response.status}:`, error.response.data);
      // 토큰이 만료/무효이면 로그인 화면으로 (로그인·가입 요청 자체의 401 은 화면에서 메시지로 처리)
      const url = error.config?.url || "";
      if (error.response.status === 401 && getToken() && !url.startsWith("/api/auth/")) {
        clearSession();
        window.location.assign("/login");
      }
    } else {
      console.error("[Axios Error] Network or Timeout:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
