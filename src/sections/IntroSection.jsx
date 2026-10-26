import React from "react";
import { useNavigate } from "react-router-dom";
import mainVideo from "../assets/sections/video/main_video.mp4";
import api from "../utils/api/BaseAPI";
import { useAuthStore } from "../store/authStore";


const IntroSection = () => {
  const navigate = useNavigate();
  const loggedIn = useAuthStore((s) => !!s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [testBusy, setTestBusy] = React.useState(false);
  const [testError, setTestError] = React.useState("");

  // test 계정으로 로그인 → 샘플 데이터가 자동 입력되는 흐름으로 바로 진입
  const startAsTest = async () => {
    setTestError("");
    setTestBusy(true);
    try {
      const res = await api.post("/api/auth/test-login");
      setSession(res.data);
      navigate("/select");
    } catch {
      setTestError("테스트 로그인을 사용할 수 없습니다.");
    } finally {
      setTestBusy(false);
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={mainVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <br /> 축제 홍보물 자동생성 서비스
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200">
          기획서 하나로 포스터부터 현수막, 영상 까지 한번에 해결하세요<br />
          프롬포트 부터 생성까지 AI가 도와줍니다.<br />
          
        </p>
       
          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={startAsTest}
              disabled={testBusy}
              className="px-8 py-3 rounded-full text-white font-semibold shadow-lg transition
                         border border-white/70 bg-white/10 backdrop-blur
                         hover:bg-white/20 hover:scale-105 disabled:opacity-60"
            >
              test 계정으로 로그인하기
            </button>
            <button
              onClick={() => navigate(loggedIn ? "/select" : "/login")}
              className="px-8 py-3 rounded-full text-white font-semibold shadow-lg transition 
                         bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 
                         hover:brightness-110 hover:scale-105"
            >
              실제 이용하기
            </button>
          </div>
          {testError && <p className="mt-3 text-sm text-red-300">{testError}</p>}
      </div>
    </section>
  );
};

export default IntroSection;
