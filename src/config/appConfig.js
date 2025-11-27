/**
 * 전역 앱 설정 파일
 * 각자 컴퓨터의 환경에 맞게 경로를 설정하세요.
 */

// ⚠️ 각자 컴퓨터의 public 폴더 절대 경로를 여기에 설정하세요
// 예시: "C:\\final_project\\ACC\\acc-frontend\\public"
// 또는: "C:/final_project/ACC/acc-frontend/public"
export const PUBLIC_FOLDER_PATH = "C:\\final_project\\ACC\\acc-frontend\\public";

/**
 * 상대 경로(data/...)를 전체 파일 시스템 경로로 변환
 * @param {string} relativePath - data/로 시작하는 상대 경로
 * @returns {string} 전체 파일 시스템 경로
 */
export const convertToFullPath = (relativePath) => {
  if (!relativePath) return "";
  
  // 이미 전체 경로인 경우 그대로 반환 (C:\ 또는 C:/로 시작)
  if (relativePath.startsWith("C:\\") || relativePath.startsWith("C:/")) {
    return relativePath;
  }
  
  // 상대 경로 정규화 (백슬래시를 슬래시로)
  let normalized = relativePath.replace(/\\/g, "/");
  
  // :/data/... 형태 처리 (C:가 빠진 경우)
  if (normalized.startsWith(":/data/")) {
    normalized = normalized.substring(1); // 앞의 : 제거
  }
  
  // /data/ 또는 data/로 시작하는지 확인
  if (normalized.startsWith("/data/") || normalized.startsWith("data/")) {
    // 앞의 / 제거
    normalized = normalized.replace(/^\/+/, "");
    
    // PUBLIC_FOLDER_PATH와 결합
    const publicPath = PUBLIC_FOLDER_PATH.replace(/\\/g, "/");
    return `${publicPath}/${normalized}`;
  }
  
  // data/로 시작하지 않으면 그대로 반환
  return relativePath;
};

