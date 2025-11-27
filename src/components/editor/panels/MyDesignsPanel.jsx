// src/components/editor/panels/MyDesignsPanel.jsx
import React from "react";

const MyDesignsPanel = ({ designs, onSelectDesign }) => {
  return (
    <div className="flex-1 flex flex-col p-3 text-[12px]">
      {designs.length === 0 ? (
        <p className="text-[11px] text-gray-300">
          아직 저장된 작업물이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {designs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDesign(item)}
              className="bg-gray-900 border border-gray-700 rounded overflow-hidden text-left hover:border-blue-500 transition-colors"
            >
              {/* 썸네일 */}
              <div className="w-full aspect-[4/3] bg-gray-800 flex items-center justify-center overflow-hidden">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400">
                    No preview
                  </span>
                )}
              </div>

              {/* Type (category) */}
              <div className="px-2 pt-1 pb-1">
                <div className="text-[11px] text-gray-100 truncate font-medium">
                  {item.category || "Untitled Design"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDesignsPanel;
