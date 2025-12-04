import api from "./BaseAPI";

/**
 * AI 색상 추천 API (백엔드 /api/editor/ai-render를 통해 AI 서버로 전달)
 * @param {Object} params
 * @param {string} params.backgroundImageUrl - 배경 이미지 URL
 * @param {Object} params.canvasData - 현재 canvasData
 * @param {string} params.layoutType - 레이아웃 타입 (카테고리명, 기본값: "default")
 * @returns {Promise<Object>} 변경된 canvasData 객체
 */
export const requestAIColorRecommendation = async ({
  backgroundImageUrl,
  canvasData,
  layoutType = "default",
}) => {
  try {
    console.log("🎨 [AI Color] 색상 추천 요청 시작:", {
      backgroundImageUrl,
      layoutType,
      objectsCount: canvasData?.objects?.length || 0,
    });

    const response = await api.post(
      "/api/editor/ai-render",
      {
        backgroundImage: backgroundImageUrl,
        canvasJson: canvasData,
        layoutType,
      },
      {
        timeout: 60000, // AI 처리 시간이 오래 걸릴 수 있으므로 60초
      }
    );

    console.log("✅ [AI Color] 색상 추천 응답 받음:", response.data);

    if (response.data?.status === "error") {
      const errorMessage = response.data?.message || "AI 색상 추천 중 오류가 발생했습니다.";
      throw new Error(errorMessage);
    }

    if (response.data?.status === "success" && response.data?.updatedCanvas) {
      return response.data.updatedCanvas;
    } else {
      throw new Error("AI 서버 응답 형식이 올바르지 않습니다: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("❌ [AI Color] 색상 추천 요청 실패:", error);
    throw error;
  }
};

/**
 * 에디터에서 수정한 이미지를 서버에 저장하고 DB에 저장하는 API
 * @param {Object} params
 * @param {number} params.pNo - 프로젝트 번호
 * @param {string} params.imageBase64 - base64 이미지 데이터 (data:image/png;base64,...)
 * @param {string} params.dbFileType - 파일 타입 (예: "poster", "mascot", "banner" 등)
 * @returns {Promise<Object>} { success: boolean, savedPath: string }
 */
export const saveEditorImage = async ({
  pNo,
  imageBase64,
  dbFileType,
}) => {
  try {
    console.log("💾 [Editor Save] 이미지 저장 요청 시작:", {
      pNo,
      dbFileType,
      imageSize: imageBase64?.length || 0,
    });

    const response = await api.post(
      "/api/editor/save-image",
      {
        pNo,
        imageBase64,
        dbFileType,
      },
      {
        timeout: 30000, // 이미지 저장은 30초면 충분
      }
    );

    console.log("✅ [Editor Save] 이미지 저장 응답 받음:", response.data);

    // 백엔드 응답 형식 확인 (success 필드 직접 확인)
    if (response.data?.success === false) {
      const errorMessage = response.data?.message || "이미지 저장 중 오류가 발생했습니다.";
      throw new Error(errorMessage);
    }

    if (response.data?.success === true && response.data?.savedPath) {
      return {
        success: true,
        savedPath: response.data.savedPath,
      };
    } else {
      // 응답 형식이 예상과 다를 경우에도 처리
      console.warn("⚠️ [Editor Save] 예상과 다른 응답 형식:", response.data);
      if (response.data?.savedPath) {
        return {
          success: true,
          savedPath: response.data.savedPath,
        };
      }
      throw new Error("서버 응답 형식이 올바르지 않습니다: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("❌ [Editor Save] 이미지 저장 실패:", error);
    throw error;
  }
};

