// src/components/editor/panels/SizePanel.jsx
import React from "react";

const SizePanel = () => {
  return (
    <div className="flex-1 flex flex-col p-3 text-[12px]">
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          className="flex-1 px-2 py-1 text-[11px] rounded bg-gray-800 border border-gray-700 text-gray-100"
          placeholder="Width"
        />
        <input
          type="number"
          className="flex-1 px-2 py-1 text-[11px] rounded bg-gray-800 border border-gray-700 text-gray-100"
          placeholder="Height"
        />
      </div>
      <button className="w-full py-2 rounded bg-gray-800 hover:bg-gray-700 text-[12px]">
        Apply size
      </button>

      <p className="mt-4 text-[11px] text-gray-300">
        나중에 캔버스 사이즈 변경 로직(Fabric canvas) 여기에 바인딩.
      </p>
    </div>
  );
};

export default SizePanel;
