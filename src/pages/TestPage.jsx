// src/pages/TestPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "fabric";
import { testItems } from "../assets/editor/testData";

import EditorSidebar from "../components/editor/sidebar/EditorSidebar";
import Header from "../layout/Header";
import EditorToolbar from "../components/editor/toolbar/EditorToolbar";

// 분리된 훅들
import useTextStyleControls from "../components/editor/hooks/useTextStyleControls";
import useCanvasHistory from "../components/editor/hooks/useCanvasHistory";
import useDesignManager from "../components/editor/hooks/useDesignManager";
import { Textbox } from "fabric";

// 폰트 옵션 import
import { FONT_OPTIONS } from "../constants/fontOptions";

const TestPage = () => {
  const [activeTab, setActiveTab] = useState("my-designs");
  
  // 🔥 testItems를 INITIAL_DESIGNS로 변환
  const getInitialDesigns = useCallback((itemsData) => {
    if (!itemsData || !Array.isArray(itemsData) || itemsData.length === 0) {
      return [];
    }

    return itemsData.map((item, index) => ({
      id: index,
      title: item.category || `디자인 ${index}`,
      category: item.category || "미분류",
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
  const containerRef = useRef(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // 🔥 히스토리 관리
  const { saveHistory, handleUndo, handleRedo } = useCanvasHistory(fabricRef);

  // 🔥 캔버스 크기/줌 재계산
  const recalcCanvasViewport = useCallback((design) => {
    const canvas = fabricRef.current;
    const container = containerRef.current;
    if (!canvas || !design || !container) return;

    const designWidth = design.canvasJson?.width || canvas.width || 1500;
    const designHeight = design.canvasJson?.height || canvas.height || 1300;

    const MAX_VIEWPORT_SIZE = 800;
    let boxWidth = MAX_VIEWPORT_SIZE;
    let boxHeight = (designHeight / designWidth) * MAX_VIEWPORT_SIZE;
    
    if (boxHeight > MAX_VIEWPORT_SIZE) {
      boxHeight = MAX_VIEWPORT_SIZE;
      boxWidth = (designWidth / designHeight) * MAX_VIEWPORT_SIZE;
    }

    canvas.setDimensions({ width: boxWidth, height: boxHeight });

    const scaleX = (boxWidth * 0.95) / designWidth;
    const scaleY = (boxHeight * 0.95) / designHeight;
    const zoom = Math.min(scaleX, scaleY);

    const vpt = [zoom, 0, 0, zoom, 0, 0];
    vpt[4] = (boxWidth - designWidth * zoom) / 2;
    vpt[5] = (boxHeight - designHeight * zoom) / 2;

    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();
  }, [fabricRef]);

  // 🔥 더미데이터 로드 (EditorPage의 API 호출 부분 대체)
  useEffect(() => {
    const loadTestData = () => {
      try {
        setIsLoading(true);
        
        console.log("📌 Test 데이터 로드:", testItems);

        const items = testItems;

        if (!items || items.length === 0) {
          console.warn("⚠️ 테스트 데이터가 비어있습니다.");
          setIsLoading(false);
          return;
        }

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
        console.error("❌ 테스트 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [getInitialDesigns]);

  // 🔥 작업물 관리 훅
  const {
    designList,
    selectedDesign,
    handleSelectDesign,
    snapshotCurrentDesign,
    isLoadingRef,
  } = useDesignManager(
    initialDesigns,
    fabricRef,
    saveHistory,
    recalcCanvasViewport,
    isCanvasReady
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

    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || 
        obj.type === 'polygon' || obj.type === 'path') {
      obj.set({ fill: color });
      canvas.requestRenderAll();
      setTextStyle((prev) => ({ ...prev, color }));
      saveHistory();
    }
  }, [fabricRef, saveHistory]);

  // 🔥 도형 테두리 색상 변경 핸들러
  const handleChangeStrokeColor = useCallback((color) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

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

  // 🔥 Save 버튼 핸들러
  const handleSave = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedDesign) {
      alert("저장할 디자인이 없습니다.");
      return;
    }

    if (isLoadingRef.current) {
      alert("로딩 중에는 저장할 수 없습니다.");
      return;
    }

    console.log("💾 [Save 버튼] 저장 시작");
    snapshotCurrentDesign();
    alert("저장되었습니다.");
  }, [selectedDesign, snapshotCurrentDesign, isLoadingRef]);

  // 다운로드
  const handleDownloadCurrent = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedDesign) return;

    const currentWidth = selectedDesign.canvasJson?.width || canvas.width;
    const currentHeight = selectedDesign.canvasJson?.height || canvas.height;
    const targetWidth = selectedDesign.exportWidth || currentWidth;
    const targetHeight = selectedDesign.exportHeight || currentHeight;

    const scaleX = targetWidth / currentWidth;
    const scaleY = targetHeight / currentHeight;
    const multiplier = Math.min(scaleX, scaleY);

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

    canvas.setViewportTransform(originalVpt);

    const link = document.createElement("a");
    const baseName = `${selectedDesign.category || "design"}_${selectedDesign.id}`;
    link.download = `${baseName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fabricRef, selectedDesign]);

  // 초기 캔버스 설정
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!canvasRef.current) {
      return;
    }

    if (fabricRef.current) {
      return;
    }

    console.log("🎨 캔버스 초기화 시작");

    const initWidth = containerRef.current?.clientWidth || 800;
    const initHeight = containerRef.current?.clientHeight || 450;

    const c = new Canvas(canvasRef.current, {
      width: initWidth,
      height: initHeight,
      backgroundColor: "#e5e7eb",
      preserveObjectStacking: true,
      selectionColor: "rgba(59, 130, 246, 0.1)",
      selectionBorderColor: "#2563eb",
      selectionLineWidth: 2,
    });

    fabricRef.current = c;
    console.log("✅ 캔버스 초기화 완료, isCanvasReady = true");
    setIsCanvasReady(true);

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
        setSelectedObjectType("shape");
        setTextStyle((prev) => ({
          ...prev,
          color: obj.fill || "#3b82f6",
          strokeColor: obj.stroke || "#1e40af",
        }));
      } else if (obj?.type === 'path') {
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

    const handleCanvasChange = () => {
      if (!isLoadingRef.current) {
        saveHistory();
      }
    };

    c.on("selection:created", syncToolbarFromSelection);
    c.on("selection:updated", syncToolbarFromSelection);
    c.on("selection:cleared", () => setSelectedObjectType(null));
    
    c.on("object:modified", (e) => {
      handleCanvasChange("object:modified", e);
      handleRotationEnd(e);
    });
    
    c.on("object:moving", (e) => {
      console.log("🔄 변경 감지됨: object:moving", {
        left: e.target.left,
        top: e.target.top,
        type: e.target.type,
        timestamp: new Date().toLocaleTimeString()
      });
    });
    
    c.on("object:scaling", (e) => {
      console.log("🔄 변경 감지됨: object:scaling", {
        scaleX: e.target.scaleX,
        scaleY: e.target.scaleY,
        type: e.target.type,
        timestamp: new Date().toLocaleTimeString()
      });
    });
    
    c.on("object:added", (e) => {
      handleCanvasChange("object:added", e);
    });
    c.on("object:removed", (e) => {
      handleCanvasChange("object:removed", e);
    });
    
    c.on("text:changed", (e) => {
      handleCanvasChange("text:changed", e);
    });
    
    c.on("text:editing:entered", (e) => {
      console.log("🔄 변경 감지됨: text:editing:entered", {
        text: e.target.text,
        timestamp: new Date().toLocaleTimeString()
      });
    });
    
    c.on("object:rotating", handleRotating);

    // 🔥 video 객체가 있을 때 계속 렌더링 (Fabric.js 공식 방식)
    let animationFrameId = null;
    const hasVideoObjects = () => {
      const objects = c.getObjects();
      return objects.some(obj => {
        // video 요소를 직접 확인
        const element = obj.getElement ? obj.getElement() : null;
        if (element && element.tagName === 'VIDEO') {
          return true;
        }
        // 또는 videoUrl 속성 확인
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
      c.off("object:rotating", handleRotating);
      c.off("object:added", checkAndStartRenderLoop);
      c.dispose();
      fabricRef.current = null;
    };
  }, [saveHistory, isLoadingRef, isLoading]);

  // 객체 조작 함수들
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

  // 🔥 Video element 가져오기
  const getVideoElement = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) {
      console.warn("❌ Canvas가 없습니다.");
      return null;
    }
    const obj = canvas.getActiveObject();
    if (!obj) {
      console.warn("❌ 선택된 객체가 없습니다.");
      return null;
    }
    
    console.log("🔍 선택된 객체:", obj.type, obj);
    
    const element = obj.getElement ? obj.getElement() : null;
    console.log("🔍 Element:", element, element?.tagName);
    
    if (element && element.tagName === 'VIDEO') {
      console.log("✅ Video element 찾음:", element);
      return element;
    }
    
    console.warn("❌ Video element를 찾을 수 없습니다.");
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
    
    console.log("🎬 전체화면 요청:", { videoEl: !!videoEl, isConnected: isVideoConnected });
    
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
              // 실패 시 container로 시도
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
      // Canvas container를 전체화면으로
      const container = containerRef.current;
      if (container) {
        console.log("🔄 Container 전체화면 시도...");
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
                alert(`전체화면 실패: ${err.message || '알 수 없는 오류'}`);
              });
            }
          } catch (err) {
            console.error("Container 전체화면 오류:", err);
            alert(`전체화면 오류: ${err.message || '알 수 없는 오류'}`);
          }
        } else {
          console.warn("❌ 브라우저가 전체화면 API를 지원하지 않습니다.");
          alert("이 브라우저는 전체화면을 지원하지 않습니다.");
        }
      } else {
        console.error("❌ Container를 찾을 수 없습니다.");
        alert("전체화면을 위한 컨테이너를 찾을 수 없습니다.");
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
        <div className="text-lg font-semibold text-gray-600">테스트 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 mt-20">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          designList={designList}
          onSelectDesign={handleSelectDesign}
          fabricRef={fabricRef}
          onAfterCanvasResize={() => {}}
        />

        <main className="flex-1 flex flex-col bg-[#e5e7eb] relative">
          {/* 헤더 바 */}
          <div className="h-11 bg-[#111111] text-gray-100 flex items-center justify-between px-4 border-b border-black">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold">ACC Design Editor (Test)</span>
              <span className="text-xs text-gray-400">
                {selectedDesign ? selectedDesign.title : "Untitled Design"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 font-semibold"
                title="현재 디자인 저장"
              >
                저장
              </button>
              <button
                type="button"
                onClick={handleDownloadCurrent}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 font-semibold"
              >
                Download
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

          {/* 캔버스 영역 */}
          <div className="flex-1 relative overflow-hidden bg-[#e5e7eb] flex items-center justify-center" ref={containerRef}>
            <canvas ref={canvasRef} className="block" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestPage;
