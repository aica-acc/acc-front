// src/components/editor/panels/ShapesPanel.jsx
import React from "react";

const ShapesPanel = () => {
  return (
    <div className="flex-1 flex flex-col p-3 text-[12px]">
      <button className="w-full mb-2 py-2 rounded bg-gray-800 hover:bg-gray-700">
        + Rectangle
      </button>
      <button className="w-full mb-2 py-2 rounded bg-gray-800 hover:bg-gray-700">
        + Circle
      </button>
      <button className="w-full mb-2 py-2 rounded bg-gray-800 hover:bg-gray-700">
        + Line
      </button>
      <p className="mt-4 text-[11px] text-gray-300">
        이후에 도형 색상/테두리/라운드 컨트롤 연결 예정.
      </p>
    </div>
  );
};

export default ShapesPanel;
