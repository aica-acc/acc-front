// src/components/editor/panels/TextPanel.jsx
import React from "react";
import { Textbox } from "fabric";
import { FONT_OPTIONS } from "../../../constants/fontOptions";

const TextPanel = ({ fabricRef }) => {
  // 폰트 클릭 시 캔버스 중앙에 텍스트박스 생성
  const handleAddText = (fontFamily, fontLabel) => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 텍스트박스 생성 (검정색, 고정 크기)
    const textbox = new Textbox(fontLabel, {
      left: centerX,
      top: centerY,
      originX: "center",
      originY: "center",
      fontSize: 40,
      fontFamily: fontFamily,
      fill: "#000000", // 검정색
      width: 300,
      textAlign: "center",
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-1">My fonts</h3>
        <p className="text-xs text-gray-400">글씨체를 클릭하여 추가하세요</p>
      </div>

      {/* 폰트 그리드 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => handleAddText(font.value, font.label)}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex items-center justify-center transition-colors duration-200 min-h-[80px] text-center break-words"
              style={{ fontFamily: font.value }}
            >
              <span className="text-white text-base leading-tight">
                {font.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
