// src/components/editor/hooks/useDesignManager.js
// 작업물 관리 훅 (저장, 로딩, 상태 관리)

import { useState, useEffect, useRef, useCallback } from "react";
import { loadDesignToCanvas } from "../../../utils/editor/canvasLoader";
import projectSession from "../../../utils/projectSession";

// 편집 상태 저장 키 (서버 진행 상태): { [디자인 type]: { source, canvasJson } }
export const EDITOR_EDITS_KEY = "editorEdits";
const AUTO_SAVE_DELAY_MS = 2000;

/**
 * onAutoSave(design): 현재 캔버스를 완성 이미지로 프로젝트에 저장한다 (EditorPage 가 제공).
 * 변경 후 2초가 지나거나 다른 디자인으로 바꿀 때 자동으로 부른다.
 */
export default function useDesignManager(
  initialDesigns,
  fabricRef,
  saveHistory,
  onDesignLoaded,
  isCanvasReady,
  onAutoSave
) {
  const [designList, setDesignList] = useState(initialDesigns);
  const [selectedDesignId, setSelectedDesignId] = useState(initialDesigns[0]?.id || null);

  // 🔥 핵심: designList가 변경될 때마다 ref 업데이트
  const designListRef = useRef(designList);
  useEffect(() => {
    designListRef.current = designList;
    console.log("📋 designListRef 업데이트:", designList.length, "개");
  }, [designList]);

  const autoSaveTimerRef = useRef(null);
  const selectedDesignIdRef = useRef(selectedDesignId);
  const isLoadingRef = useRef(false);
  // 저장하지 않은 변경 여부와 자동 저장 상태 (화면 표시용)
  const dirtyRef = useRef(false);
  const onAutoSaveRef = useRef(onAutoSave);
  onAutoSaveRef.current = onAutoSave;
  const [autoSaveStatus, setAutoSaveStatus] = useState({ state: "idle", at: null });

  useEffect(() => {
    selectedDesignIdRef.current = selectedDesignId;
  }, [selectedDesignId]);

  // 🔥 initialDesigns 변경 시 designList 업데이트
  useEffect(() => {
    if (initialDesigns && initialDesigns.length > 0) {
      console.log("🔄 initialDesigns 변경됨, designList 업데이트");
      setDesignList(initialDesigns);
      
      const currentExists = initialDesigns.find(d => d.id === selectedDesignId);
      if (!selectedDesignId || !currentExists) {
        setSelectedDesignId(initialDesigns[0].id);
      }
    }
  }, [initialDesigns, selectedDesignId]);

  // 🔥 현재 디자인을 designListRef에서 가져오기 (항상 최신 데이터)
  const selectedDesign = designListRef.current.find(
    (item) => item.id === selectedDesignId
  ) || null;

  // 즉시 저장 함수
  const snapshotCurrentDesign = useCallback(() => {
    if (isLoadingRef.current) {
      console.log("[SKIP] 로딩 중이므로 저장 스킵");
      return;
    }

    const canvas = fabricRef.current;
    if (!canvas || !selectedDesignIdRef.current) {
      console.warn("⏸️ 저장 스킵: canvas 또는 selectedDesignId 없음");
      return;
    }

    console.log("💾 [즉시 저장] 시작:", new Date().toLocaleTimeString());

    try {
      // 객체 검증 및 정리
      const objects = canvas.getObjects();
      objects.forEach((obj, index) => {
        if (!obj || typeof obj.toObject !== 'function') {
          console.error(`❌ 유효하지 않은 객체 ${index} 제거`);
          canvas.remove(obj);
          return;
        }

        // 중첩 객체 정리
        if (obj.shadow && typeof obj.shadow.toObject !== 'function') {
          console.warn(`⚠️ 객체 ${index}의 shadow 제거`);
          obj.shadow = null;
        }
        if (obj.clipPath && typeof obj.clipPath.toObject !== 'function') {
          console.warn(`⚠️ 객체 ${index}의 clipPath 제거`);
          obj.clipPath = null;
        }
      });

      const json = canvas.toJSON();
      
      // 🔥 텍스트 객체 체크 제거: 모든 상태 저장 (텍스트가 없어도 저장)
      const currentId = selectedDesignIdRef.current;
      const before = designListRef.current.find((d) => d.id === currentId);
      const changed = JSON.stringify(before?.canvasJson?.objects || []) !== JSON.stringify(json.objects || []);

      // 🔥 함수형 업데이트로 최신 상태 기반 업데이트
      setDesignList((prevList) => {
        return prevList.map((item) => {
          if (item.id === currentId) {
            const originalWidth = item.canvasJson?.width || item.exportWidth || canvas.width || 800;
            const originalHeight = item.canvasJson?.height || item.exportHeight || canvas.height || 450;

            const updatedJson = {
              ...json,
              width: originalWidth,
              height: originalHeight,
            };

            console.log("💾 [저장 완료]", {
              id: currentId,
              title: item.title,
              objectsCount: json.objects?.length || 0,
              timestamp: new Date().toLocaleTimeString()
            });

            return {
              ...item,
              canvasJson: updatedJson,
              edited: item.edited || changed,
            };
          }
          return item;
        });
      });

      return changed;
    } catch (error) {
      console.error("❌ [저장 실패]", error);
      return false;
    }
  }, [fabricRef]);

  // 편집 상태를 서버 진행 상태에 저장 → 새로고침·다시 열기에도 편집한 그대로 복원
  useEffect(() => {
    const edited = designList.filter((d) => d.edited && d.canvasJson);
    if (edited.length === 0) return;
    const saved = JSON.parse(projectSession.getItem(EDITOR_EDITS_KEY) || "{}");
    edited.forEach((d) => {
      saved[d.type || d.id] = { source: d.sourceKey || null, canvasJson: d.canvasJson };
    });
    projectSession.setItem(EDITOR_EDITS_KEY, JSON.stringify(saved));
  }, [designList]);

  // 현재 디자인 저장: 편집 상태 스냅샷 + (변경이 있으면) 완성 이미지 저장
  const flushAutoSave = useCallback(async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (isLoadingRef.current) return;
    const current = designListRef.current.find((d) => d.id === selectedDesignIdRef.current);
    const changed = snapshotCurrentDesign();
    if (!(changed || dirtyRef.current) || !current || !onAutoSaveRef.current) return;
    dirtyRef.current = false;
    setAutoSaveStatus({ state: "saving", at: null });
    try {
      await onAutoSaveRef.current(current);
      setAutoSaveStatus({ state: "saved", at: new Date() });
    } catch (e) {
      console.error("❌ [자동 저장 실패]", e);
      dirtyRef.current = true;
      setAutoSaveStatus({ state: "error", at: new Date() });
    }
  }, [snapshotCurrentDesign]);

  // 캔버스가 바뀌었을 때 (EditorPage 의 object:modified/added/removed, text:changed)
  const markDirty = useCallback(() => {
    if (isLoadingRef.current) return;
    dirtyRef.current = true;
    setAutoSaveStatus((s) => (s.state === "saving" ? s : { state: "pending", at: null }));
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      flushAutoSave();
    }, AUTO_SAVE_DELAY_MS);
  }, [flushAutoSave]);

  // 저장 전에 창을 닫으려 하면 경고
  useEffect(() => {
    const warn = (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // Debounced 저장 함수
  const snapshotCurrentDesignDebounced = useCallback(() => {
    if (isLoadingRef.current) {
      console.log("[SKIP] Debounced 저장 스킵 (로딩 중)");
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    console.log("⏳ 디바운스 저장 예약 (2초 후)");
    autoSaveTimerRef.current = setTimeout(() => {
      console.log("⏰ 디바운스 타이머 만료, 저장 실행");
      snapshotCurrentDesign();
      autoSaveTimerRef.current = null;
    }, 2000);
  }, [snapshotCurrentDesign]);

  // 🔥 디자인 전환 시 자동 저장 추가
  const handleSelectDesign = useCallback(async (design) => {
    if (design.id === selectedDesignId) return;

    console.log("🔄 작업물 전환:", selectedDesignId, "→", design.id);

    // 🔥 전환 전에 현재 작업 저장 (편집 상태 + 변경이 있으면 완성 이미지까지, 캔버스가 아직 현재 디자인일 때)
    await flushAutoSave();
    setSelectedDesignId(design.id);
  }, [selectedDesignId, flushAutoSave]);

  // 🔥 캔버스 로딩 (designListRef에서 최신 데이터 가져오기)
  useEffect(() => {
    const canvas = fabricRef.current;
    
    // 🔥 로딩 중이면 캔버스 재로딩 방지 (AI 색상 추천 등에서 사용)
    if (isLoadingRef.current) {
      console.log("⏸️ 로딩 중이므로 캔버스 로딩 스킵");
      return;
    }
    
    // 🔥 항상 최신 designListRef에서 가져오기
    const latestDesign = designListRef.current.find(
      (item) => item.id === selectedDesignId
    ) || null;

    console.log("🎨 캔버스 로딩 체크:", {
      canvas: !!canvas,
      latestDesign: !!latestDesign,
      isCanvasReady,
      selectedDesignId,
      objectsCount: latestDesign?.canvasJson?.objects?.length || 0
    });

    if (!canvas || !latestDesign || !isCanvasReady) {
      console.log("⏸️ 캔버스 로딩 대기 중");
      return;
    }

    console.log("🚀 캔버스 로딩 시작:", latestDesign.title);

    loadDesignToCanvas(canvas, latestDesign, saveHistory, isLoadingRef)
      .then(() => {
        if (typeof onDesignLoaded === "function") {
          onDesignLoaded(latestDesign);
        }
      })
      .catch((error) => {
        console.error("❌ 로딩 실패:", error);
        isLoadingRef.current = false;
      });
  }, [selectedDesignId, fabricRef, saveHistory, onDesignLoaded, isCanvasReady]);
  // 🔥 의존성에서 selectedDesign 제거, selectedDesignId만 사용

  return {
    designList,
    selectedDesignId,
    selectedDesign,
    handleSelectDesign,
    snapshotCurrentDesignDebounced,
    snapshotCurrentDesign,
    flushAutoSave,
    markDirty,
    autoSaveStatus,
    isLoadingRef,
  };
}