import React, { useEffect, useState } from "react";
import api from "../../utils/api/BaseAPI";

// 로그인 창에서 돌아올 주소 (각 개발자 콘솔에 Redirect URI 로 등록해야 한다)
export const socialRedirectUri = (provider) => `${window.location.origin}/auth/${provider}/callback`;

const AUTHORIZE = {
  kakao: (clientId, state) =>
    "https://kauth.kakao.com/oauth/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: socialRedirectUri("kakao"),
      state,
    }),
  google: (clientId, state) =>
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: socialRedirectUri("google"),
      scope: "openid email profile",
      prompt: "select_account",
      state,
    }),
};

const STYLE = {
  kakao: { label: "카카오로 계속하기", className: "bg-[#FEE500] text-[#191919] hover:brightness-95" },
  google: { label: "구글로 계속하기", className: "bg-white text-gray-800 hover:bg-gray-100" },
};

/** 로그인 화면의 소셜 로그인 버튼. 서버에 키가 설정된 제공자만 보인다 */
export default function SocialLoginButtons({ afterLogin }) {
  const [providers, setProviders] = useState({});

  useEffect(() => {
    api
      .get("/api/auth/config")
      .then((res) => setProviders(res.data?.social || {}))
      .catch(() => setProviders({}));
  }, []);

  const start = (provider) => {
    // 위조 요청을 막기 위한 state, 로그인 후 돌아갈 화면은 이 탭에 잠시 기억한다
    const state = crypto.getRandomValues(new Uint32Array(4)).join("-");
    sessionStorage.setItem("oauth_state", JSON.stringify({ provider, state, afterLogin }));
    window.location.assign(AUTHORIZE[provider](providers[provider], state));
  };

  const list = Object.keys(providers).filter((p) => AUTHORIZE[p]);
  if (list.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex-1 h-px bg-gray-700" />
        또는
        <span className="flex-1 h-px bg-gray-700" />
      </div>
      <div className="space-y-2">
        {list.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => start(p)}
            className={`w-full rounded-lg py-3 font-semibold transition ${STYLE[p].className}`}
          >
            {STYLE[p].label}
          </button>
        ))}
      </div>
    </div>
  );
}
