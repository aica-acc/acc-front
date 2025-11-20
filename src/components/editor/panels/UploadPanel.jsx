// src/components/editor/panels/UploadPanel.jsx
import React from "react";

const UploadPanel = () => {
  return (
    <div className="flex-1 flex flex-col p-3 text-[12px]">
      <input
        type="file"
        accept="image/*"
        className="w-full text-[11px] border border-gray-700 rounded px-2 py-1 mb-3 bg-gray-800 text-gray-100"
      />
      <p className="text-[11px] text-gray-300">
        업로드한 이미지 썸네일 갤러리가 여기 들어갈 예정.
      </p>
    </div>
  );
};

export default UploadPanel;
