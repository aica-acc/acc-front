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

