// src/components/editor/panels/LayersPanel.jsx
import React, { useState, useEffect } from "react";

const LayersPanel = ({ fabricRef }) => {
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);

  // 캔버스 객체 목록 업데이트
  const updateLayers = () => {
    if (!fabricRef?.current) return;
    
    const canvas = fabricRef.current;
    const objects = canvas.getObjects();
    
    const layerList = objects.map((obj, index) => ({
      id: obj.id || `layer-${index}`,
      name: obj.name || getObjectName(obj, index),
      type: obj.type,
      visible: obj.visible !== false,
      locked: obj.selectable === false,
      object: obj,
    }));
    
    setLayers(layerList);
  };

  // 객체 타입에 따른 이름 생성
  const getObjectName = (obj, index) => {
    if (obj.type === "textbox" || obj.type === "i-text") {
      const text = obj.text?.substring(0, 15) || "텍스트";
      return text.length > 15 ? text + "..." : text;
    }
    if (obj.type === "image") return `이미지 ${index + 1}`;
    if (obj.type === "rect") return `사각형 ${index + 1}`;
    if (obj.type === "circle") return `원 ${index + 1}`;
    return `객체 ${index + 1}`;
  };

  // 캔버스 이벤트 감지
  useEffect(() => {
    if (!fabricRef?.current) return;

    const canvas = fabricRef.current;
    
    // 초기 로드
    updateLayers();

    // 이벤트 리스너
    const handleUpdate = () => updateLayers();
    const handleSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedLayer(active?.id || null);
    };

    canvas.on("object:added", handleUpdate);
    canvas.on("object:removed", handleUpdate);
    canvas.on("object:modified", handleUpdate);
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedLayer(null));

    return () => {
      canvas.off("object:added", handleUpdate);
      canvas.off("object:removed", handleUpdate);
      canvas.off("object:modified", handleUpdate);
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared");
    };
  }, [fabricRef]);

  // 레이어 클릭 → 객체 선택
  const handleLayerClick = (layer) => {
    if (!fabricRef?.current) return;
    fabricRef.current.setActiveObject(layer.object);
    fabricRef.current.renderAll();
  };

  // 가시성 토글
  const handleToggleVisible = (layer, e) => {
    e.stopPropagation();
    layer.object.visible = !layer.object.visible;
    fabricRef.current.renderAll();
    updateLayers();
  };

  // 잠금 토글
  const handleToggleLock = (layer, e) => {
    e.stopPropagation();
    layer.object.selectable = !layer.object.selectable;
    layer.object.evented = !layer.object.evented;
    updateLayers();
  };

  // 레이어 순서 변경
  const handleMoveUp = (layer, e) => {
    e.stopPropagation();
    fabricRef.current.bringForward(layer.object);
    fabricRef.current.renderAll();
    updateLayers();
  };

  const handleMoveDown = (layer, e) => {
    e.stopPropagation();
    fabricRef.current.sendBackwards(layer.object);
    fabricRef.current.renderAll();
    updateLayers();
  };

  return (
    <div className="flex-1 flex flex-col p-3 text-xs">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white mb-1">레이어</h3>
        <p className="text-[10px] text-gray-400">
          {layers.length}개의 객체
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {layers.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-[11px]">
            객체가 없습니다<br/>
            텍스트를 추가해보세요!
          </div>
        ) : (
          layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => handleLayerClick(layer)}
              className={`flex items-center justify-between px-2 py-2 rounded cursor-pointer transition-colors ${
                selectedLayer === layer.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200"
              }`}
            >
              <span className="flex-1 truncate text-[11px]">{layer.name}</span>
              <div className="flex items-center gap-1">
                {/* 가시성 */}
                <button
                  onClick={(e) => handleToggleVisible(layer, e)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 transition-colors"
                  title={layer.visible ? "숨기기" : "보이기"}
                >
                  {layer.visible ? "👁" : "⚫"}
                </button>
                
                {/* 잠금 */}
                <button
                  onClick={(e) => handleToggleLock(layer, e)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 transition-colors"
                  title={layer.locked ? "잠금 해제" : "잠금"}
                >
                  {layer.locked ? "🔒" : "🔓"}
                </button>
                
                {/* 위로 */}
                <button
                  onClick={(e) => handleMoveUp(layer, e)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 transition-colors text-xs"
                  title="위로"
                >
                  ▲
                </button>
                
                {/* 아래로 */}
                <button
                  onClick={(e) => handleMoveDown(layer, e)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 transition-colors text-xs"
                  title="아래로"
                >
                  ▼
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
