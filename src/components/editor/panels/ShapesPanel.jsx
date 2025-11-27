// src/components/editor/panels/ShapesPanel.jsx
import React from "react";
import { Rect, Circle, Triangle, Line, Polygon } from "fabric";

const ShapesPanel = ({ fabricRef }) => {
  const addShape = (ShapeClass, defaultProps = {}) => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const center = canvas.getCenter();
    
    const shape = new ShapeClass({
      left: center.left,
      top: center.top,
      originX: "center",
      originY: "center",
      fill: "#3b82f6", // 기본 색상 (파란색)
      stroke: "#1e40af", // 기본 테두리 색상
      strokeWidth: 2,
      ...defaultProps,
    });

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  };

  const handleAddRect = () => {
    addShape(Rect, {
      width: 150,
      height: 100,
      rx: 0, // border radius
      ry: 0,
    });
  };

  const handleAddCircle = () => {
    addShape(Circle, {
      radius: 50,
    });
  };

  const handleAddTriangle = () => {
    addShape(Triangle, {
      width: 120,
      height: 120,
    });
  };

  const handleAddLine = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const center = canvas.getCenter();
    
    const line = new Line([0, 0, 100, 0], {
      left: center.left - 50,
      top: center.top,
      originX: "center",
      originY: "center",
      stroke: "#3b82f6",
      strokeWidth: 3,
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  const handleAddPolygon = () => {
    // 오각형 생성
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const center = canvas.getCenter();
    const radius = 50;
    const sides = 5;
    const points = [];

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      });
    }

    const polygon = new Polygon(points, {
      left: center.left,
      top: center.top,
      originX: "center",
      originY: "center",
      fill: "#3b82f6",
      stroke: "#1e40af",
      strokeWidth: 2,
    });

    canvas.add(polygon);
    canvas.setActiveObject(polygon);
    canvas.requestRenderAll();
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      {/* 헤더 */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white mb-1">도형 추가</h3>
        <p className="text-[11px] text-gray-400">도형을 클릭하여 캔버스에 추가하세요</p>
      </div>

      {/* 도형 버튼들 */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleAddRect}
          className="w-full py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-white text-[12px] text-left flex items-center gap-2"
        >
          <div className="w-6 h-6 border-2 border-white rounded" />
          <span>사각형</span>
        </button>

        <button
          type="button"
          onClick={handleAddCircle}
          className="w-full py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-white text-[12px] text-left flex items-center gap-2"
        >
          <div className="w-6 h-6 border-2 border-white rounded-full" />
          <span>원</span>
        </button>

        <button
          type="button"
          onClick={handleAddTriangle}
          className="w-full py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-white text-[12px] text-left flex items-center gap-2"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 22h20L12 2z" />
          </svg>
          <span>삼각형</span>
        </button>

        <button
          type="button"
          onClick={handleAddPolygon}
          className="w-full py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-white text-[12px] text-left flex items-center gap-2"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span>오각형</span>
        </button>

        <button
          type="button"
          onClick={handleAddLine}
          className="w-full py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-white text-[12px] text-left flex items-center gap-2"
        >
          <div className="w-6 h-1 bg-white" />
          <span>직선</span>
        </button>
      </div>

      {/* 안내 문구 */}
      <div className="mt-auto pt-3 border-t border-gray-700">
        <p className="text-[11px] text-gray-400">
          💡 도형을 선택하면 색상과 테두리를 변경할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default ShapesPanel;
