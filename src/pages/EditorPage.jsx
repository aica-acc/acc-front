// src/pages/EditorPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Canvas, IText, FabricImage } from "fabric";

import EditorSidebar from "../components/editor/sidebar/EditorSidebar";
import Header from "../layout/Header";
import TextToolbar from "../components/editor/toolbar/TextToolbar";
import mockCanvas1 from "../assets/editor/mock-canvas-1.json";

import img1 from "../assets/sections/poster/1.jpg";
import img2 from "../assets/sections/poster/2.png";
import img3 from "../assets/sections/poster/3.jpg";
import img4 from "../assets/sections/poster/4.jpg";

const EditorPage = () => {
  const [activeTab, setActiveTab] = useState("my-designs");
  const [selectedDesign, setSelectedDesign] = useState(null);

  const FONT_OPTIONS = [
  { label: "맑은 고딕", value: "Malgun Gothic" },
  { label: "굴림", value: "Gulim" },
  { label: "돋움", value: "Dotum" },
  { label: "바탕", value: "Batang" },
  { label: "Pretendard (fallback)", value: "Pretendard, Malgun Gothic, sans-serif" },
];

  // 텍스트 스타일 상태 (툴바용)
  const [textStyle, setTextStyle] = useState({
    color: "#ffffff",
    fontSize: 40,
    align: "left",
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    fontFamily: FONT_OPTIONS[0].value, // 기본: 맑은 고딕
  });

  const [isTextSelected, setIsTextSelected] = useState(false);

  // Fabric refs
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  // 간단 History (Undo/Redo)
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const saveHistory = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = canvas.toJSON();
    const hist = historyRef.current;
    const idx = historyIndexRef.current;

    historyRef.current = hist.slice(0, idx + 1);
    historyRef.current.push(json);
    historyIndexRef.current = idx + 1;
  };

  const handleUndo = () => {
    const canvas = fabricRef.current;
    const hist = historyRef.current;
    let idx = historyIndexRef.current;
    if (!canvas || idx <= 0) return;
    idx -= 1;
    historyIndexRef.current = idx;
    const json = hist[idx];
    canvas.loadFromJSON(json).then(() => canvas.renderAll());
  };

  const handleRedo = () => {
    const canvas = fabricRef.current;
    const hist = historyRef.current;
    let idx = historyIndexRef.current;
    if (!canvas || idx >= hist.length - 1) return;
    idx += 1;
    historyIndexRef.current = idx;
    const json = hist[idx];
    canvas.loadFromJSON(json).then(() => canvas.renderAll());
  };

  // My Designs 더미 데이터
  const [designList] = useState([
    {
      id: 1,
      title: "버스용 T 광고",
      category: "버스 광고",
      thumbnailUrl: img1,
      canvasJson: mockCanvas1,
    },
    {
      id: 2,
      title: "지하철 포스터",
      category: "지하철 광고",
      thumbnailUrl: img2,
      canvasJson: null,
    },
    {
      id: 3,
      title: "광양 매화축제 배너",
      category: "축제 배너",
      thumbnailUrl: img3,
      canvasJson: null,
    },
    {
      id: 4,
      title: "담양 산타 축제",
      category: "축제 포스터",
      thumbnailUrl: img4,
      canvasJson: null,
    },
  ]);

  // 1) 캔버스 생성
  useEffect(() => {
  if (!canvasRef.current) return;

  const c = new Canvas(canvasRef.current, {
    backgroundColor: "#ffffff",
    preserveObjectStacking: true,
  });

  c.setDimensions({ width: 800, height: 450 });
  c.renderAll();

  fabricRef.current = c;

  // 🔥 선택된 객체에 따라 텍스트 툴바 상태 업데이트
  const syncToolbarFromSelection = () => {
    const obj = c.getActiveObject();
    if (obj && obj instanceof IText) {
      setIsTextSelected(true);
      setTextStyle((prev) => ({
        ...prev,
        color: obj.fill || "#ffffff",
        fontSize: obj.fontSize || 40,
        align: obj.textAlign || "left",
        bold: obj.fontWeight === "bold",
        italic: obj.fontStyle === "italic",
        underline: !!obj.underline,
        strike: !!obj.linethrough,
        fontFamily: obj.fontFamily || prev.fontFamily,
      }));
    } else {
      setIsTextSelected(false);
    }
  };

  c.on("selection:created", syncToolbarFromSelection);
  c.on("selection:updated", syncToolbarFromSelection);
  c.on("selection:cleared", () => setIsTextSelected(false));

  return () => {
    c.off("selection:created", syncToolbarFromSelection);
    c.off("selection:updated", syncToolbarFromSelection);
    c.off("selection:cleared");
    c.dispose();
    fabricRef.current = null;
  };
}, []);

  // 2) My Designs 카드 클릭
  const handleSelectDesign = (design) => {
    console.log("선택된 작업물:", design);
    setSelectedDesign(design);
  };

  // 3) 선택된 작업물 → 캔버스에 로딩 (배경 + 텍스트)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundImage = undefined;

    if (!selectedDesign || !selectedDesign.canvasJson) {
      canvas.backgroundColor = "#ffffff";
      canvas.setDimensions({ width: 800, height: 450 });
      canvas.renderAll();
      saveHistory();
      return;
    }

    const { width, height, backgroundColor, objects } =
      selectedDesign.canvasJson;

    canvas.setDimensions({
      width: width || 800,
      height: height || 450,
    });

    canvas.backgroundColor = backgroundColor || "#ffffff";

    const bgImageUrl =
      selectedDesign.canvasJson.backgroundImage || selectedDesign.thumbnailUrl;

    if (bgImageUrl) {
      const imgEl = new window.Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => {
        const bg = new FabricImage(imgEl, {
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
          selectable: false,
          evented: false,
        });

        canvas.backgroundImage = bg;
        canvas.requestRenderAll();
        saveHistory();
      };
      imgEl.src = bgImageUrl;
    }

    (objects || []).forEach((obj) => {
      if (obj.type === "textbox" || obj.type === "i-text") {
        const t = new IText(obj.text || "", {
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          fontSize: obj.fontSize ?? 24,
          fontFamily: obj.fontFamily ?? "Pretendard",
          fill: obj.fill ?? "#000000",
        });
        canvas.add(t);
      }
    });

    canvas.renderAll();
    saveHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDesign]);

  // 4) 툴바 → 현재 선택된 텍스트에 스타일 적용
  const applyStyleToActiveText = (props) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || !(obj instanceof IText)) return;
    obj.set(props);
    canvas.requestRenderAll();
    saveHistory();
  };

  const handleChangeColor = (color) => {
    setTextStyle((prev) => ({ ...prev, color }));
    applyStyleToActiveText({ fill: color });
  };

  const handleChangeFontSize = (size) => {
    const safe = size > 0 ? size : 1;
    setTextStyle((prev) => ({ ...prev, fontSize: safe }));
    applyStyleToActiveText({ fontSize: safe });
  };

  const handleChangeAlign = (align) => {
    setTextStyle((prev) => ({ ...prev, align }));
    applyStyleToActiveText({ textAlign: align });
  };

  const handleChangeFontFamily = (fontFamily) => {
    setTextStyle((prev) => ({ ...prev, fontFamily }));
    applyStyleToActiveText({ fontFamily });
  };

  const handleToggleBold = () => {
    setTextStyle((prev) => {
      const next = !prev.bold;
      applyStyleToActiveText({ fontWeight: next ? "bold" : "normal" });
      return { ...prev, bold: next };
    });
  };

  const handleToggleItalic = () => {
    setTextStyle((prev) => {
      const next = !prev.italic;
      applyStyleToActiveText({ fontStyle: next ? "italic" : "normal" });
      return { ...prev, italic: next };
    });
  };

  const handleToggleUnderline = () => {
    setTextStyle((prev) => {
      const next = !prev.underline;
      applyStyleToActiveText({ underline: next });
      return { ...prev, underline: next };
    });
  };

  const handleToggleStrike = () => {
    setTextStyle((prev) => {
      const next = !prev.strike;
      applyStyleToActiveText({ linethrough: next });
      return { ...prev, strike: next };
    });
  };

  

  // 지금은 "텍스트 박스 편집 중"이라는 개념이 없으니까,
  // 일단 항상 보이게 두고 나중에 `activeTab === "text"` 또는 선택된 객체 타입에 따라 visible 제어하자.
  const textToolbarVisible = true;

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 mt-20">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          designList={designList}
          onSelectDesign={handleSelectDesign}
        />

        <main className="flex-1 flex flex-col bg-[#e5e7eb]">
          {/* 상단 기본 헤더 바 */}
          <div className="h-11 bg-[#111111] text-gray-100 flex items-center justify-between px-4 border-b border-black">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold">ACC Design Editor</span>
              <span className="text-xs text-gray-400">
                {selectedDesign ? selectedDesign.title : "Untitled Design"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {/* 필요하면 여기 기본 undo/redo 버튼도 textToolbar 핸들러에 연결해서 재사용 가능 */}
              <button
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
                onClick={handleUndo}
              >
                ↺
              </button>
              <button
                className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
                onClick={handleRedo}
              >
                ↻
              </button>
              <button className="ml-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 font-semibold">
                Download
              </button>
            </div>
          </div>

          {/* 텍스트 편집 툴바 */}
          <TextToolbar
            visible={isTextSelected}                 // ✅ textbox 선택됐을 때만 보이게
            textStyle={textStyle}                    // ✅ 선택된 텍스트 스타일 반영
            fontOptions={FONT_OPTIONS}               // ✅ 폰트 목록
            onChangeFontFamily={handleChangeFontFamily}
            onChangeColor={handleChangeColor}
            onChangeFontSize={handleChangeFontSize}
            onChangeAlign={handleChangeAlign}
            onToggleBold={handleToggleBold}
            onToggleItalic={handleToggleItalic}
            onToggleUnderline={handleToggleUnderline}
            onToggleStrike={handleToggleStrike}
            // undo/redo는 나중에 history 붙일 때 연결
            onUndo={() => {}}
            onRedo={() => {}}
          />

          {/* 캔버스 영역 */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="bg-white shadow-xl rounded-xl overflow-hidden flex items-center justify-center border border-gray-300"
              style={{ width: 800, height: 450 }}
            >
              <canvas
                ref={canvasRef}
                className="block"
                width={800}
                height={450}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditorPage;
