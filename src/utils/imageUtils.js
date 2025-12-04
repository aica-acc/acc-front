/**
 * 이미지 URL을 base64로 변환하는 유틸 함수
 * @param {string} imageUrl - 이미지 URL (로컬 파일 경로 또는 URL)
 * @returns {Promise<string>} base64 문자열 (data:image/png;base64,...)
 */
export const imageUrlToBase64 = async (imageUrl) => {
  try {
    // 로컬 파일 경로인 경우 file:// 프로토콜로 변환
    let url = imageUrl;
    if (imageUrl.startsWith("C:\\") || imageUrl.startsWith("C:/")) {
      // Windows 절대 경로인 경우 file:// 프로토콜 추가
      url = `file:///${imageUrl.replace(/\\/g, "/")}`;
    } else if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://") && !imageUrl.startsWith("file://")) {
      // 상대 경로인 경우 public 폴더 기준으로 변환
      if (imageUrl.startsWith("/data/") || imageUrl.startsWith("data/")) {
        const publicPath = window.location.origin;
        url = `${publicPath}/${imageUrl.replace(/^\/+/, "")}`;
      }
    }

    // fetch로 이미지 가져오기
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`이미지 로드 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // FileReader로 base64 변환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("❌ [imageUtils] 이미지 변환 실패:", error);
    throw new Error(`이미지를 base64로 변환하는 중 오류가 발생했습니다: ${error.message}`);
  }
};

