import React from "react";
import { useNavigate } from "react-router-dom";
import mainVideo from "../assets/sections/video/main_video.mp4";


const IntroSection = () => {
  const navigate = useNavigate();

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
          <button
            onClick={() => navigate("/select")}
            className="px-8 py-3 rounded-full text-white font-semibold shadow-lg transition 
                       bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 
                       hover:brightness-110 hover:scale-105"
          >
            ACC AI 시작하기
          </button>
      </div>
    </section>
  );
};

export default IntroSection;
