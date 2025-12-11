// src/utils/editor/canvasLoader.js
// 캔버스에 작업물을 로딩하는 유틸 함수

import { Textbox, FabricImage, Shadow } from "fabric";

/**
 * 절대 경로를 public 기준 상대 경로로 변환
 * 예: C:/final_project/ACC/acc-frontend/public/data/promotion/M000/thumbnail.png
 *  → /data/promotion/M000/thumbnail.png
 * @param {string} path - 절대 경로 또는 상대 경로
 * @returns {string} public 기준 상대 경로
 */
export function convertToPublicPath(path) {
  if (!path) return path;
  
  // Windows 경로를 정규화 (백슬래시를 슬래시로)
  let normalized = path.replace(/\\/g, "/");
  
  // /public/data/ 패턴 찾기
  const publicDataIdx = normalized.indexOf("/public/data/");
  if (publicDataIdx !== -1) {
    // /public/data/ 이후 부분만 추출하고 /data/로 시작하도록 변환
    return normalized.substring(publicDataIdx + 7); // "/public" 제거
  }
  
  // 이미 /data/로 시작하는 경우 그대로 반환
  if (normalized.startsWith("/data/")) {
    return normalized;
  }
  
  // /data/ 패턴이 있으면 그 이후부터 반환
  const dataIdx = normalized.indexOf("/data/");
  if (dataIdx !== -1) {
    return normalized.substring(dataIdx);
  }
  
  // 변환할 수 없으면 원본 반환
  return normalized;
}

/**
 * video 요소를 생성하는 함수 (Fabric.js 공식 방식)
 * @param {string} videoUrl - 비디오 URL
 * @param {number} width - 원하는 너비
 * @param {number} height - 원하는 높이
 * @returns {Promise<HTMLVideoElement>} video 요소
 */
async function createVideoElement(videoUrl, width, height) {
  return new Promise((resolve, reject) => {
    // 절대 경로를 public 기준 상대 경로로 변환
    const convertedUrl = convertToPublicPath(videoUrl);
    
    const videoElement = document.createElement("video");
    const source = document.createElement("source");
    
    videoElement.width = width || 400;
    videoElement.height = height || 300;
    videoElement.muted = true; // 자동 재생을 위해 음소거
    videoElement.loop = true; // 반복 재생
    videoElement.crossOrigin = "anonymous";
    videoElement.preload = "auto";
    
    source.src = convertedUrl;
    videoElement.appendChild(source);
    
    videoElement.onloadedmetadata = () => {
      // 실제 비디오 크기로 업데이트
      if (videoElement.videoWidth && videoElement.videoHeight) {
        videoElement.width = videoElement.videoWidth;
        videoElement.height = videoElement.videoHeight;
      }
      resolve(videoElement);
    };
    
    videoElement.onerror = () => {
      reject(new Error(`비디오 로드 실패: ${videoUrl}`));
    };
  });
}

/**
 * image 객체를 실제 FabricImage로 생성하는 함수
 * @param {Object} canvas - Fabric Canvas 인스턴스
 * @param {Object} objData - 이미지 객체 데이터
 * @returns {Promise<FabricImage>} 생성된 FabricImage 객체
 */
async function createImageObject(canvas, objData) {
  let mediaEl;
  
  // url 필드를 우선 사용, 없으면 videoUrl 또는 src 사용 (하위 호환성)
  let url = objData.url || objData.videoUrl || objData.src;
  
  // 절대 경로를 public 기준 상대 경로로 변환
  if (url) {
    url = convertToPublicPath(url);
  }
  
  const isVideo = objData.type === 'video' || objData.videoUrl;
  
  // video 타입이면 video 요소 생성 (Fabric.js 공식 방식)
  if (isVideo) {
    mediaEl = await createVideoElement(
      url,
      objData.width,
      objData.height
    );
  } else {
    // 일반 이미지
    mediaEl = await new Promise((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`이미지 로드 실패: ${url}`));
      image.src = url;
    });
  }
  
  const fabricImg = new FabricImage(mediaEl);
  
  // 저장된 데이터에 위치와 크기 정보가 있으면 그대로 사용
  // 없으면 기본 크기 조정 로직 적용
  let left, top, scaleX, scaleY, originX, originY;
  
  if (objData.left !== undefined && objData.top !== undefined) {
    // 저장된 위치 정보 사용
    left = objData.left;
    top = objData.top;
    originX = objData.originX ?? "left";
    originY = objData.originY ?? "top";
    
    // 저장된 scale 정보가 있으면 그대로 사용, 없으면 기본 크기 조정
    if (objData.scaleX !== undefined && objData.scaleY !== undefined) {
      scaleX = objData.scaleX;
      scaleY = objData.scaleY;
    } else {
      // 저장된 scale이 없으면 기본 크기 조정
      let scale = 1;
      if (isVideo) {
        // 비디오: canvas 전체 크기에 맞춤 (비율 유지)
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const videoWidth = fabricImg.width;
        const videoHeight = fabricImg.height;
        
        const scaleXCalc = canvasWidth / videoWidth;
        const scaleYCalc = canvasHeight / videoHeight;
        scale = Math.min(scaleXCalc, scaleYCalc);
      } else {
        // 이미지: canvas의 80% 크기로 조정
        const maxWidth = canvas.width * 0.8;
        const maxHeight = canvas.height * 0.8;
        let scaleXCalc = 1;
        let scaleYCalc = 1;
        
        if (fabricImg.width > maxWidth) {
          scaleXCalc = maxWidth / fabricImg.width;
        }
        if (fabricImg.height > maxHeight) {
          scaleYCalc = maxHeight / fabricImg.height;
        }
        scale = Math.min(scaleXCalc, scaleYCalc, 1);
      }
      scaleX = scale;
      scaleY = scale;
    }
  } else {
    // 저장된 위치 정보가 없으면 canvas 정중앙에 배치
    const center = canvas.getCenter();
    left = center.left;
    top = center.top;
    originX = "center";
    originY = "center";
    
    // 기본 크기 조정
    let scale = 1;
    if (isVideo) {
      // 비디오: canvas 전체 크기에 맞춤 (비율 유지)
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const videoWidth = fabricImg.width;
      const videoHeight = fabricImg.height;
      
      const scaleXCalc = canvasWidth / videoWidth;
      const scaleYCalc = canvasHeight / videoHeight;
      scale = Math.min(scaleXCalc, scaleYCalc);
    } else {
      // 이미지: canvas의 80% 크기로 조정
      const maxWidth = canvas.width * 0.8;
      const maxHeight = canvas.height * 0.8;
      let scaleXCalc = 1;
      let scaleYCalc = 1;
      
      if (fabricImg.width > maxWidth) {
        scaleXCalc = maxWidth / fabricImg.width;
      }
      if (fabricImg.height > maxHeight) {
        scaleYCalc = maxHeight / fabricImg.height;
      }
      scale = Math.min(scaleXCalc, scaleYCalc, 1);
    }
    scaleX = scale;
    scaleY = scale;
  }
  
  // 객체 속성 적용
  const fabricOptions = {
    left: left,
    top: top,
    scaleX: scaleX,
    scaleY: scaleY,
    angle: objData.angle ?? 0,
    flipX: objData.flipX ?? false,
    flipY: objData.flipY ?? false,
    opacity: objData.opacity ?? 1,
    originX: originX,
    originY: originY,
  };
  
  // video 타입이면 objectCaching: false 설정 (동영상은 계속 업데이트되므로)
  if (isVideo) {
    fabricOptions.objectCaching = false;
    fabricOptions.videoUrl = url;
    fabricOptions.mediaType = 'video';
  }
  
  fabricImg.set(fabricOptions);
  
  // video 요소인 경우 재생 시작
  if (isVideo && mediaEl.tagName === 'VIDEO') {
    mediaEl.play().catch(err => {
      console.warn("비디오 자동 재생 실패:", err);
    });
  }
  
  return fabricImg;
}

/**
 * 이미지 URL을 프록시 경로로 변환 (CORS 해결 및 절대 경로 변환)
 * @param {string} url - 원본 이미지 URL
 * @returns {string} 프록시 경로로 변환된 URL
 */
function convertToProxyUrl(url) {
  if (!url) return url;
  
  // 절대 경로인 경우 public 기준 상대 경로로 변환
  if (url.includes("C:\\") || url.includes("C:/") || url.includes("/public/")) {
    return convertToPublicPath(url);
  }
  
  // http://127.0.0.1:5000/static/... 형태를 /static/... 로 변환
  if (url.includes('http://127.0.0.1:5000/static')) {
    return url.replace('http://127.0.0.1:5000', '');
  }
  
  // http://localhost:5000/static/... 형태도 처리
  if (url.includes('http://localhost:5000/static')) {
    return url.replace('http://localhost:5000', '');
  }
  
  return url;
}

/**
 * 배경 이미지를 캔버스에 적용하는 헬퍼 함수
 * @param {Object} canvas - Fabric Canvas 인스턴스
 * @param {string} bgUrl - 배경 이미지 URL
 * @returns {Promise} 배경 이미지 적용 완료 Promise
 */
export function applyBackgroundImage(canvas, bgUrl) {
  return new Promise((resolve) => {
    if (!bgUrl) {
      resolve();
      return;
    }

    // 프록시 URL로 변환
    const proxyUrl = convertToProxyUrl(bgUrl);
    console.log("🖼️ 이미지 로드:", { 원본: bgUrl, 프록시: proxyUrl });

    const imgEl = new window.Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.src = proxyUrl;

    imgEl.onload = () => {
      const bg = new FabricImage(imgEl);
      
      // 캔버스 크기에 맞게 배경 이미지 스케일 조정
      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 450;
      
      const scaleX = canvasWidth / bg.width;
      const scaleY = canvasHeight / bg.height;
      const scale = Math.max(scaleX, scaleY); // 꽉 차게 (cover)
      
      bg.set({
        originX: "left",
        originY: "top",
        scaleX: scale,
        scaleY: scale,
      });
      
      // 중앙 정렬
      const center = canvas.getCenter();
      bg.set({
        left: center.left - (bg.width * scale) / 2,
        top: center.top - (bg.height * scale) / 2,
      });

      // Fabric v6 방식: canvas.backgroundImage에 직접 할당
      canvas.backgroundImage = bg;
      canvas.renderAll();
      resolve();
    };

    imgEl.onerror = () => {
      console.error("배경 이미지 로드 실패:", bgUrl);
      resolve(); // 실패해도 계속 진행
    };
  });
}

/**
 * 템플릿 JSON의 객체 배열을 캔버스에 추가하는 함수
 * @param {Object} canvas - Fabric Canvas 인스턴스
 * @param {Array} objects - 텍스트 객체 배열
 */
export function addTextObjectsFromTemplate(canvas, objects) {
  console.log("📝 텍스트 객체 추가 시작:", objects);
  
  if (!objects || objects.length === 0) {
    console.warn("⚠️ 추가할 객체가 없습니다.");
    return;
  }

  objects.forEach((obj) => {
    console.log("  - 객체 처리 중:", obj.type, obj.text);
    
    if (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text") {
      try {
        // 🔥 [자동 보정] 폰트 크기가 너무 크면 강제로 줄임 (줌 했을 때 비율 맞추기 위함)
        let safeFontSize = obj.fontSize ?? 24;
        if (safeFontSize > 300) {
            console.warn(`⚠️ 폰트 너무 큼 (${safeFontSize}), 강제 축소 -> 150`);
            safeFontSize = 150;
        }

        // Fabric.js v6: Textbox 클래스 사용
        const t = new Textbox(obj.text || "", {
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          fontSize: safeFontSize,
          fontFamily: obj.fontFamily ?? "Arial",
          fill: obj.fill ?? "#000000",
          width: obj.width ?? 300, // textbox는 width 필수
          height: obj.height ?? undefined, // height는 선택적 (자동 계산되지만 명시 가능)
          textAlign: obj.textAlign || "left",
          fontWeight: obj.fontWeight || "normal",
          fontStyle: obj.fontStyle || "normal",
          underline: !!obj.underline,
          linethrough: !!obj.linethrough,
          originX: obj.originX ?? "left",
          originY: obj.originY ?? "top",
          scaleX: obj.scaleX ?? 1,
          scaleY: obj.scaleY ?? 1,
          angle: obj.angle ?? 0,
          flipX: !!obj.flipX,
          flipY: !!obj.flipY,
          skewX: obj.skewX ?? 0,
          skewY: obj.skewY ?? 0,
          lineHeight: obj.lineHeight ?? 1.16,
          charSpacing: obj.charSpacing ?? 0,
          stroke: obj.stroke ?? null,
          strokeWidth: obj.strokeWidth ?? 0,
          opacity: obj.opacity ?? 1,
          textBackgroundColor: obj.textBackgroundColor || "",
        });

        // Shadow 설정 (객체이거나 null일 수 있음)
        if (obj.shadow) {
          if (typeof obj.shadow === 'object' && obj.shadow.color) {
            // Fabric.js Shadow 객체 생성
            t.shadow = new Shadow({
              color: obj.shadow.color,
              blur: obj.shadow.blur ?? 0,
              offsetX: obj.shadow.offsetX ?? 0,
              offsetY: obj.shadow.offsetY ?? 0,
              affectStroke: obj.shadow.affectStroke ?? false,
              nonScaling: obj.shadow.nonScaling ?? false,
            });
          } else {
            t.shadow = obj.shadow;
          }
        } else {
          t.shadow = null;
        }
        
        canvas.add(t);
        console.log("  ✅ 텍스트 객체 생성 성공:", t.text);
      } catch (error) {
        console.error("  ❌ 텍스트 객체 생성 실패:", error);
      }
    } else {
      console.log("  ⚠️ 텍스트 타입 아님:", obj.type);
    }
  });
  
  // 렌더링 요청
  canvas.requestRenderAll();
}

/**
 * 선택된 작업물 정보를 받아서 캔버스를 세팅하는 함수
 * @param {Object} canvas - Fabric Canvas 인스턴스
 * @param {Object} design - 작업물 정보 객체
 * @param {Function} saveHistory - 히스토리 저장 함수
 * @returns {Promise} 로딩 완료 Promise
 */
export async function loadDesignToCanvas(canvas, design, _saveHistory, isLoadingRef) {
  // 🔥 saveHistory는 사용하지 않음 (로딩 중에는 저장하지 않음)
  if (!canvas || !design) return Promise.resolve();

  // 🔥 1) 로딩 시작: canvas.clear() 전에 isLoadingRef 설정
  if (isLoadingRef) {
    isLoadingRef.current = true;
    console.log("🔒 [loadDesignToCanvas] 로딩 시작 - 모든 저장 차단");
  }

  // 🔥 canvasJson만 사용 (유일한 소스)
  // fallback 제거: canvasJson이 없으면 로드하지 않음
  const sourceJson = design.canvasJson;

  if (!sourceJson) {
    console.error("❌ [loadDesignToCanvas] canvasJson이 없습니다. 저장된 데이터가 없습니다:", {
      designId: design.id,
      designTitle: design.title,
      hasCanvasJson: !!design.canvasJson,
      hasCanvasData: !!design.canvasData,
      hasOriginalCanvasJson: !!design.originalCanvasJson,
    });
    // 🔥 canvasJson이 없으면 빈 캔버스만 표시
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    if (isLoadingRef) {
      isLoadingRef.current = false;
    }
    return Promise.resolve();
  }

  // 배경 이미지는 backgroundImageUrl 우선, 없으면 thumbnailUrl 사용
  const bgUrl = design.backgroundImageUrl || design.thumbnailUrl;

  console.log("🎨 작업물 로딩 시작:", design.title, `(ID: ${design.id})`);
  console.log("📋 로드할 데이터 상세:", {
    source: 'canvasJson (유일한 소스)',
    jsonVersion: sourceJson?.version || "없음",
    width: sourceJson?.width,
    height: sourceJson?.height,
    objectsCount: sourceJson?.objects?.length || 0,
    배경URL: bgUrl
  });

  // 🔥 첫 번째 textbox 위치 로그 (디버깅용)
  const firstText = sourceJson.objects?.find(o => o.type === "textbox" || o.type === "i-text");
  console.log("[LOAD] sourceJson first textbox:", {
    left: firstText?.left,
    top: firstText?.top,
    text: firstText?.text,
    type: firstText?.type,
  });

  // 🔥 2) 기본 초기화 (isLoadingRef 설정 후)
  canvas.clear();
  canvas.backgroundImage = undefined;
  canvas.backgroundColor = "#ffffff";
  // 🔥 [추가] 로딩 시작 시 뷰포트 초기화 (좌표 꼬임 방지)
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

  // 🔥 캔버스 크기: JSON에 width/height가 있으면 그 값을 우선 사용
  //   - 초기 템플릿(mock-api-data)의 canvasData.width/height
  //   - 또는 snapshotCurrentDesign에서 저장한 sourceJson.width/sourceJson.height
  //   - canvasData가 없을 때는 기본값(800x450) 사용 (이전 디자인 크기 영향 방지)
  const baseWidth =
    (sourceJson && sourceJson.width) || design.canvasWidth || 800;
  const baseHeight =
    (sourceJson && sourceJson.height) || design.canvasHeight || 450;

  canvas.setDimensions({ width: baseWidth, height: baseHeight });

  // 렌더링 보장 헬퍼
  // 🔥 loadDesignToCanvas 중에는 saveHistory를 호출하지 않음 (저장은 사용자 액션에서만)
  const ensureRendering = () => {
    canvas.renderAll();
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        canvas.renderAll();
        setTimeout(() => {
          // 🔥 loadDesignToCanvas 중에는 saveHistory를 호출하지 않음
          // 저장은 사용자 액션(drag, text change 등)에서만 발생해야 함
          resolve();
        }, 100);
      });
    });
  };

  // 1) JSON 데이터가 있는 경우 (저장된 데이터 or 초기 생성 데이터)
  // 🔥 sourceJson 사용 (canvasJson 우선)
  if (sourceJson) {
    // version이 있으면 Fabric.js가 생성한 JSON으로 간주하고 로드
    if (sourceJson.version) {
      try {
        console.log("📂 저장된 데이터 로드 (canvasJson 우선 사용)");
        
        // 🔥 loadFromJSON 전에 JSON 데이터 정리 (근본 원인 해결)
        const jsonToLoad = { ...sourceJson };
        
        // 1) backgroundImage 제거 (나중에 FabricImage로 재설정)
        if (jsonToLoad.backgroundImage) {
          console.log("⚠️ JSON의 backgroundImage 제거 (나중에 FabricImage로 재설정)");
          delete jsonToLoad.backgroundImage;
        }
        
        // 2) objects 배열에서 유효하지 않은 객체 제거 및 image/video 객체 분리
        const imageVideoObjects = []; // image/video 객체는 별도로 저장
        if (jsonToLoad.objects && Array.isArray(jsonToLoad.objects)) {
          const originalCount = jsonToLoad.objects.length;
          
          // 🔥 빈 객체 {}, type이 없는 객체, 유효하지 않은 객체 제거
          // image/video 객체는 loadFromJSON에서 제외하고 별도로 처리
          jsonToLoad.objects = jsonToLoad.objects.filter((obj, index) => {
            // null/undefined 체크
            if (!obj || typeof obj !== 'object') {
              console.warn(`⚠️ JSON 객체 ${index}: null/undefined 제거`);
              return false;
            }
            
            // 빈 객체 체크
            if (Object.keys(obj).length === 0) {
              console.warn(`⚠️ JSON 객체 ${index}: 빈 객체 {} 제거`);
              return false;
            }
            
            // type이 없는 객체 체크 (Fabric 객체는 type이 있어야 함)
            if (!obj.type) {
              console.warn(`⚠️ JSON 객체 ${index}: type이 없음, 제거`, obj);
              return false;
            }
            
            // 🔥 image/video 객체는 loadFromJSON에서 제외하고 별도로 처리
            const hasUrl = obj.url || obj.videoUrl || obj.src;
            if ((obj.type === 'image' || obj.type === 'video') && hasUrl) {
              imageVideoObjects.push(obj);
              return false; // loadFromJSON에서 제외
            }
            
            // 🔥 중첩 객체 정리 (shadow, clipPath 등)
            if (obj.shadow && typeof obj.shadow === 'object') {
              // shadow는 객체이지만 toObject가 없을 수 있음 - JSON에서는 괜찮지만 로드 시 문제될 수 있음
              if (obj.shadow.color === undefined && obj.shadow.blur === undefined) {
                console.warn(`⚠️ JSON 객체 ${index}: 유효하지 않은 shadow 제거`);
                delete obj.shadow;
              }
            }
            
            if (obj.clipPath && typeof obj.clipPath === 'object' && !obj.clipPath.type) {
              console.warn(`⚠️ JSON 객체 ${index}: 유효하지 않은 clipPath 제거`);
              delete obj.clipPath;
            }
            
            if (obj.pattern && typeof obj.pattern === 'object' && !obj.pattern.type) {
              console.warn(`⚠️ JSON 객체 ${index}: 유효하지 않은 pattern 제거`);
              delete obj.pattern;
            }
            
            return true;
          });
          
          if (originalCount !== jsonToLoad.objects.length) {
            console.warn(`⚠️ JSON objects 정리: ${originalCount}개 → ${jsonToLoad.objects.length}개 (image/video ${imageVideoObjects.length}개 별도 처리)`);
          }
        }
        
        // 🔥 loadFromJSON 전에 캔버스 정리 (isLoadingRef는 이미 true로 설정됨)
        canvas.clear();
        canvas.backgroundImage = undefined;
        
        // 🔥 loadFromJSON은 Promise를 반환하므로 await로 기다림
        await canvas.loadFromJSON(jsonToLoad, async () => {
          console.log("✅ loadFromJSON 콜백 실행");
          
          // 🔥 loadFromJSON 콜백 내부에서 객체 검증 및 정리
          // (이 시점에 객체들이 로드됨)
          const objects = canvas.getObjects();
          const invalidObjects = [];
          
          objects.forEach((obj, index) => {
            // null/undefined 체크
            if (!obj) {
              invalidObjects.push({ obj, index, reason: 'null/undefined' });
              return;
            }
            
            // 🔥 toObject 메서드 체크 - 가장 중요!
            if (typeof obj.toObject !== 'function') {
              console.error(`❌ 객체 ${index}가 Fabric 객체가 아님:`, {
                type: obj.type,
                constructor: obj.constructor?.name,
                keys: Object.keys(obj).slice(0, 5)
              });
              invalidObjects.push({ obj, index, reason: 'toObject is not a function', type: obj.type });
              return;
            }
            
            // 🔥 중첩 객체 속성 검증 및 정리 (모든 중첩 객체 제거)
            if (obj.shadow && typeof obj.shadow.toObject !== 'function') {
              console.warn(`⚠️ 객체 ${index}의 shadow가 유효하지 않음 (일반 Object), 제거`);
              obj.shadow = null;
            }
            if (obj.clipPath && typeof obj.clipPath.toObject !== 'function') {
              console.warn(`⚠️ 객체 ${index}의 clipPath가 유효하지 않음, 제거`);
              obj.clipPath = null;
            }
            if (obj.pattern && typeof obj.pattern.toObject !== 'function') {
              console.warn(`⚠️ 객체 ${index}의 pattern이 유효하지 않음, 제거`);
              obj.pattern = null;
            }
            
            // 🔥 각 객체의 toObject()를 실제로 호출해서 테스트
            try {
              obj.toObject();
            } catch (e) {
              console.error(`❌ 객체 ${index}의 toObject() 호출 실패:`, e);
              invalidObjects.push({ obj, index, reason: `toObject() 호출 실패: ${e.message}` });
            }
          });
          
          // 🔥 image/video 객체를 실제 FabricImage로 생성 (loadFromJSON에서 제외했으므로 여기서 추가)
          for (const objData of imageVideoObjects) {
            try {
              const fabricImg = await createImageObject(canvas, objData);
              canvas.add(fabricImg);
              const url = objData.url || objData.videoUrl || objData.src;
              console.log("✅ 이미지 객체 생성 완료:", url);
            } catch (error) {
              console.error("❌ 이미지 객체 생성 실패:", error);
            }
          }
          
          // 유효하지 않은 객체 제거
          if (invalidObjects.length > 0) {
            console.error("❌ 유효하지 않은 객체 발견, 제거 중:", invalidObjects.length, "개");
            invalidObjects.forEach(({ obj, index, reason }) => {
              console.error(`  - 인덱스 ${index}: ${reason}`, obj);
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
            });
            canvas.renderAll();
          }
          
          // 🔥 2단계: 배경 이미지 검증 및 제거 (나중에 applyBackgroundImage로 재설정)
          if (canvas.backgroundImage) {
            if (typeof canvas.backgroundImage.toObject !== 'function') {
              console.warn("⚠️ loadFromJSON 콜백에서 backgroundImage 유효성 검사 실패, 제거");
              canvas.backgroundImage = undefined;
            } else {
              // 유효하더라도 나중에 applyBackgroundImage로 재설정할 것이므로 제거
              console.log("⚠️ backgroundImage 제거 (나중에 applyBackgroundImage로 재설정)");
              canvas.backgroundImage = undefined;
            }
          }
        });
        
        // 🔥 loadFromJSON Promise가 완료된 후 (콜백 실행 완료 후)
        console.log("✅ loadFromJSON Promise 완료");
        
        // 🔥 loadFromJSON 후에 배경 이미지가 유효한 FabricImage인지 확인
        // 유효하지 않으면 제거하고 새로 로드
        if (canvas.backgroundImage) {
          if (typeof canvas.backgroundImage.toObject !== 'function') {
            console.warn("⚠️ loadFromJSON으로 로드된 backgroundImage가 유효하지 않음, 제거 후 재설정");
            canvas.backgroundImage = undefined;
          } else {
            console.log("✅ loadFromJSON으로 로드된 backgroundImage 유효함");
          }
        }
        
        // 🔥 배경 이미지는 반드시 applyBackgroundImage로 FabricImage 인스턴스로 설정
        await applyBackgroundImage(canvas, bgUrl);
        
        // 🔥 3) 렌더링 완료 후 isLoadingRef 해제
        await ensureRendering();
        
        // 🔥 loadFromJSON 콜백과 renderAll이 완전히 완료된 후에만 isLoadingRef 해제
        if (isLoadingRef) {
          isLoadingRef.current = false;
          console.log("🔓 [loadDesignToCanvas] 로딩 완료 - 저장 가능");
        }
        
        return;
      } catch (error) {
        console.error("❌ JSON 로드 실패:", error);
        // 에러 발생 시 초기 데이터로 객체 생성 방식으로 폴백
        console.log("📂 폴백: 초기 데이터로 객체 생성");
        if (sourceJson.objects) {
          const { backgroundColor, objects } = sourceJson;
          if (backgroundColor) canvas.backgroundColor = backgroundColor;
          await applyBackgroundImage(canvas, bgUrl);
          addTextObjectsFromTemplate(canvas, objects);
          await ensureRendering();
          
          // 🔥 폴백 경로에서도 isLoadingRef 해제
          if (isLoadingRef) {
            isLoadingRef.current = false;
            console.log("🔓 [loadDesignToCanvas] 폴백 로딩 완료 - 저장 가능");
          }
          return;
        }
      }
    } 
    // version이 없으면 단순 객체 배열(MOCK 데이터)로 간주
    else if (sourceJson.objects) {
      console.log("📂 초기 데이터로 객체 생성");
      const { backgroundColor, objects } = sourceJson;
      
      // 위에서 이미 width/height는 세팅함
      if (backgroundColor) canvas.backgroundColor = backgroundColor;
      
      await applyBackgroundImage(canvas, bgUrl);
      
      // textbox와 image/video 객체 분리
      const textObjects = [];
      const imageObjects = [];
      
      objects.forEach(obj => {
        if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
          textObjects.push(obj);
        } else if (obj.type === 'image' || obj.type === 'video') {
          imageObjects.push(obj);
        }
      });
      
      // textbox 객체 추가
      addTextObjectsFromTemplate(canvas, textObjects);
      
      // image/video 객체를 실제 FabricImage로 생성
      for (const objData of imageObjects) {
        try {
          const fabricImg = await createImageObject(canvas, objData);
          canvas.add(fabricImg);
          const url = objData.url || objData.src || objData.videoUrl;
          console.log("✅ 이미지 객체 생성 완료:", url);
        } catch (error) {
          console.error("❌ 이미지 객체 생성 실패:", error);
        }
      }
      
      await ensureRendering();
      
      // 🔥 초기 데이터 로드 완료 후 isLoadingRef 해제
      if (isLoadingRef) {
        isLoadingRef.current = false;
        console.log("🔓 [loadDesignToCanvas] 초기 데이터 로딩 완료 - 저장 가능");
      }
      return;
    }
  }

  // 2) JSON이 없는 경우 (완전 초기 상태)
  console.log("📂 빈 캔버스 (배경만)");
  await applyBackgroundImage(canvas, bgUrl);
  await ensureRendering();
  
  // 🔥 빈 캔버스 로드 완료 후 isLoadingRef 해제
  if (isLoadingRef) {
    isLoadingRef.current = false;
    console.log("🔓 [loadDesignToCanvas] 빈 캔버스 로딩 완료 - 저장 가능");
  }
}
