import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AccStartButton from "../components/buttons/AccStartButton";

import img1 from "../assets/sections/poster/1.jpg";
import img2 from "../assets/sections/poster/2.png";
import img3 from "../assets/sections/poster/3.jpg";
import img4 from "../assets/sections/poster/4.jpg";
import img5 from "../assets/sections/poster/5.jpg";

const FESTIVALS = ["보령머드축제","담양산타축제","고흥우주항공축제","광양매화축제","김치축제"];
const POSTERS = [img1, img2, img3, img4, img5];

// 🔧 사이즈 조정 (가로폭 늘림)
const CARD_W = 360;    // ← 이전 320에서 확대
const CARD_H = 490;
const GAP    = 28;
const TRANSITION_MS = 500;

export default function VideoSection() {
  // [lastClone, ...real, firstClone]
  const trackItems = useMemo(
    () => [POSTERS[POSTERS.length - 1], ...POSTERS, POSTERS[0]],
    []
  );

  // 트랙상의 인덱스(클론 포함). 1이 real의 0번.
  const [trackIndex, setTrackIndex] = useState(1);
  // 중앙 활성(real) 인덱스
  const activeIndex = (trackIndex - 1 + POSTERS.length) % POSTERS.length;

  const [withTransition, setWithTransition] = useState(true);

  // 컨테이너 중앙 정렬
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(0);
  useEffect(() => {
    const measure = () => setContainerW(containerRef.current?.clientWidth || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const centerOffset = (containerW - CARD_W) / 2;

  const translateX = -(trackIndex * (CARD_W + GAP)) + centerOffset;

  // 🔁 무한루프 스냅 함수 (점프 티 제거)
  const snapTo = (idx) => {
    // 1) 전환 끄고 인덱스만 바꿈 (스타일 적용 기회 주기)
    setWithTransition(false);
    setTrackIndex(idx);
    // 2) 두 프레임 기다린 뒤 전환 다시 켜기 (브라우저 레이아웃 반영 보장)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setWithTransition(true));
    });
  };

  // 좌우 이동
  const next = () => setTrackIndex((v) => v + 1);
  const prev = () => setTrackIndex((v) => v - 1);

  // 전환 종료 후 가장자리 클론에서 실제 위치로 스냅
  const onTransitionEnd = () => {
    // 끝(마지막 클론) → real 첫번째
    if (trackIndex === trackItems.length - 1) {
      snapTo(1);
    }
    // 처음(첫 클론) → real 마지막
    if (trackIndex === 0) {
      snapTo(trackItems.length - 2);
    }
  };

  // 축제 버튼 클릭 시 해당 카드로 이동 (애니메이션 포함)
  const handleFestivalClick = (i) => setTrackIndex(i + 1);

  return (
    <section className="bg-neutral-900 text-white py-24 px-6 flex flex-col items-center overflow-hidden">
      <h2 className="text-4xl font-bold mb-10">Video</h2>

      {/* 축제 버튼 (캐러셀과 동기화) */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {FESTIVALS.map((f, i) => (
          <button
            key={f}
            onClick={() => handleFestivalClick(i)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition
              ${activeIndex === i ? "bg-orange-500 text-white border-orange-500" : "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 캐러셀 */}
      <div ref={containerRef} className="relative w-full max-w-6xl overflow-hidden">
        <div
          className="flex items-center"
          style={{
            gap: `${GAP}px`,
            width: trackItems.length * (CARD_W + GAP),
            transform: `translateX(${translateX}px)`,
            transition: withTransition ? `transform ${TRANSITION_MS}ms ease-in-out` : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {trackItems.map((src, i) => {
            const realIdx = (i - 1 + POSTERS.length) % POSTERS.length;
            const isActive = realIdx === activeIndex;
            return (
              <div
                key={`${i}-${src}`}
                className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ${
                  isActive ? "scale-105 opacity-100 z-20" : "scale-90 opacity-45 z-10"
                }`}
                style={{ width: CARD_W, height: CARD_H, flex: "0 0 auto" }}
              >
                <img src={src} alt={`poster-${realIdx}`} className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>

        {/* 좌우 네비게이션 */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-3 -translate-y-1/2 p-3 bg-white rounded-full shadow hover:scale-105 transition"
        >
          <ChevronLeft className="text-black" />
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-3 bg-white rounded-full shadow hover:scale-105 transition"
        >
          <ChevronRight className="text-black" />
        </button>
      </div>

      <AccStartButton />
    </section>
  );
}
