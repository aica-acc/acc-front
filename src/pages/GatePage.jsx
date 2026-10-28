import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import mainVideo from "../assets/sections/video/main_video_720.mp4";
import mainIcon from "../assets/icorn/main_icorn.webp";
import posterSample from "../assets/promotion/poster/poster_6.jpg";
import mascotSample from "../assets/promotion/mascot/mascot_6.jpg";
import bannerSample from "../assets/promotion/options/road_banner.jpg";
import api from "../utils/api/BaseAPI";
import { useAuthStore } from "../store/authStore";
import { endDemoSession } from "../utils/demo";

/**
 * 첫 화면 (서비스 입구). 여기서 실제로 쓸지, 미리 만들어 둔 결과로 체험할지 나눈다.
 * - 시작하기: 메인(/home) → 로그인·가입 후 실제 생성 (크레딧 차감)
 * - 체험해 보기: 데모(test) 계정으로 메인에 들어가 같은 흐름을 미리 만든 결과로 따라간다
 * 메인 화면에는 체험 관련 문구를 두지 않는다.
 */
export default function GatePage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.member?.role);
  const loggedIn = useAuthStore((s) => !!s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 첫 화면으로 돌아오면(뒤로 가기 등) 체험 세션은 끝낸다
  useEffect(() => {
    if (useAuthStore.getState().member?.role === "TEST") endDemoSession();
  }, []);

  useEffect(() => {
    api
      .get("/api/auth/config")
      .then((res) => setDemoEnabled(!!res.data?.testLoginEnabled))
      .catch(() => setDemoEnabled(false));
  }, []);

  // 이미 실제 계정으로 로그인했다면 바로 메인으로
  if (loggedIn && role && role !== "TEST") return <Navigate to="/home" replace />;

  const start = () => {
    // 실제 사용: 체험 중이던 세션과 진행 상태를 모두 정리하고 시작
    if (role === "TEST") endDemoSession();
    navigate("/home");
  };

  const tryDemo = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/api/auth/test-login");
      endDemoSession();
      setSession(res.data);
      navigate("/home");
    } catch {
      setError("지금은 체험하기를 사용할 수 없습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-white">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
        <source src={mainVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-indigo-950/70" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 sm:px-10 py-5">
          <img src={mainIcon} alt="ACC" className="w-24 h-14 object-contain" />
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full border border-white/40 text-sm font-semibold hover:bg-white/10 transition"
          >
            로그인
          </button>
        </header>

        <main className="flex flex-1 items-center px-6 sm:px-10 pb-16">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold tracking-widest text-amber-300">AI 축제 홍보물 자동 생성</p>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                기획서 하나로
                <br />
                축제 홍보물 전부를
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-300">
                기획서를 올리면 트렌드를 분석하고, 포스터와 마스코트부터 현수막·굿즈·홍보 영상, 보도자료까지
                한 번에 만들어 드립니다.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={start}
                  className="px-9 py-4 rounded-full font-semibold text-lg shadow-xl transition bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 hover:scale-[1.02]"
                >
                  시작하기
                </button>
                {demoEnabled && (
                  <button
                    onClick={tryDemo}
                    disabled={busy}
                    className="px-9 py-4 rounded-full font-semibold text-lg border border-white/60 bg-white/10 backdrop-blur transition hover:bg-white/20 disabled:opacity-60"
                  >
                    {busy ? "준비 중…" : "체험해 보기"}
                  </button>
                )}
              </div>
              {demoEnabled && (
                <p className="mt-4 text-sm text-gray-400">
                  체험하기는 가입 없이, 미리 만들어 둔 축제 결과로 전체 과정을 둘러봅니다.
                </p>
              )}
              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            </div>

            {/* 결과 예시 */}
            <div className="relative hidden lg:block h-[460px]">
              <img
                src={posterSample}
                alt="포스터 예시"
                className="absolute left-6 top-0 w-60 rounded-2xl shadow-2xl ring-1 ring-white/10 -rotate-3"
              />
              <img
                src={mascotSample}
                alt="마스코트 예시"
                className="absolute right-4 top-16 w-56 rounded-2xl shadow-2xl ring-1 ring-white/10 rotate-3 bg-white"
              />
              <img
                src={bannerSample}
                alt="현수막 예시"
                className="absolute bottom-6 left-24 w-96 rounded-xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
