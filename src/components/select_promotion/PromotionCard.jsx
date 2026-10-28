import React from "react";
import { promotionItems } from "../../assets/promotionItems";

// 옵션별 예시 이미지: assets/promotion/options/{옵션 value}.jpg (실제 생성 결과를 줄인 것). 없으면 아이콘을 보여 준다
const THUMBNAIL_MAP = Object.fromEntries(
  Object.entries(
    import.meta.glob("../../assets/promotion/options/*.jpg", { eager: true, import: "default" })
  ).map(([path, url]) => [path.split("/").pop().replace(/\.jpg$/, ""), url])
);

// 아이콘 내부 정의 (import 없음)
const ICON_MAP = {
  logo_illustration: () => <div className="w-6 h-6 bg-indigo-400 rounded" />,
  logo_typography: () => <div className="w-6 h-6 bg-indigo-400 rounded-full" />,
  poster_cardnews: () => <div className="w-6 h-6 border-2 border-indigo-400 rounded" />,
  poster_video: () => <div className="w-6 h-6 border-2 border-indigo-400 border-dashed" />,
  leaflet: () => <div className="w-6 h-6 bg-indigo-400 rotate-12" />,
  road_banner: () => <div className="w-6 h-1 bg-indigo-400" />,
  bus_shelter: () => <div className="w-6 h-6 bg-indigo-400 opacity-70" />,
  subway_light: () => <div className="w-6 h-6 bg-indigo-400 blur-sm" />,
  bus_road: () => <div className="w-6 h-1 bg-indigo-400" />,
  streetlamp_banner: () => <div className="w-1 h-6 bg-indigo-400" />,
  subway_inner: () => <div className="w-6 h-6 bg-indigo-400 rounded-sm" />,

  sign_parking: () => <div className="w-6 h-6 border border-indigo-400 text-indigo-400 text-xs flex items-center justify-center">P</div>,
  sign_welcome: () => <div className="w-6 h-6 border border-indigo-400 text-indigo-400 text-xs flex items-center justify-center">W</div>,
  sign_toilet: () => <div className="w-6 h-6 border border-indigo-400 text-indigo-400 text-xs flex items-center justify-center">T</div>,
  mascot_video: () => <div className="w-6 h-6 bg-indigo-400/50 rounded-full" />,
  goods_sticker: () => <div className="w-6 h-6 border-2 border-indigo-400 rounded-lg" />,
  goods_key_ring: () => <div className="w-6 h-6 border-2 border-indigo-400 rounded-full" />,
  goods_emoticon: () => <div className="w-6 h-6 bg-indigo-400 rounded-lg" />,

  news: () => <div className="w-6 h-6 bg-indigo-400" />,
  etc_video: () => <div className="w-6 h-6 bg-indigo-400/40" />,
};

export default function PromotionCard({ category, selected, onToggle }) {
  const item = promotionItems.find((p) => p.id === category);
  if (!item) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {item.subOptions.map((opt) => {
        const isActive = selected.includes(opt.value);
        const thumbnail = THUMBNAIL_MAP[opt.value];
        const Icon = ICON_MAP[opt.value] || (() => <div />);

        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={[
              "relative w-full h-40 rounded-2xl border transition shadow bg-[#1a1c22]",
              isActive
                ? "border-indigo-500 bg-indigo-600/10"
                : "border-gray-700 hover:border-indigo-400 hover:bg-gray-700/40",
            ].join(" ")}
          >
            {/* 체크 아이콘 - 우측 상단 */}
            <div className="absolute top-3 right-3 z-10">
              {isActive ? (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <i className="bi bi-check text-white text-sm font-bold"></i>
                </div>
              ) : (
                <div className="w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center bg-transparent">
                </div>
              )}
            </div>

            <div className="flex justify-between items-start h-full p-4 gap-3">
              <div className="flex flex-col h-full">
                <span className="text-white font-semibold mt-auto">
                  {opt.label}
                </span>
              </div>

              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={opt.label}
                  className="w-24 h-24 rounded-lg object-contain bg-black/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-black/20 flex items-center justify-center">
                  <Icon />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
