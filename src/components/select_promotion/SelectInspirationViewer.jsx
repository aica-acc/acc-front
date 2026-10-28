// src/components/select_promotion/SelectInspirationViewer.jsx
import React from "react";

// 영감 이미지: assets/promotion/{poster,mascot}/*.jpg (실제 생성 결과를 줄인 것)
const byName = (files) =>
  Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url);

const inspirationImages = {
  poster: byName(import.meta.glob("../../assets/promotion/poster/*.jpg", { eager: true, import: "default" })),
  mascot: byName(import.meta.glob("../../assets/promotion/mascot/*.jpg", { eager: true, import: "default" })),
  etc: [], // 필요하면 나중에 넣으면 됨
};

export default function SelectInspirationViewer({ category }) {
  const images = inspirationImages[category] || [];

  return (
    <div className="mt-10 mb-12">
      <h2 className="text-xl font-bold text-white mb-4">영감 이미지</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt=""
            className="w-full h-48 object-cover rounded-lg border border-gray-700 shadow"
          />
        ))}
      </div>
    </div>
  );
}
