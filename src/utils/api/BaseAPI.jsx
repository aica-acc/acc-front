import axios from "axios";
import { API_BASE_URL } from "../../config/appConfig";
import { getToken, clearSession } from "../auth";

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
    // ✅ 로그인 토큰 첨부. 회원은 백엔드가 토큰으로 알아내므로 회원번호(m_no)는 보내지 않는다
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // ✅ FormData면 Content-Type 자동 처리
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
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
