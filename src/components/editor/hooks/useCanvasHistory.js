// src/components/editor/hooks/useCanvasHistory.js
// 캔버스 히스토리 관리 (Undo/Redo)

import { useRef, useCallback } from "react";

/**
 * 캔버스 히스토리 관리 훅
 * @param {Object} fabricRef - Fabric Canvas ref
 * @returns {Object} { saveHistory, handleUndo, handleRedo }
 */
export default function useCanvasHistory(fabricRef) {
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      // 🔥 toJSON() 호출 전에 모든 객체 검증 및 정리
      const objects = canvas.getObjects();
      
      // 1) 모든 객체가 Fabric 객체인지 확인
      objects.forEach((obj, index) => {
        if (!obj || typeof obj.toObject !== 'function') {
          console.error(`❌ [saveHistory] 객체 ${index}가 Fabric 객체가 아님, 제거`);
          try {
            canvas.remove(obj);
          } catch (e) {
            console.error("  - 제거 실패:", e);
            try {
              canvas._objects = canvas._objects.filter(o => o !== obj);
            } catch (e2) {
              console.error("  - 배열에서 제거도 실패:", e2);
            }
          }
          return;
        }
        
        // 2) 중첩 객체 검증 및 제거
        if (obj.shadow && typeof obj.shadow.toObject !== 'function') {
          console.warn(`⚠️ [saveHistory] 객체 ${index}의 shadow가 유효하지 않음, 제거`);
          obj.shadow = null;
        }
        if (obj.clipPath && typeof obj.clipPath.toObject !== 'function') {
          console.warn(`⚠️ [saveHistory] 객체 ${index}의 clipPath가 유효하지 않음, 제거`);
          obj.clipPath = null;
        }
        if (obj.pattern && typeof obj.pattern.toObject !== 'function') {
          console.warn(`⚠️ [saveHistory] 객체 ${index}의 pattern이 유효하지 않음, 제거`);
          obj.pattern = null;
        }
      });
      
      // 3) backgroundImage 검증
      if (canvas.backgroundImage && typeof canvas.backgroundImage.toObject !== 'function') {
        console.warn(`⚠️ [saveHistory] backgroundImage가 유효하지 않음, 제거`);
        canvas.backgroundImage = undefined;
      }
      
      // 4) 최종 검증: 모든 객체가 toObject를 가지고 있는지 확인
      const finalObjects = canvas.getObjects();
      const stillInvalid = finalObjects.filter(obj => !obj || typeof obj.toObject !== 'function');
      if (stillInvalid.length > 0) {
        console.error(`❌ [saveHistory] 여전히 유효하지 않은 객체 ${stillInvalid.length}개 존재, toJSON() 호출 중단`);
        throw new Error(`유효하지 않은 객체 ${stillInvalid.length}개가 있어 저장할 수 없습니다.`);
      }
      
      const json = canvas.toJSON();
      const hist = historyRef.current;
      const idx = historyIndexRef.current;

      historyRef.current = hist.slice(0, idx + 1);
      historyRef.current.push(json);
      historyIndexRef.current = idx + 1;
    } catch (error) {
      console.error("❌ [saveHistory] toJSON() 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        stack: error.stack
      });
      
      // 🔥 오류 발생 시 캔버스 상태 확인
      const objects = canvas.getObjects();
      console.error("캔버스 객체 상태:", {
        objectsCount: objects.length,
        objects: objects.map((obj, idx) => {
          const objInfo = {
            index: idx,
            type: obj?.type,
            hasToObject: typeof obj?.toObject === 'function',
            constructor: obj?.constructor?.name,
            keys: obj ? Object.keys(obj).slice(0, 10) : [],
          };
          
          // shadow 검증
          if (obj?.shadow) {
            objInfo.shadow = {
              exists: true,
              type: typeof obj.shadow,
              hasToObject: typeof obj.shadow.toObject === 'function',
              constructor: obj.shadow.constructor?.name,
              keys: Object.keys(obj.shadow).slice(0, 5),
            };
          } else {
            objInfo.shadow = 'none';
          }
          
          // clipPath 검증
          if (obj?.clipPath) {
            objInfo.clipPath = {
              exists: true,
              type: typeof obj.clipPath,
              hasToObject: typeof obj.clipPath.toObject === 'function',
              constructor: obj.clipPath.constructor?.name,
              clipPathType: obj.clipPath.type,
            };
          } else {
            objInfo.clipPath = 'none';
          }
          
          // pattern 검증
          if (obj?.pattern) {
            objInfo.pattern = {
              exists: true,
              type: typeof obj.pattern,
              hasToObject: typeof obj.pattern.toObject === 'function',
              constructor: obj.pattern.constructor?.name,
            };
          } else {
            objInfo.pattern = 'none';
          }
          
          // 🔥 각 객체의 toObject()를 실제로 호출해보기
          if (obj && typeof obj.toObject === 'function') {
            try {
              const testJson = obj.toObject();
              objInfo.toObjectTest = 'success';
              objInfo.toObjectResult = {
                type: testJson.type,
                hasShadow: !!testJson.shadow,
                hasClipPath: !!testJson.clipPath,
              };
            } catch (e) {
              objInfo.toObjectTest = 'failed';
              objInfo.toObjectError = e.message;
            }
          }
          
          return objInfo;
        })
      });
      
      // 🔥 backgroundImage 상태 확인
      if (canvas.backgroundImage) {
        console.error("backgroundImage 상태:", {
          hasToObject: typeof canvas.backgroundImage.toObject === 'function',
          type: canvas.backgroundImage.constructor?.name
        });
      }
      
      // 오류가 발생해도 앱이 멈추지 않도록 함 (히스토리만 저장 안됨)
    }
  }, [fabricRef]);

  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    const hist = historyRef.current;
    let idx = historyIndexRef.current;

    if (!canvas || idx <= 0) return;

    idx -= 1;
    historyIndexRef.current = idx;
    const json = hist[idx];

    canvas.loadFromJSON(json).then(() => canvas.renderAll());
  }, [fabricRef]);

  const handleRedo = useCallback(() => {
    const canvas = fabricRef.current;
    const hist = historyRef.current;
    let idx = historyIndexRef.current;

    if (!canvas || idx >= hist.length - 1) return;

    idx += 1;
    historyIndexRef.current = idx;
    const json = hist[idx];

    canvas.loadFromJSON(json).then(() => canvas.renderAll());
  }, [fabricRef]);

  return {
    saveHistory,
    handleUndo,
    handleRedo,
  };
}

