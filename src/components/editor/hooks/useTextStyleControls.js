// src/components/editor/hooks/useTextStyleControls.js
import { useCallback } from "react";
import { IText, Textbox, Shadow } from "fabric";

/**
 * 텍스트 스타일 관련 로직을 EditorPage에서 분리한 훅.
 * - 선택된 IText 객체에 스타일 적용
 * - toolbar 핸들러 (색상 / 폰트 / 크기 / 정렬 / B I U S)
 */
const useTextStyleControls = (fabricRef, setTextStyle, saveHistory) => {
  const applyStyleToActiveText = useCallback(
    (props) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      
      // Fabric.js v6: Textbox 또는 IText 체크 (여러 방식으로 확인)
      const isTextObject = obj && (
        obj instanceof IText || 
        obj instanceof Textbox ||
        obj?.type === 'textbox' ||
        obj?.type === 'i-text' ||
        obj?.type === 'text'
      );
      
      if (!isTextObject) {
        console.warn("⚠️ 텍스트 객체가 선택되지 않았습니다:", obj?.type);
        return;
      }

      obj.set(props);
      canvas.requestRenderAll();
      if (saveHistory) {
        saveHistory();
      }
    },
    [fabricRef, saveHistory]
  );

  const handleChangeColor = useCallback(
    (color) => {
      setTextStyle((prev) => ({ ...prev, color }));
      applyStyleToActiveText({ fill: color });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleChangeFontSize = useCallback(
    (size) => {
      const safe = size > 0 ? size : 1;
      setTextStyle((prev) => ({ ...prev, fontSize: safe }));
      applyStyleToActiveText({ fontSize: safe });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleChangeAlign = useCallback(
    (align) => {
      setTextStyle((prev) => ({ ...prev, align }));
      applyStyleToActiveText({ textAlign: align });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleChangeFontFamily = useCallback(
    (fontFamily) => {
      setTextStyle((prev) => ({ ...prev, fontFamily }));
      applyStyleToActiveText({ fontFamily });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleToggleBold = useCallback(
    () => {
      setTextStyle((prev) => {
        const next = !prev.bold;
        applyStyleToActiveText({ fontWeight: next ? "bold" : "normal" });
        return { ...prev, bold: next };
      });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleToggleItalic = useCallback(
    () => {
      setTextStyle((prev) => {
        const next = !prev.italic;
        applyStyleToActiveText({ fontStyle: next ? "italic" : "normal" });
        return { ...prev, italic: next };
      });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleToggleUnderline = useCallback(
    () => {
      setTextStyle((prev) => {
        const next = !prev.underline;
        applyStyleToActiveText({ underline: next });
        return { ...prev, underline: next };
      });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  const handleToggleStrike = useCallback(
    () => {
      setTextStyle((prev) => {
        const next = !prev.strike;
        applyStyleToActiveText({ linethrough: next });
        return { ...prev, strike: next };
      });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 줄 간격 변경
  const handleChangeLineHeight = useCallback(
    (lineHeight) => {
      const safe = lineHeight > 0 ? lineHeight : 1;
      setTextStyle((prev) => ({ ...prev, lineHeight: safe }));
      applyStyleToActiveText({ lineHeight: safe });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 자간 변경
  const handleChangeCharSpacing = useCallback(
    (charSpacing) => {
      setTextStyle((prev) => ({ ...prev, charSpacing }));
      applyStyleToActiveText({ charSpacing });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 텍스트 테두리 색상 변경
  const handleChangeTextStroke = useCallback(
    (stroke) => {
      setTextStyle((prev) => ({ ...prev, textStroke: stroke }));
      applyStyleToActiveText({ stroke: stroke || null });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 텍스트 테두리 두께 변경
  const handleChangeTextStrokeWidth = useCallback(
    (strokeWidth) => {
      const safe = strokeWidth >= 0 ? strokeWidth : 0;
      setTextStyle((prev) => ({ ...prev, textStrokeWidth: safe }));
      applyStyleToActiveText({ strokeWidth: safe });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 투명도 변경
  const handleChangeOpacity = useCallback(
    (opacity) => {
      const safe = Math.max(0, Math.min(1, opacity)); // 0~1 사이로 제한
      setTextStyle((prev) => ({ ...prev, opacity: safe }));
      applyStyleToActiveText({ opacity: safe });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 텍스트 배경색 변경
  const handleChangeTextBackgroundColor = useCallback(
    (textBackgroundColor) => {
      setTextStyle((prev) => ({ ...prev, textBackgroundColor: textBackgroundColor || "" }));
      applyStyleToActiveText({ textBackgroundColor: textBackgroundColor || "" });
    },
    [applyStyleToActiveText, setTextStyle]
  );

  // 그림자 변경
  const handleChangeShadow = useCallback(
    (shadowConfig) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      
      const isTextObject = obj && (
        obj instanceof IText || 
        obj instanceof Textbox ||
        obj?.type === 'textbox' ||
        obj?.type === 'i-text' ||
        obj?.type === 'text'
      );
      
      if (!isTextObject) {
        console.warn("⚠️ 텍스트 객체가 선택되지 않았습니다:", obj?.type);
        return;
      }

      let shadowInstance = null;
      if (shadowConfig && shadowConfig.color) {
        shadowInstance = new Shadow({
          color: shadowConfig.color,
          blur: shadowConfig.blur ?? 0,
          offsetX: shadowConfig.offsetX ?? 0,
          offsetY: shadowConfig.offsetY ?? 0,
          affectStroke: shadowConfig.affectStroke ?? false,
          nonScaling: shadowConfig.nonScaling ?? false,
        });
      }

      obj.shadow = shadowInstance;
      setTextStyle((prev) => ({ ...prev, shadow: shadowConfig }));
      canvas.requestRenderAll();
      if (saveHistory) {
        saveHistory();
      }
    },
    [fabricRef, saveHistory, setTextStyle]
  );

  return {
    handleChangeColor,
    handleChangeFontSize,
    handleChangeAlign,
    handleChangeFontFamily,
    handleToggleBold,
    handleToggleItalic,
    handleToggleUnderline,
    handleToggleStrike,
    handleChangeLineHeight,
    handleChangeCharSpacing,
    handleChangeTextStroke,
    handleChangeTextStrokeWidth,
    handleChangeOpacity,
    handleChangeTextBackgroundColor,
    handleChangeShadow,
  };
};

export default useTextStyleControls;
