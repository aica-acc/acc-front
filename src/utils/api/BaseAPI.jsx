import axios from "axios";

/**
 * 🧩 Base API 설정 (JSON + FormData 자동 인식 + 기본 m_no 주입)
 */

const api = axios.create({
  baseURL: "http://localhost:8081", // 👉 백엔드 포트
  withCredentials: true,
});

// ✅ 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // ✅ FormData면 Content-Type 자동 처리
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      // ✅ m_no 자동 추가
      if (!config.data.has("m_no")) {
        config.data.append("m_no", "M000001");
      }
    } else {
      // JSON 요청이면 m_no 필드 추가
      // 단, editor 관련 엔드포인트는 m_no 추가 안 함
      const url = config.url || "";
      const isEditorEndpoint = url.includes("/api/editor/");
      
      if (typeof config.data === "object" && config.data !== null && !isEditorEndpoint) {
        config.data = { m_no: "M000001", ...config.data };
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
    } else {
      console.error("[Axios Error] Network or Timeout:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
