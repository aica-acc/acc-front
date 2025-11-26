// src/components/editor/panels/IconsPanel.jsx
import React from "react";
import { Path } from "fabric";

// 무료 아이콘 SVG 경로 데이터 (일부 기본 아이콘들)
const ICONS = [
  { name: "하트", path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { name: "별", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { name: "화살표", path: "M5 12h14M12 5l7 7-7 7" },
  { name: "체크", path: "M20 6L9 17l-5-5" },
  { name: "X", path: "M18 6L6 18M6 6l12 12" },
  { name: "플러스", path: "M12 5v14M5 12h14" },
  { name: "사용자", path: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { name: "홈", path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" },
  { name: "전화", path: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" },
  { name: "메일", path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" },
  { name: "음악", path: "M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" },
  { name: "카메라", path: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

const IconsPanel = ({ fabricRef }) => {
  const addIcon = (iconPath) => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const center = canvas.getCenter();
    
    // SVG 경로를 Fabric Path 객체로 변환
    // Path 객체는 좌표계가 다르므로 적절히 스케일링 필요
    const path = new Path(iconPath, {
      left: center.left,
      top: center.top,
      originX: "center",
      originY: "center",
      scaleX: 3, // 아이콘 크기
      scaleY: 3,
      fill: "#3b82f6", // 기본 색상 (파란색)
      stroke: null, // 테두리 없음
      strokeWidth: 0,
    });

    canvas.add(path);
    canvas.setActiveObject(path);
    canvas.requestRenderAll();
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      {/* 헤더 */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white mb-1">아이콘 추가</h3>
        <p className="text-[11px] text-gray-400">아이콘을 클릭하여 캔버스에 추가하세요</p>
      </div>

      {/* 아이콘 그리드 */}
      <div className="grid grid-cols-3 gap-2 overflow-y-auto">
        {ICONS.map((icon, index) => (
          <button
            key={index}
            type="button"
            onClick={() => addIcon(icon.path)}
            className="aspect-square p-3 rounded bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center gap-1 transition-colors"
            title={icon.name}
          >
            <svg
              className="w-8 h-8 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={icon.path} fill="currentColor" />
            </svg>
            <span className="text-[10px] text-gray-400">{icon.name}</span>
          </button>
        ))}
      </div>

      {/* 안내 문구 */}
      <div className="mt-auto pt-3 border-t border-gray-700">
        <p className="text-[11px] text-gray-400">
          💡 아이콘을 선택하면 색상을 변경할 수 있습니다. (테두리 없음)
        </p>
      </div>
    </div>
  );
};

export default IconsPanel;
