import React from "react";
import { useNavigate } from "react-router-dom";
import mainVideo from "../assets/sections/video/main_video.mp4";
import api from "../utils/api/BaseAPI";
import { useAuthStore } from "../store/authStore";
import { openProject, stepLabel } from "../utils/project";


const IntroSection = () => {
  const navigate = useNavigate();
  const loggedIn = useAuthStore((s) => !!s.token);
  const [error, setError] = React.useState("");
  // 가장 최근에 진행한 프로젝트 ("이어서 하기")
  const [recent, setRecent] = React.useState(null);

  React.useEffect(() => {
    if (!loggedIn) {
      setRecent(null);
      return;
    }
    let alive = true;
    api
      .get("/api/progress/current")
      .then((res) => alive && setRecent(res.status === 200 ? res.data : null))
      .catch(() => alive && setRecent(null));
    return () => {
      alive = false;
    };
  }, [loggedIn]);

  const resumeRecent = async () => {
    try {
      const route = await openProject();
      navigate(route || "/select");
    } catch {
      setError("프로젝트를 불러오지 못했습니다.");
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
              onClick={() => navigate(loggedIn ? "/select" : "/login")}
              className="px-8 py-3 rounded-full text-white font-semibold shadow-lg transition 
                         bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 
                         hover:brightness-110 hover:scale-105"
            >
              시작하기
            </button>
          </div>
          {recent && (
            <button
              onClick={resumeRecent}
              className="mt-4 text-sm text-white/90 underline underline-offset-4 hover:text-white"
            >
              이어서 하기 · {recent.title || `프로젝트 ${recent.pNo}`} ({stepLabel(recent.route)})
            </button>
          )}
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </div>
    </section>
  );
};

export default IntroSection;
