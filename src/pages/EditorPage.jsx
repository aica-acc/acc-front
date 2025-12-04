// src/pages/EditorPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Canvas } from "fabric";
import api from "../utils/api/BaseAPI";

import EditorSidebar from "../components/editor/sidebar/EditorSidebar";
import StepHeader from "../layout/StepHeader";
import EditorToolbar from "../components/editor/toolbar/EditorToolbar";

// 분리된 훅들
import useTextStyleControls from "../components/editor/hooks/useTextStyleControls";
import useCanvasHistory from "../components/editor/hooks/useCanvasHistory";
import useDesignManager from "../components/editor/hooks/useDesignManager";
import { Textbox } from "fabric";
import { loadDesignToCanvas } from "../utils/editor/canvasLoader";
import { requestAIColorRecommendation, saveEditorImage } from "../utils/api/EditorAPI";

// 폰트 옵션 import
import { FONT_OPTIONS } from "../constants/fontOptions";

const EditorPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState("my-designs");
  
  // 🔥 state에서 받은 items 데이터를 INITIAL_DESIGNS로 변환
  const getInitialDesigns = useCallback((itemsData) => {
    if (!itemsData || !Array.isArray(itemsData) || itemsData.length === 0) {
      return [];
    }

    return itemsData.map((item, index) => ({
      id: index,
      title: item.category || `디자인 ${index}`,
      category: item.category || "미분류",
      type: item.type || item.promotionType || item.promotion_type || null, // 🔥 영어 type 필드 추가
      thumbnailUrl: item.backgroundImageUrl,
      backgroundImageUrl: item.backgroundImageUrl,
      exportWidth: item.canvasData?.width || 800,
      exportHeight: item.canvasData?.height || 450,
      canvasJson: item.canvasData,
    }));
  }, []);

  const [initialDesigns, setInitialDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 텍스트 스타일 상태
  const [textStyle, setTextStyle] = useState({
    color: "#ffffff",
    fontSize: 40,
    align: "left",
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    fontFamily: FONT_OPTIONS[0].value,
    lineHeight: 1.16,
    charSpacing: 0,
    textStroke: null,
    textStrokeWidth: 0,
    opacity: 1,
    textBackgroundColor: "",
    shadow: null,
  });

  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(null);
  
  // Video 컨트롤 상태
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
  });

  // Fabric refs
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null); // 캔버스를 감싸는 컨테이너 ref
  const [isCanvasReady, setIsCanvasReady] = useState(false); // 캔버스 초기화 완료 여부

  // 🔥 히스토리 관리
  const { saveHistory, handleUndo, handleRedo } = useCanvasHistory(fabricRef);

  // 🔥 캔버스 크기/줌 재계산 (깜빡임 없는 버전)
  const recalcCanvasViewport = useCallback((design) => {
    const canvas = fabricRef.current;
    const container = containerRef.current;
    if (!canvas || !design || !container) return;

    // 1. 디자인 원본 크기 가져오기
    const designWidth =
      design.canvasJson?.width ||
      canvas.width ||
      800;
    const designHeight =
      design.canvasJson?.height ||
      canvas.height ||
      450;

    // 2. 캔버스 뷰포트(창문)의 물리적 크기를 고정 (최대 800x800)
    // 사용자가 원하는 "보기 좋은 크기"로 고정함
    const MAX_VIEWPORT_SIZE = 800;
    
    // 디자인 비율에 맞춰서 뷰포트 박스 크기 결정 (너무 길어지지 않게 제한)
    let boxWidth = MAX_VIEWPORT_SIZE;
    let boxHeight = (designHeight / designWidth) * MAX_VIEWPORT_SIZE;
    
    // 만약 세로가 너무 길면 세로 기준으로 맞춤
    if (boxHeight > MAX_VIEWPORT_SIZE) {
        boxHeight = MAX_VIEWPORT_SIZE;
        boxWidth = (designWidth / designHeight) * MAX_VIEWPORT_SIZE;
    }

    // 3. 캔버스 크기를 계산된 box 크기로 고정
    canvas.setDimensions({ width: boxWidth, height: boxHeight });

    // 4. 내부 줌 계산: 이제 뷰포트 크기(box)와 디자인 크기(design)의 비율만 맞추면 됨
    // 꽉 채우되 약간의 여백(5%)을 줌
    const scaleX = (boxWidth * 0.95) / designWidth;
    const scaleY = (boxHeight * 0.95) / designHeight;
    const zoom = Math.min(scaleX, scaleY);

    // 5. 뷰포트 중앙 정렬 계산
    const vpt = [zoom, 0, 0, zoom, 0, 0];
    vpt[4] = (boxWidth - designWidth * zoom) / 2;
    vpt[5] = (boxHeight - designHeight * zoom) / 2;

    // 6. 적용
    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();

    console.log("🖼️ 뷰포트 고정 크기 적용:", {
      box: `${boxWidth}x${boxHeight}`,
      design: `${designWidth}x${designHeight}`,
      zoom
    });

  }, [fabricRef]);

  // 🔥 EditorPage 진입 시 GET 요청으로 최신 데이터 가져오기
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setIsLoading(true);
        
        // 🔥 테스트용: sessionStorage에 editorPNo 설정 (임시)
        // sessionStorage.setItem("editorPNo", "17");
        // console.log("🧪 [테스트] editorPNo를 3으로 설정");
        
        // pNo 가져오기 (state 또는 sessionStorage)
        let pNo = null;
        if (state && state.pNo) {
          pNo = state.pNo;
          // sessionStorage에도 저장
          sessionStorage.setItem("editorPNo", pNo.toString());
        } else {
          // sessionStorage에서 가져오기
          const storedPNo = sessionStorage.getItem("editorPNo");
          if (storedPNo) {
            pNo = parseInt(storedPNo, 10);
          }
        }

        if (!pNo) {
          console.error("❌ EditorPage: pNo가 없습니다.");
          alert("프로젝트 번호가 없습니다. 포스터 선택 페이지로 이동합니다.");
          // sessionStorage에서 thumbnailList의 첫 번째 항목 가져오기
          const saved = sessionStorage.getItem("thumbnailList");
          if (saved) {
            const list = JSON.parse(saved);
            if (list && list.length > 0) {
              const firstItem = list[0];
              navigate(`/create/poster/detail/${firstItem.filePathNo}/${firstItem.promptNo}`);
              return;
            }
          }
          navigate("/select");
          return;
        }

        // GET 요청으로 최신 템플릿 데이터 가져오기
        const templateRes = await api.get(
          `/api/editor/project/${pNo}/template-json`
        );

        console.log("📌 Template JSON (최신 데이터):", templateRes.data);

        const items = templateRes.data.items ?? [];

        if (!items || items.length === 0) {
          console.warn("⚠️ 템플릿 데이터가 비어있습니다.");
          alert("템플릿 데이터가 없습니다. 포스터 선택 페이지로 이동합니다.");
          // sessionStorage에서 thumbnailList의 첫 번째 항목 가져오기
          const saved = sessionStorage.getItem("thumbnailList");
          if (saved) {
            const list = JSON.parse(saved);
            if (list && list.length > 0) {
              const firstItem = list[0];
              navigate(`/create/poster/detail/${firstItem.filePathNo}/${firstItem.promptNo}`);
              return;
            }
          }
          navigate("/select");
          return;
        }

        // sessionStorage에 저장 (F5 눌렀을 때를 대비)
        sessionStorage.setItem("editorTemplateItems", JSON.stringify(items));

        // initialDesigns 업데이트
        const designs = getInitialDesigns(items);
        console.log("🎨 변환된 디자인 목록:", designs);
        if (designs.length > 0) {
          console.log("✅ 첫 번째 디자인 상세:", designs[0]);
          console.log("  - canvasJson:", designs[0].canvasJson);
          console.log("  - objects:", designs[0].canvasJson?.objects);
          setInitialDesigns(designs);
        } else {
          console.warn("⚠️ 변환된 디자인이 없습니다.");
        }

      } catch (err) {
        console.error("❌ 템플릿 데이터 가져오기 실패:", err);
        
        // 에러 발생 시 sessionStorage에서 가져오기 시도
        try {
          const stored = sessionStorage.getItem("editorTemplateItems");
          if (stored) {
            const items = JSON.parse(stored);
            if (Array.isArray(items) && items.length > 0) {
              const designs = getInitialDesigns(items);
              if (designs.length > 0) {
                setInitialDesigns(designs);
                console.log("⚠️ API 실패, sessionStorage에서 데이터 사용");
                return;
              }
            }
          }
        } catch (e) {
          console.error("sessionStorage 파싱 오류:", e);
        }
        
        alert("템플릿 데이터를 가져오는 중 오류가 발생했습니다. 포스터 선택 페이지로 이동합니다.");
        // sessionStorage에서 thumbnailList의 첫 번째 항목 가져오기
        const saved = sessionStorage.getItem("thumbnailList");
        if (saved) {
          const list = JSON.parse(saved);
          if (list && list.length > 0) {
            const firstItem = list[0];
            navigate(`/create/poster/detail/${firstItem.filePathNo}/${firstItem.promptNo}`);
            return;
          }
        }
        navigate("/select");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplateData();
  }, [state, navigate, getInitialDesigns]);

  // 🔥 작업물 관리 훅
  const {
    designList,
    selectedDesign,
    handleSelectDesign,
    snapshotCurrentDesign, // Save 버튼에서만 사용
    isLoadingRef,
  } = useDesignManager(
    initialDesigns,
    fabricRef,
    saveHistory,
    recalcCanvasViewport,
    isCanvasReady // 🔥 준비 완료 신호 전달
  );

  // 🔥 텍스트 스타일 컨트롤
  const {
    handleChangeColor,
    handleChangeFontSize,
    handleChangeAlign,
    handleChangeFontFamily,
    handleToggleBold,
    handleToggleItalic,
    handleToggleUnderline,
    handleToggleStrike,
  } = useTextStyleControls(fabricRef, setTextStyle, saveHistory);

  // 🔥 도형/아이콘 색상 변경 핸들러
  const handleChangeShapeColor = useCallback((color) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    // 도형 또는 아이콘인 경우에만 색상 변경
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || 
        obj.type === 'polygon' || obj.type === 'path') {
      obj.set({ fill: color });
      canvas.requestRenderAll();
      setTextStyle((prev) => ({ ...prev, color }));
      saveHistory();
    } else if (obj.type === 'image') {
      // 이미지는 색상 변경 불가
      return;
    }
  }, [fabricRef, saveHistory]);

  // 🔥 도형 테두리 색상 변경 핸들러
  const handleChangeStrokeColor = useCallback((color) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    // 도형인 경우에만 테두리 색상 변경 (아이콘은 테두리 없음)
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || 
        obj.type === 'polygon' || obj.type === 'line') {
      obj.set({ stroke: color });
      canvas.requestRenderAll();
      setTextStyle((prev) => ({ ...prev, strokeColor: color }));
      saveHistory();
    }
  }, [fabricRef, saveHistory]);

  // 윈도우 리사이즈 대응
  useEffect(() => {
    const handleResize = () => {
      if (selectedDesign) {
        recalcCanvasViewport(selectedDesign);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedDesign, recalcCanvasViewport]);

  // 저장 - 현재 선택된 디자인을 서버에 저장하고 DB에 저장
  const handleDownloadCurrent = useCallback(async () => {
    console.log("🔘 [저장 버튼] 클릭됨");
    
    const canvas = fabricRef.current;
    if (!canvas) {
      console.error("❌ 캔버스가 없습니다.");
      alert("캔버스가 초기화되지 않았습니다.");
      return;
    }
    
    if (!selectedDesign) {
      console.error("❌ 선택된 디자인이 없습니다.");
      alert("저장할 디자인을 선택해주세요.");
      return;
    }

    // pNo 가져오기
    const pNoStr = sessionStorage.getItem("editorPNo");
    if (!pNoStr) {
      console.error("❌ pNo가 없습니다.");
      alert("프로젝트 번호를 찾을 수 없습니다.");
      return;
    }
    const pNo = parseInt(pNoStr, 10);
    console.log("📌 pNo:", pNo);

    try {
      console.log("💾 [저장] 시작:", selectedDesign.title);

      const currentWidth = selectedDesign.canvasJson?.width || canvas.width;
      const currentHeight = selectedDesign.canvasJson?.height || canvas.height;
      const targetWidth = selectedDesign.exportWidth || currentWidth;
      const targetHeight = selectedDesign.exportHeight || currentHeight;

      const scaleX = targetWidth / currentWidth;
      const scaleY = targetHeight / currentHeight;
      const multiplier = Math.min(scaleX, scaleY);

      // 뷰포트 초기화 후 캡처
      const originalVpt = canvas.viewportTransform;
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      
      const dataUrl = canvas.toDataURL({
        format: "png",
        multiplier: multiplier > 0 ? multiplier : 1,
        width: currentWidth,
        height: currentHeight,
        left: 0,
        top: 0
      });

      // 뷰포트 복구
      canvas.setViewportTransform(originalVpt);

      // dbFileType 결정 (영어 type 우선, 없으면 category, 없으면 "design")
      // category는 한글일 수 있으므로 영어 type을 우선 사용
      const dbFileType = selectedDesign.type || selectedDesign.category || "design";
      console.log("📌 dbFileType:", dbFileType, "category:", selectedDesign.category, "type:", selectedDesign.type);

      // 서버에 저장하고 DB에 저장
      const result = await saveEditorImage({
        pNo,
        imageBase64: dataUrl,
        dbFileType,
      });

      if (result.success) {
        alert(`저장 완료!\n경로: ${result.savedPath}`);
        console.log("✅ [저장] 완료:", result.savedPath);
      }
    } catch (error) {
      console.error("❌ [저장] 실패:", error);
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    }
  }, [fabricRef, selectedDesign]);

  // 초기 캔버스 설정 (로딩 완료 후에만 실행)
  useEffect(() => {
    // 로딩 중이면 캔버스 초기화 안 함
    if (isLoading) {
      console.log("⏸️ 로딩 중이므로 캔버스 초기화 대기");
      return;
    }

    if (!canvasRef.current) {
      console.log("⏸️ canvasRef.current가 아직 없음");
      return;
    }

    // 이미 초기화되었으면 스킵
    if (fabricRef.current) {
      console.log("⏸️ 캔버스가 이미 초기화됨");
      return;
    }

    console.log("🎨 캔버스 초기화 시작");

    // 컨테이너 크기로 초기화
    const initWidth = containerRef.current?.clientWidth || 800;
    const initHeight = containerRef.current?.clientHeight || 450;

    const c = new Canvas(canvasRef.current, {
      width: initWidth,
      height: initHeight,
      backgroundColor: "#e5e7eb", // 캔버스 배경색 (회색)
      preserveObjectStacking: true,
      selectionColor: "rgba(59, 130, 246, 0.1)",
      selectionBorderColor: "#2563eb",
      selectionLineWidth: 2,
    });

    fabricRef.current = c;
    console.log("✅ 캔버스 초기화 완료, isCanvasReady = true");
    setIsCanvasReady(true); // 캔버스 준비 완료 신호

    // 브라우저 콘솔에서 캔버스 객체 확인하는 전역 함수 등록
    window.checkCanvasObjects = () => {
      const canvas = fabricRef.current;
      if (!canvas) {
        console.log("❌ 캔버스가 아직 준비되지 않았습니다.");
        return;
      }
      
      const objects = canvas.getObjects();
      console.log("🎨 캔버스 객체 정보:");
      console.log(`총 객체 개수: ${objects.length}`);
      
      if (objects.length === 0) {
        console.log("캔버스에 객체가 없습니다.");
        return objects;
      }
      
      console.log("\n📋 객체 상세 목록:");
      objects.forEach((obj, index) => {
        console.log(`\n[${index + 1}] 타입: ${obj.type}`);
        if (obj.type === 'textbox' || obj.type === 'i-text') {
          console.log(`  텍스트: "${obj.text}"`);
          console.log(`  폰트: ${obj.fontFamily || 'N/A'}`);
          console.log(`  크기: ${obj.fontSize || 'N/A'}px`);
          console.log(`  색상: ${obj.fill || 'N/A'}`);
          console.log(`  위치: (${Math.round(obj.left || 0)}, ${Math.round(obj.top || 0)})`);
          console.log(`  너비: ${Math.round(obj.width || 0)}px`);
        } else if (obj.type === 'image') {
          console.log(`  위치: (${Math.round(obj.left || 0)}, ${Math.round(obj.top || 0)})`);
          console.log(`  크기: ${Math.round(obj.width || 0)} x ${Math.round(obj.height || 0)}`);
        } else {
          console.log(`  위치: (${Math.round(obj.left || 0)}, ${Math.round(obj.top || 0)})`);
          console.log(`  크기: ${Math.round(obj.width || 0)} x ${Math.round(obj.height || 0)}`);
        }
      });
      
      console.log("\n📦 전체 객체 데이터:", objects);
      return objects;
    };

    // 객체 선택 스타일
    c.on("object:added", (e) => {
      if (e.target) {
        e.target.set({
          borderColor: "#2563eb",
          cornerColor: "#2563eb",
          cornerStyle: "circle",
          cornerSize: 10,
          transparentCorners: false,
          borderScaleFactor: 2,
        });
      }
    });

    // 선택 이벤트 핸들러
    const syncToolbarFromSelection = () => {
      const obj = c.getActiveObject();
      if (!obj) {
        setSelectedObjectType(null);
        return;
      }

      const isTextObject = obj instanceof Textbox || obj?.type === 'textbox' || obj?.type === 'i-text';
      
      if (isTextObject) {
        setSelectedObjectType("text");
        
        // Shadow 객체를 일반 객체로 변환 (저장용)
        let shadowData = null;
        if (obj.shadow) {
          if (typeof obj.shadow === 'object') {
            shadowData = {
              color: obj.shadow.color || "rgba(0, 0, 0, 0.3)",
              blur: obj.shadow.blur || 0,
              offsetX: obj.shadow.offsetX || 0,
              offsetY: obj.shadow.offsetY || 0,
              affectStroke: obj.shadow.affectStroke || false,
              nonScaling: obj.shadow.nonScaling || false,
            };
          } else {
            shadowData = obj.shadow;
          }
        }
        
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
          lineHeight: obj.lineHeight ?? 1.16,
          charSpacing: obj.charSpacing ?? 0,
          textStroke: obj.stroke || null,
          textStrokeWidth: obj.strokeWidth || 0,
          opacity: obj.opacity ?? 1,
          textBackgroundColor: obj.textBackgroundColor || "",
          shadow: shadowData,
        }));
      } else if (obj?.type === 'image') {
        // video 객체인지 확인
        const element = obj.getElement ? obj.getElement() : null;
        const objData = obj.toObject ? obj.toObject() : {};
        if (element && element.tagName === 'VIDEO' || objData.videoUrl || objData.mediaType === 'video') {
          setSelectedObjectType("video");
        } else {
          setSelectedObjectType("image");
          setTextStyle((prev) => ({
            ...prev,
            color: obj.fill || "#000000",
          }));
        }
      } else if (obj?.type === 'rect' || obj?.type === 'circle' || obj?.type === 'triangle' || 
                 obj?.type === 'polygon' || obj?.type === 'line') {
        // 도형 (shapes)
        setSelectedObjectType("shape");
        setTextStyle((prev) => ({
          ...prev,
          color: obj.fill || "#3b82f6",
          strokeColor: obj.stroke || "#1e40af",
        }));
      } else if (obj?.type === 'path') {
        // 아이콘 (SVG Path)
        setSelectedObjectType("icon");
        setTextStyle((prev) => ({
          ...prev,
          color: obj.fill || "#3b82f6",
        }));
      } else {
        setSelectedObjectType(null);
      }
    };

    const handleRotating = (e) => {
      if (e.target) {
        setRotationAngle(Math.round(e.target.angle || 0));
      }
    };

    const handleRotationEnd = () => {
      setTimeout(() => setRotationAngle(null), 1000);
    };

    // 🔥 자동 저장 제거: 변경 감지만 하고 저장하지 않음
    // 저장은 사용자가 Save 버튼을 클릭할 때만 발생
    const handleCanvasChange = (eventType, event) => {
      // 🔥 히스토리만 저장 (Undo/Redo용, 스냅샷은 저장하지 않음)
      if (!isLoadingRef.current) {
        saveHistory();
      }
    };

    c.on("selection:created", syncToolbarFromSelection);
    c.on("selection:updated", syncToolbarFromSelection);
    c.on("selection:cleared", () => setSelectedObjectType(null));
    
    // 🔥 자동 저장 제거: 객체 변경 이벤트는 히스토리만 저장 (스냅샷은 저장하지 않음)
    c.on("object:modified", (e) => {
      handleCanvasChange("object:modified", e);
      handleRotationEnd(e);
    });
    
    // 객체 이동 중 (드래그 중) - 이벤트만 처리
    c.on("object:moving", (e) => {
      // 이벤트 처리만
    });
    
    // 객체 리사이즈 중 - 이벤트만 처리
    c.on("object:scaling", (e) => {
      // 이벤트 처리만
    });
    
    // 객체 추가/삭제 - 히스토리만 저장
    c.on("object:added", (e) => {
      handleCanvasChange("object:added", e);
    });
    c.on("object:removed", (e) => {
      handleCanvasChange("object:removed", e);
    });
    
    // 텍스트 변경 - 히스토리만 저장
    c.on("text:changed", (e) => {
      handleCanvasChange("text:changed", e);
    });
    
    // 텍스트 편집 시작 - 이벤트만 처리
    c.on("text:editing:entered", (e) => {
      // 이벤트 처리만
    });
    
    // 회전 중에는 저장하지 않음 (완료 시에만 저장)
    c.on("object:rotating", handleRotating);

    // 🔥 video 객체가 있을 때 계속 렌더링 (Fabric.js 공식 방식)
    let animationFrameId = null;
    const hasVideoObjects = () => {
      const objects = c.getObjects();
      return objects.some(obj => {
        const element = obj.getElement ? obj.getElement() : null;
        if (element && element.tagName === 'VIDEO') {
          return true;
        }
        const objData = obj.toObject ? obj.toObject() : {};
        return objData.videoUrl || objData.mediaType === 'video';
      });
    };

    const renderLoop = () => {
      if (hasVideoObjects()) {
        c.renderAll();
      }
      animationFrameId = window.requestAnimationFrame(renderLoop);
    };

    // video가 있으면 렌더링 루프 시작
    if (hasVideoObjects()) {
      renderLoop();
    }

    // 객체 추가 시 video 체크
    const checkAndStartRenderLoop = () => {
      if (hasVideoObjects() && !animationFrameId) {
        renderLoop();
      }
    };
    c.on("object:added", checkAndStartRenderLoop);

    return () => {
      // 렌더링 루프 중지
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      c.off("selection:created", syncToolbarFromSelection);
      c.off("selection:updated", syncToolbarFromSelection);
      c.off("selection:cleared");
      c.off("object:modified");
      c.off("object:moving");
      c.off("object:scaling");
      c.off("object:added");
      c.off("object:removed");
      c.off("text:changed");
      c.off("text:editing:entered");
      c.off("object:removed", handleCanvasChange);
      c.off("text:changed", handleCanvasChange);
      c.off("object:rotating", handleRotating);
      c.off("object:added", checkAndStartRenderLoop);
      c.dispose();
      fabricRef.current = null;
      delete window.checkCanvasObjects;
    };
  }, [saveHistory, isLoadingRef, isLoading]); // 🔥 자동 저장 제거: snapshotCurrentDesignDebounced 사용 안함

  // 🔥 Video element 가져오기
  const getVideoElement = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    const obj = canvas.getActiveObject();
    if (!obj) return null;
    
    const element = obj.getElement ? obj.getElement() : null;
    if (element && element.tagName === 'VIDEO') {
      return element;
    }
    return null;
  }, []);

  // 🔥 Video 컨트롤 핸들러들
  const handleVideoPlayPause = useCallback(() => {
    const videoEl = getVideoElement();
    if (!videoEl) return;
    
    if (videoEl.paused) {
      videoEl.play().then(() => {
        setVideoState(prev => ({ ...prev, isPlaying: true }));
      }).catch(err => {
        console.warn("비디오 재생 실패:", err);
      });
    } else {
      videoEl.pause();
      setVideoState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [getVideoElement]);

  const handleVideoSeek = useCallback((time) => {
    const videoEl = getVideoElement();
    if (!videoEl) return;
    videoEl.currentTime = time;
    setVideoState(prev => ({ ...prev, currentTime: time }));
  }, [getVideoElement]);

  const handleVideoMuteToggle = useCallback(() => {
    const videoEl = getVideoElement();
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    setVideoState(prev => ({ ...prev, muted: videoEl.muted }));
  }, [getVideoElement]);

  const handleVideoVolumeChange = useCallback((volume) => {
    const videoEl = getVideoElement();
    if (!videoEl) return;
    videoEl.volume = Math.max(0, Math.min(1, volume));
    setVideoState(prev => ({ ...prev, volume: videoEl.volume }));
  }, [getVideoElement]);

  const handleVideoPlaybackRateChange = useCallback((rate) => {
    const videoEl = getVideoElement();
    if (!videoEl) return;
    videoEl.playbackRate = rate;
    setVideoState(prev => ({ ...prev, playbackRate: rate }));
  }, [getVideoElement]);

  const handleVideoFullscreen = useCallback(() => {
    // video element가 DOM에 연결되어 있는지 확인
    const videoEl = getVideoElement();
    const isVideoConnected = videoEl && videoEl.isConnected;
    
    // video element가 DOM에 연결되어 있으면 video element로 전체화면 시도
    if (videoEl && isVideoConnected) {
      const requestFullscreen = 
        videoEl.requestFullscreen ||
        videoEl.webkitRequestFullscreen ||
        videoEl.mozRequestFullScreen ||
        videoEl.msRequestFullscreen;
      
      if (requestFullscreen) {
        try {
          const promise = requestFullscreen.call(videoEl);
          if (promise && typeof promise.catch === 'function') {
            promise.catch(err => {
              console.warn("Video element 전체화면 실패, container로 시도:", err);
              requestContainerFullscreen();
            });
          }
          return;
        } catch (err) {
          console.warn("Video element 전체화면 오류, container로 시도:", err);
          requestContainerFullscreen();
          return;
        }
      }
    }
    
    // video element가 없거나 연결되지 않았으면 container를 전체화면으로
    requestContainerFullscreen();
    
    function requestContainerFullscreen() {
      const container = containerRef.current;
      if (container) {
        const requestFullscreen = 
          container.requestFullscreen ||
          container.webkitRequestFullscreen ||
          container.mozRequestFullScreen ||
          container.msRequestFullscreen;
        
        if (requestFullscreen) {
          try {
            const promise = requestFullscreen.call(container);
            if (promise && typeof promise.catch === 'function') {
              promise.catch(err => {
                console.error("Container 전체화면 실패:", err);
              });
            }
          } catch (err) {
            console.error("Container 전체화면 오류:", err);
          }
        }
      }
    }
  }, [getVideoElement]);

  // 🔥 Video 상태 업데이트 (timeupdate 이벤트)
  useEffect(() => {
    const videoEl = getVideoElement();
    if (!videoEl) return;

    const updateTime = () => {
      setVideoState(prev => ({
        ...prev,
        currentTime: videoEl.currentTime,
        duration: videoEl.duration || 0,
        isPlaying: !videoEl.paused,
      }));
    };

    const updateDuration = () => {
      setVideoState(prev => ({
        ...prev,
        duration: videoEl.duration || 0,
      }));
    };

    videoEl.addEventListener('timeupdate', updateTime);
    videoEl.addEventListener('loadedmetadata', updateDuration);
    videoEl.addEventListener('play', () => setVideoState(prev => ({ ...prev, isPlaying: true })));
    videoEl.addEventListener('pause', () => setVideoState(prev => ({ ...prev, isPlaying: false })));

    // 초기 상태 설정
    updateTime();
    updateDuration();
    setVideoState(prev => ({
      ...prev,
      volume: videoEl.volume,
      muted: videoEl.muted,
      playbackRate: videoEl.playbackRate,
    }));

    return () => {
      videoEl.removeEventListener('timeupdate', updateTime);
      videoEl.removeEventListener('loadedmetadata', updateDuration);
      videoEl.removeEventListener('play', () => {});
      videoEl.removeEventListener('pause', () => {});
    };
  }, [selectedObjectType, getVideoElement]);

  // 객체 조작 함수들 (복제, 삭제 등)
  const handleDuplicateObject = useCallback(async () => {
    if (!fabricRef.current) return;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;

    try {
      const cloned = await obj.clone();
      cloned.set({
        left: (obj.left || 0) + 20,
        top: (obj.top || 0) + 20,
      });
      fabricRef.current.add(cloned);
      fabricRef.current.setActiveObject(cloned);
      fabricRef.current.requestRenderAll();
      saveHistory();
    } catch (error) {
      console.error("복제 실패:", error);
    }
  }, [saveHistory]);

  const handleDeleteObject = useCallback(() => {
    if (!fabricRef.current) return;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    fabricRef.current.remove(obj);
    fabricRef.current.discardActiveObject();
    fabricRef.current.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  const handleBringToFront = useCallback(() => {
    if (!fabricRef.current) return;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    fabricRef.current.bringObjectToFront(obj);
    fabricRef.current.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  const handleSendToBack = useCallback(() => {
    if (!fabricRef.current) return;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    fabricRef.current.sendObjectToBack(obj);
    fabricRef.current.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  const handleBringForward = useCallback(() => {
    if (!fabricRef.current) return;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    fabricRef.current.bringObjectForward(obj);
    fabricRef.current.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  const handleSendBackward = useCallback(() => {
    if (!fabricRef.current) return;
    const obj = fabricRef.current.getActiveObject();
    if (!obj) return;
    fabricRef.current.sendObjectBackwards(obj);
    fabricRef.current.requestRenderAll();
    saveHistory();
  }, [saveHistory]);

  // 객체 데이터 추출 함수
  const handleExtractObjectData = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) {
      console.log("❌ 캔버스가 아직 준비되지 않았습니다.");
      return;
    }

    const activeObject = canvas.getActiveObject();
    
    if (activeObject) {
      // 선택된 객체가 있으면 그 객체의 데이터만 추출
      // toJSON()을 사용하여 모든 속성 포함 (새로 생성한 객체도 포함)
      const objectData = activeObject.toJSON();
      console.log("📦 선택된 객체 데이터:", objectData);
      
      // JSON 문자열로 변환하여 클립보드에 복사
      const jsonString = JSON.stringify(objectData, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert("선택된 객체 데이터가 클립보드에 복사되었습니다!");
      }).catch(() => {
        // 클립보드 복사 실패 시 다운로드
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `object_data_${Date.now()}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } else {
      // 선택된 객체가 없으면 전체 캔버스 데이터 추출
      // canvas.toJSON()을 사용하여 모든 객체 포함 (새로 생성한 객체도 포함)
      const canvasData = canvas.toJSON();
      
      console.log("📦 전체 캔버스 데이터:", canvasData);
      const allObjects = canvas.getObjects();
      console.log(`총 객체 개수: ${allObjects.length}`);
      
      // JSON 문자열로 변환하여 클립보드에 복사
      const jsonString = JSON.stringify(canvasData, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert("전체 캔버스 데이터가 클립보드에 복사되었습니다!");
      }).catch(() => {
        // 클립보드 복사 실패 시 다운로드
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `canvas_data_${Date.now()}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }
  }, [fabricRef]);

  // 🎨 AI 색상 추천 핸들러
  const handleAIColorRecommendation = useCallback(async () => {
    if (!selectedDesign) {
      alert("선택된 디자인이 없습니다.");
      return;
    }

    if (!selectedDesign.canvasJson) {
      alert("캔버스 데이터가 없습니다.");
      return;
    }

    if (!selectedDesign.backgroundImageUrl) {
      alert("배경 이미지가 없습니다.");
      return;
    }

    try {
      // 로딩 상태 표시 (선택 사항 - 나중에 UI 추가 가능)
      console.log("🎨 [AI 색상 추천] 시작");

      // 현재 canvas에서 사용자가 수정한 최신 데이터 가져오기
      const canvas = fabricRef.current;
      if (!canvas) {
        throw new Error("캔버스가 초기화되지 않았습니다.");
      }
      
      // 🔥 현재 캔버스의 실제 객체들을 가져와서 현재 상태 추출
      const canvasObjects = canvas.getObjects();
      const currentCanvasData = canvas.toJSON(['selectable', 'evented']); // 현재 상태 추출
      
      console.log("📊 [AI 색상 추천] 현재 캔버스 데이터:", {
        objectsCount: currentCanvasData.objects?.length || 0,
        objects: currentCanvasData.objects?.map((obj, idx) => ({
          index: idx,
          type: obj.type,
          text: obj.text || obj.type,
          fill: obj.fill,
          fontSize: obj.fontSize
        }))
      });
      
      // AI 서버로 보낼 때는 변경 가능한 필드만 포함하도록 필터링
      // 변경 가능한 필드: fontFamily, fontSize, fontWeight, fontStyle, fill, stroke, strokeWidth, 
      //                  opacity, charSpacing, lineHeight, textBackgroundColor, textAlign, underline, linethrough, shadow
      // 변경 불가능한 필드는 제외 (left, top, width, height, angle, scaleX, scaleY 등)
      // 하지만 AI 서버가 객체 구조를 이해하기 위해 type, role 같은 식별 필드는 포함
      const filterModifiableFields = (canvasJson) => {
        if (!canvasJson || !canvasJson.objects) {
          return canvasJson;
        }

        // 변경 가능한 필드 목록
        const modifiableFields = [
          'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
          'fill', 'stroke', 'strokeWidth',
          'opacity',
          'charSpacing', 'lineHeight',
          'textBackgroundColor', 'textAlign', 'underline', 'linethrough',
          'shadow'
        ];

        // 객체 식별을 위한 필수 필드 (AI 서버가 객체를 구분하기 위해 필요)
        const requiredFields = ['type', 'role'];

        const filteredObjects = canvasJson.objects.map((obj, index) => {
          const filteredObj = {
            _index: index, // 🔥 인덱스 정보 추가 (매칭을 위해)
          };
          
          // 필수 필드 포함
          requiredFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(obj, field)) {
              filteredObj[field] = obj[field];
            }
          });

          // 변경 가능한 필드만 포함
          modifiableFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(obj, field)) {
              filteredObj[field] = obj[field];
            }
          });

          // 텍스트 객체의 경우 text 필드도 포함 (AI가 읽어야 함)
          if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
            if (Object.prototype.hasOwnProperty.call(obj, 'text')) {
              filteredObj.text = obj.text;
            }
          }

          return filteredObj;
        });

        return {
          ...canvasJson,
          objects: filteredObjects
        };
      };

      const filteredCanvasData = filterModifiableFields(currentCanvasData);
      console.log("📤 [AI 색상 추천] 필터링된 canvas 데이터 전송 (변경 가능한 필드만):", filteredCanvasData);

      // AI 서버에 요청
      const updatedCanvasData = await requestAIColorRecommendation({
        backgroundImageUrl: selectedDesign.backgroundImageUrl,
        canvasData: filteredCanvasData,
        layoutType: selectedDesign.category || "default",
      });

      console.log("✅ [AI 색상 추천] 응답 받음:", updatedCanvasData);
      
      // 응답 검증
      if (!updatedCanvasData || typeof updatedCanvasData !== "object") {
        throw new Error("AI 서버 응답이 올바르지 않습니다. updatedCanvas가 없습니다.");
      }
      
      // objects 배열 검증
      if (!updatedCanvasData.objects || !Array.isArray(updatedCanvasData.objects)) {
        throw new Error("AI 서버 응답에 objects 배열이 없습니다.");
      }

      console.log("📥 [AI 색상 추천] AI 응답 데이터:", {
        objectsCount: updatedCanvasData.objects?.length || 0,
        objects: updatedCanvasData.objects?.map((obj, idx) => ({
          index: idx,
          type: obj.type,
          text: obj.text || obj.type,
          fill: obj.fill,
          fontSize: obj.fontSize
        }))
      });

      // 🔥 현재 캔버스 객체와 AI 응답을 type과 index로 매칭하여 업데이트
      // 1. 현재 캔버스의 객체들을 type별로 그룹화하고 index로 정렬
      const currentObjectsByType = {};
      canvasObjects.forEach((obj, index) => {
        const objType = obj.type || 'unknown';
        if (!currentObjectsByType[objType]) {
          currentObjectsByType[objType] = [];
        }
        currentObjectsByType[objType].push({ obj, index });
      });

      // 2. AI 응답의 객체들도 type별로 그룹화하고 _index로 정렬
      const aiObjectsByType = {};
      updatedCanvasData.objects.forEach((aiObj, aiIndex) => {
        const objType = aiObj.type || 'unknown';
        const originalIndex = aiObj._index !== undefined ? aiObj._index : aiIndex;
        if (!aiObjectsByType[objType]) {
          aiObjectsByType[objType] = [];
        }
        aiObjectsByType[objType].push({ aiObj, originalIndex });
      });

      // 3. type별로 매칭하여 업데이트
      const modifiableFields = [
        'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
        'fill', 'stroke', 'strokeWidth',
        'opacity',
        'charSpacing', 'lineHeight',
        'textBackgroundColor', 'textAlign', 'underline', 'linethrough',
        'shadow'
      ];

      let updateCount = 0;
      
      // 각 type별로 처리
      Object.keys(aiObjectsByType).forEach(type => {
        const currentTypeObjects = currentObjectsByType[type] || [];
        const aiTypeObjects = aiObjectsByType[type] || [];
        
        // type이 같은 객체들을 index 순서대로 매칭
        aiTypeObjects.forEach(({ aiObj, originalIndex }) => {
          // originalIndex를 기준으로 현재 캔버스 객체 찾기
          const currentObjData = currentTypeObjects.find(co => co.index === originalIndex);
          
          if (!currentObjData) {
            console.warn(`⚠️ [AI 색상 추천] type=${type}, index=${originalIndex}에 해당하는 현재 캔버스 객체를 찾을 수 없습니다.`);
            return;
          }

          const canvasObj = currentObjData.obj;
          let hasChanges = false;

          // 변경 가능한 필드만 업데이트 (바뀐 것만)
          modifiableFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(aiObj, field) && aiObj[field] !== undefined) {
              // 현재 값과 비교하여 다를 때만 업데이트
              const currentValue = canvasObj[field];
              const newValue = aiObj[field];
              
              // 값이 실제로 다른 경우에만 업데이트
              if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
                canvasObj.set(field, newValue);
                hasChanges = true;
                console.log(`🔄 [AI 색상 추천] 업데이트: type=${type}, index=${originalIndex}, field=${field}, ${JSON.stringify(currentValue)} → ${JSON.stringify(newValue)}`);
              }
            }
          });

          if (hasChanges) {
            updateCount++;
          }
        });
      });

      console.log(`✅ [AI 색상 추천] ${updateCount}개 객체 업데이트 완료`);

      // 변경사항 반영
      canvas.requestRenderAll();
      
      // 히스토리 저장
      if (!isLoadingRef.current) {
        saveHistory();
      }

      // isLoadingRef를 true로 설정하여 캔버스 재로딩 방지
      // useDesignManager의 useEffect에서 isLoadingRef.current를 체크하여 캔버스 로딩을 건너뜀
      isLoadingRef.current = true;

      // 🔥 현재 캔버스 상태를 다시 가져와서 initialDesigns 업데이트 (동기화)
      const updatedCanvasJson = canvas.toJSON(['selectable', 'evented']);
      
      // initialDesigns 상태 업데이트 (동기화)
      setInitialDesigns((prevDesigns) => {
        return prevDesigns.map((design) => {
          if (design.id === selectedDesign.id) {
            return {
              ...design,
              canvasJson: updatedCanvasJson,
            };
          }
          return design;
        });
      });

      // 🔥 AI 색상 추천 후 zoom in 적용을 위해 recalcCanvasViewport 호출
      // updatedCanvasJson을 사용하여 업데이트된 디자인 정보로 뷰포트 재계산
      const updatedDesign = {
        ...selectedDesign,
        canvasJson: updatedCanvasJson,
      };
      recalcCanvasViewport(updatedDesign);

      // 약간의 딜레이 후 isLoadingRef 해제
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 300);

      console.log("✅ [AI 색상 추천] 캔버스 객체 업데이트 완료 (캔버스 재로딩 없음)");

      alert("AI 색상 추천이 적용되었습니다!");
    } catch (error) {
      console.error("❌ [AI 색상 추천] 실패:", error);
      alert(`AI 색상 추천 중 오류가 발생했습니다: ${error.message}`);
    }
  }, [selectedDesign, saveHistory, isLoadingRef, recalcCanvasViewport]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        handleDeleteObject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        handleDuplicateObject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteObject, handleDuplicateObject]);

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-lg font-semibold text-gray-600">템플릿 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: "rgb(37, 37, 47)" }}>
      <StepHeader />

      <div className="flex-1 flex overflow-hidden" style={{ paddingTop: '76px' }}>
        <EditorSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          designList={designList}
          onSelectDesign={handleSelectDesign}
          fabricRef={fabricRef}
          onAfterCanvasResize={() => {}} // 🔥 자동 저장 제거: 캔버스 크기 변경 시 저장하지 않음
        />

        <main className="flex-1 flex flex-col bg-[#e5e7eb] relative">
          {/* 헤더 바 */}
          <div className="h-11 bg-[#111111] text-gray-100 flex items-center justify-between px-4 border-b border-black">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold">ACC Design Editor</span>
              <span className="text-xs text-gray-400">
                {selectedDesign ? selectedDesign.title : "Untitled Design"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleDownloadCurrent}
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 font-semibold"
                title="현재 선택된 디자인 저장"
              >
                저장
              </button>
            </div>
          </div>

          <EditorToolbar
            objectType={selectedObjectType}
            textStyle={textStyle}
            fontOptions={FONT_OPTIONS}
            onChangeFontFamily={handleChangeFontFamily}
            onChangeColor={selectedObjectType === "text" ? handleChangeColor : handleChangeShapeColor}
            onChangeFontSize={handleChangeFontSize}
            onChangeAlign={handleChangeAlign}
            onToggleBold={handleToggleBold}
            onToggleItalic={handleToggleItalic}
            onToggleUnderline={handleToggleUnderline}
            onToggleStrike={handleToggleStrike}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onChangeStrokeColor={handleChangeStrokeColor}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onDuplicate={handleDuplicateObject}
            onDelete={handleDeleteObject}
            onAIColorRecommendation={handleAIColorRecommendation}
            // Video 컨트롤 props
            videoState={videoState}
            onVideoPlayPause={handleVideoPlayPause}
            onVideoSeek={handleVideoSeek}
            onVideoMuteToggle={handleVideoMuteToggle}
            onVideoVolumeChange={handleVideoVolumeChange}
            onVideoPlaybackRateChange={handleVideoPlaybackRateChange}
            onVideoFullscreen={handleVideoFullscreen}
          />

          {rotationAngle !== null && (
            <div className="absolute top-24 right-24 z-30 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold">
              {rotationAngle}°
            </div>
          )}

          {/* 캔버스 영역 (고정형 컨테이너) */}
          <div className="flex-1 relative overflow-hidden bg-[#e5e7eb] flex items-center justify-center" ref={containerRef}>
            <canvas ref={canvasRef} className="block" />
            
            {/* 객체 데이터 추출 버튼 */}
            <button
              type="button"
              onClick={handleExtractObjectData}
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
              title="객체 데이터 추출 (선택된 객체가 있으면 해당 객체, 없으면 전체 캔버스)"
            >
              데이터 추출
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditorPage;
