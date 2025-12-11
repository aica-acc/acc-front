import React from "react";
import Header from "../layout/Header";
import IntroSection from "../sections/IntroSection";
import PosterSection from "../sections/PosterSection";
import CardnewsSection from "../sections/CardnewsSection";
import VideoSection from "../sections/VideoSection";
import MascortSection from "../sections/MascortSection";

const MainPage = () => {
  return (
    <>
      <Header />
      <main className="w-full overflow-x-hidden">
        <IntroSection />       {/* 메인 영상 */}
        <PosterSection />      {/* 포스터 생성 섹션 */}
        <CardnewsSection />    {/* 카드뉴스 생성 섹션 */}
        <MascortSection />     {/* 마스코트 생성 섹션 */}  
        <VideoSection/>        {/* 동영상 생성 섹션 */}
      </main>
    </>
  );
};

export default MainPage;
