import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AccStartButton from "../components/buttons/AccStartButton";

// 🎨 카드뉴스용 이미지 묶음 (4컷씩 구성)
import set1_1 from "../assets/sections/cardnews/1.1.png";
import set1_2 from "../assets/sections/cardnews/1.2.png";
import set1_3 from "../assets/sections/cardnews/1.3.png";
import set1_4 from "../assets/sections/cardnews/1.4.png";

import set2_1 from "../assets/sections/cardnews/2.1.png";
import set2_2 from "../assets/sections/cardnews/2.2.png";
import set2_3 from "../assets/sections/cardnews/2.3.png";
import set2_4 from "../assets/sections/cardnews/2.4.png";

import set3_1 from "../assets/sections/cardnews/3.1.png";
import set3_2 from "../assets/sections/cardnews/3.2.png";
import set3_3 from "../assets/sections/cardnews/3.3.png";
import set3_4 from "../assets/sections/cardnews/3.4.png";

const FESTIVALS = [
  "보령머드축제",
  "담양산타축제",
  "고흥우주항공축제",
];

const CARDNEWS_SETS = [
  [set1_1, set1_2, set1_3, set1_4],
  [set2_1, set2_2, set2_3, set2_4],
  [set3_1, set3_2, set3_3, set3_4],
];

// 카드 사이즈 세팅
const CARD_W = 520;
const CARD_H = 660;
const GAP = 40;
const TRANSITION_MS = 500;

export default function CardnewsSection() {
  const trackItems = useMemo(
    () => [CARDNEWS_SETS[CARDNEWS_SETS.length - 1], ...CARDNEWS_SETS, CARDNEWS_SETS[0]],
    []
  );

  const [trackIndex, setTrackIndex] = useState(1);
  const activeIndex = (trackIndex - 1 + CARDNEWS_SETS.length) % CARDNEWS_SETS.length;
  const [withTransition, setWithTransition] = useState(true);

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

  const snapTo = (idx) => {
    setWithTransition(false);
    setTrackIndex(idx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setWithTransition(true));
    });
  };

  const next = () => setTrackIndex((v) => v + 1);
  const prev = () => setTrackIndex((v) => v - 1);

  const onTransitionEnd = () => {
    if (trackIndex === trackItems.length - 1) snapTo(1);
    if (trackIndex === 0) snapTo(trackItems.length - 2);
  };

  const handleFestivalClick = (i) => setTrackIndex(i + 1);

  return (
    <section className="bg-neutral-900 text-white py-20 px-5 flex flex-col items-center overflow-hidden">
      <h2 className="text-4xl font-bold mb-10">Card News</h2>

      {/* 축제 버튼 */}
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
          {trackItems.map((set, i) => {
            const realIdx = (i - 1 + CARDNEWS_SETS.length) % CARDNEWS_SETS.length;
            const isActive = realIdx === activeIndex;
            return (
              <div
                key={i}
                className={`rounded-2xl overflow-hidden bg-gray-800 shadow-lg transition-all duration-500 ${
                  isActive ? "scale-105 opacity-100 z-20" : "scale-90 opacity-45 z-10"
                }`}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  flex: "0 0 auto",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: "6px",
                }}
              >
                {set.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`card-${realIdx}-${idx}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* 좌우 화살표 */}
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
