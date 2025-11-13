import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import video1 from "../assets/sections/video/sample1.mp4";
import video2 from "../assets/sections/video/sample2.mp4";
import video3 from "../assets/sections/video/sample3.mp4";

const videos = [video1, video2, video3];

export default function VideoSection() {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const next = () => {
    setIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative w-full h-screen bg-neutral-900 flex flex-col items-center justify-center overflow-hidden text-white">
      {/* 상단 제목 */}
      <h2 className="absolute top-6 text-3xl font-bold tracking-wide z-20">Video</h2>

      {/* 비디오 캐러셀 컨테이너 */}
      <div className="relative w-[90%] h-[80%] flex items-center justify-center overflow-hidden">
        {videos.map((src, i) => {
          const isActive = i === index;
          const isPrev = i === (index - 1 + videos.length) % videos.length;
          const isNext = i === (index + 1) % videos.length;

          return (
            <div
              key={i}
              className={`
                absolute transition-all duration-700 ease-in-out
                ${isActive ? "scale-100 opacity-100 z-20" : "scale-90 opacity-40 z-10"}
                ${isPrev ? "-translate-x-[60%]" : ""}
                ${isNext ? "translate-x-[60%]" : ""}
              `}
            >
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                className={`rounded-lg object-cover w-[1000px] h-[560px] shadow-lg ${
                  isActive ? "" : "blur-[1px] brightness-75"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* 캐러셀 버튼 */}
      <div className="absolute bottom-10 flex gap-6 z-30">
        <button
          onClick={prev}
          className="p-3 bg-white/20 hover:bg-white/40 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={next}
          className="p-3 bg-white/20 hover:bg-white/40 rounded-full transition"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
