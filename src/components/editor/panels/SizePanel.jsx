// src/components/editor/panels/SizePanel.jsx
import React, { useEffect, useState, useCallback } from "react";

const SizePanel = ({ fabricRef, onAfterResize }) => {
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [useMagicResize, setUseMagicResize] = useState(true);

  // 캔버스 현재 크기 동기화
  useEffect(() => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const w = canvas.getWidth?.() || canvas.width || 1080;
    const h = canvas.getHeight?.() || canvas.height || 1080;
    setWidth(Math.round(w));
    setHeight(Math.round(h));
  }, [fabricRef]);

  const handleApplySize = useCallback(() => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const newW = Number(width) || 0;
    const newH = Number(height) || 0;
    if (newW <= 0 || newH <= 0) return;

    const oldW = canvas.getWidth?.() || canvas.width || newW;
    const oldH = canvas.getHeight?.() || canvas.height || newH;

    const scaleX = newW / oldW;
    const scaleY = newH / oldH;

    if (useMagicResize) {
      const objects = canvas.getObjects?.() || [];
      objects.forEach((obj) => {
        if (obj.type === "activeSelection") return;

        if (typeof obj.scaleX === "number") obj.scaleX *= scaleX;
        if (typeof obj.scaleY === "number") obj.scaleY *= scaleY;
        if (typeof obj.left === "number") obj.left *= scaleX;
        if (typeof obj.top === "number") obj.top *= scaleY;
        if (typeof obj.setCoords === "function") obj.setCoords();
      });
    }

    // 캔버스 크기 변경
    if (typeof canvas.setDimensions === "function") {
      canvas.setDimensions({ width: newW, height: newH });
    } else {
      // 안전장치
      canvas.width = newW;
      canvas.height = newH;
    }

    // 배경 이미지가 있다면 같이 리스케일/중앙 정렬
    const bg = canvas.backgroundImage;
    if (bg) {
      const scaleXBg = newW / (bg.width || newW);
      const scaleYBg = newH / (bg.height || newH);
      const scaleBg = Math.max(scaleXBg, scaleYBg);

      bg.set({
        originX: "left",
        originY: "top",
        scaleX: scaleBg,
        scaleY: scaleBg,
      });

      const center = canvas.getCenter?.() || { left: newW / 2, top: newH / 2 };
      bg.set({
        left: center.left - (bg.width * scaleBg) / 2,
        top: center.top - (bg.height * scaleBg) / 2,
      });
    }

    canvas.requestRenderAll?.();

    if (typeof onAfterResize === "function") {
      onAfterResize();
    }
  }, [fabricRef, width, height, useMagicResize, onAfterResize]);

  return (
    <div className="flex-1 flex flex-col p-3 text-[12px] text-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-xs">Canvas Size</span>
        <label className="flex items-center gap-1 text-[11px] text-gray-300">
          <span>Use magic resize</span>
          <button
            type="button"
            onClick={() => setUseMagicResize((v) => !v)}
            className={`relative w-9 h-4 rounded-full transition-colors ${
              useMagicResize ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-transform ${
                useMagicResize ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-14 text-[11px] text-gray-300">Width</span>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="flex-1 px-2 py-1 text-[11px] rounded bg-gray-800 border border-gray-700 text-gray-100"
          />
          <span className="text-[11px] text-gray-400">px</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 text-[11px] text-gray-300">Height</span>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="flex-1 px-2 py-1 text-[11px] rounded bg-gray-800 border border-gray-700 text-gray-100"
          />
          <span className="text-[11px] text-gray-400">px</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleApplySize}
        className="mt-1 w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-[12px] font-semibold"
      >
        Resize
      </button>

      <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">
        배경 이미지 비율을 유지하면서 캔버스 크기를 변경합니다. Magic resize를 켜면
        내부 객체들도 함께 비율에 맞게 스케일됩니다.
      </p>
    </div>
  );
};

export default SizePanel;
