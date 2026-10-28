import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import { useAuthStore } from "../store/authStore";
import { socialRedirectUri } from "../components/auth/SocialLoginButtons";
import { endDemoSession } from "../utils/demo";

/** 카카오·구글 로그인 창에서 돌아오는 화면: code 를 서버에 넘겨 로그인(처음이면 가입)한다 */
export default function OAuthCallbackPage() {
  const { provider } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState("");
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem("oauth_state") || "null");
    } catch {
      saved = null;
    }
    sessionStorage.removeItem("oauth_state");

    const code = params.get("code");
    if (params.get("error") || !code) {
      setError("로그인이 취소되었습니다.");
      return;
    }
    if (!saved || saved.provider !== provider || saved.state !== params.get("state")) {
      setError("로그인 요청이 올바르지 않습니다. 다시 시도해 주세요.");
      return;
    }

    api
      .post(`/api/auth/oauth/${provider}`, { code, redirectUri: socialRedirectUri(provider) })
      .then((res) => {
        // 체험 중이던 세션이 있었다면 정리하고 실제 계정으로
        endDemoSession();
        setSession(res.data);
        navigate(saved.afterLogin || "/home", { replace: true });
      })
      .catch((e) => setError(e.response?.data?.message || "로그인에 실패했습니다. 다시 시도해 주세요."));
  }, [provider, params, navigate, setSession]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold"
            >
              로그인 화면으로
            </button>
          </>
        ) : (
          <p className="text-gray-300">로그인 중입니다…</p>
        )}
      </div>
    </div>
  );
}
