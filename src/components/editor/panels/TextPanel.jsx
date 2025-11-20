// src/components/editor/panels/TextPanel.jsx
import React from "react";

const TextPanel = () => {
  return (
    <div className="flex-1 flex flex-col p-3 text-[12px]">
      <button className="w-full mb-3 py-2 rounded bg-gray-800 hover:bg-gray-700">
        + Add heading text
      </button>
      <button className="w-full mb-2 py-2 rounded bg-gray-800 hover:bg-gray-700">
        + Add subheading
      </button>
      <button className="w-full mb-2 py-2 rounded bg-gray-800 hover:bg-gray-700">
        + Add body text
      </button>

      <p className="mt-4 text-[11px] text-gray-300">
        여기에는 나중에 폰트 선택, 크기, 정렬 등 세부 컨트롤 들어갈 예정.
      </p>
    </div>
  );
};

export default TextPanel;
