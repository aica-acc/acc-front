// src/components/editor/hooks/useCanvasEvents.js
// 캔버스 이벤트 핸들러 설정

import { useEffect } from "react";
import { IText, Textbox } from "fabric";

/**
 * 캔버스 이벤트 핸들러 설정 훅
 * @param {Object} fabricRef - Fabric Canvas ref
 * @param {Function} setIsTextSelected - 텍스트 선택 상태 설정 함수
 * @param {Function} setTextStyle - 텍스트 스타일 설정 함수
 * @param {Function} saveHistory - 히스토리 저장 함수
 * @param {Object} isLoadingRef - 로딩 중 플래그 ref
 */
export default function useCanvasEvents(
  fabricRef,
  setIsTextSelected,
  setTextStyle,
  saveHistory,
  isLoadingRef
) {
  useEffect(() => {
    // 캔버스가 준비될 때까지 대기
    const checkAndSetupEvents = () => {
      const canvas = fabricRef.current;
      console.log("🎪 useCanvasEvents 등록 시작, canvas:", !!canvas);
      
      if (!canvas) {
        console.warn("⚠️ canvas가 아직 없음, 100ms 후 재시도...");
        // 100ms 후 재시도
        const timeoutId = setTimeout(checkAndSetupEvents, 100);
        return () => clearTimeout(timeoutId);
      }
      
      console.log("✅ canvas 존재! 이벤트 등록 진행");

    // 선택된 객체에 따라 텍스트 툴바 상태 업데이트
    const syncToolbarFromSelection = () => {
      const obj = canvas.getActiveObject();
      
      console.log("🔍 선택된 객체:", {
        exists: !!obj,
        type: obj?.type,
        constructor: obj?.constructor?.name,
        isIText: obj instanceof IText,
        isTextbox: obj instanceof Textbox,
      });
      
      // Fabric.js v6: Textbox 또는 IText 체크
      const isTextObject = obj && (obj instanceof IText || obj instanceof Textbox || obj?.type === 'textbox' || obj?.type === 'i-text');
      
      console.log("  → isTextObject:", isTextObject);
      
      if (isTextObject) {
        console.log("✅ TextToolbar 표시 - 스타일:", {
          fill: obj.fill,
          fontSize: obj.fontSize,
          textAlign: obj.textAlign
        });
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
        console.log("❌ TextToolbar 숨김");
      }
    };

    console.log("📌 이벤트 리스너 등록 중...");
    canvas.on("selection:created", syncToolbarFromSelection);
    canvas.on("selection:updated", syncToolbarFromSelection);
    canvas.on("selection:cleared", () => {
      console.log("🚫 선택 해제됨");
      setIsTextSelected(false);
    });

    // 🔥 캔버스 변경 이벤트: 히스토리만 저장 (자동 스냅샷 제거)
    const handleCanvasChange = () => {
      // 로딩 중이면 무시
      if (isLoadingRef.current) return;

      // 🔥 히스토리만 저장 (Undo/Redo용, 스냅샷은 저장하지 않음)
      saveHistory();
    };

    // 객체 수정 (드래그, 리사이즈, 회전 등)
    canvas.on("object:modified", handleCanvasChange);
    // 객체 추가
    canvas.on("object:added", handleCanvasChange);
    // 객체 제거
    canvas.on("object:removed", handleCanvasChange);
    // 텍스트 변경 (입력)
    canvas.on("text:changed", handleCanvasChange);

      console.log("✅ 모든 이벤트 리스너 등록 완료");

      return () => {
        console.log("🧹 이벤트 리스너 정리");
        canvas.off("selection:created", syncToolbarFromSelection);
        canvas.off("selection:updated", syncToolbarFromSelection);
        canvas.off("selection:cleared");
        canvas.off("object:modified", handleCanvasChange);
        canvas.off("object:added", handleCanvasChange);
        canvas.off("object:removed", handleCanvasChange);
        canvas.off("text:changed", handleCanvasChange);
      };
    };

    // 이벤트 설정 시작
    return checkAndSetupEvents();
  }, [
    fabricRef,
    setIsTextSelected,
    setTextStyle,
    saveHistory,
    isLoadingRef,
  ]);
}

