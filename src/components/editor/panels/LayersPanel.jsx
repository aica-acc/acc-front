// src/components/editor/panels/LayersPanel.jsx
import React from "react";

const LayersPanel = () => {
  return (
    <div className="flex-1 flex flex-col p-3 text-[12px]">
      <p className="text-[11px] text-gray-300 mb-2">
        레이어 리스트 / 눈 아이콘 / 락 / 위·아래 이동 버튼 등 들어갈 자리.
      </p>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] bg-gray-800 border border-gray-700 rounded px-2 py-1">
          <span>Sample layer 1</span>
          <div className="flex items-center gap-1">
            <button className="px-1 border border-gray-600 rounded">👁</button>
            <button className="px-1 border border-gray-600 rounded">🔓</button>
            <button className="px-1 border border-gray-600 rounded">▲</button>
            <button className="px-1 border border-gray-600 rounded">▼</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;
