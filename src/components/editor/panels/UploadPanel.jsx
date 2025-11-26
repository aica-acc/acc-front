// src/components/editor/panels/UploadPanel.jsx
import React, { useRef } from "react";
import { FabricImage } from "fabric";

const UploadPanel = ({ fabricRef }) => {
  const fileInputRef = useRef(null);

  // 이미지 파일 업로드 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const canvas = fabricRef?.current;
    if (!canvas) {
      alert("캔버스가 준비되지 않았습니다.");
      return;
    }

    // FileReader를 사용하여 이미지 파일 읽기
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      
      // Image 객체 생성
      const imgEl = new window.Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.src = imageUrl;

      imgEl.onload = () => {
        // FabricImage 객체 생성
        const fabricImg = new FabricImage(imgEl);
        
        // 캔버스 중앙에 배치
        const center = canvas.getCenter();
        
        // 이미지가 캔버스보다 크면 축소
        const maxWidth = canvas.width * 0.8;
        const maxHeight = canvas.height * 0.8;
        let scaleX = 1;
        let scaleY = 1;
        
        if (fabricImg.width > maxWidth) {
          scaleX = maxWidth / fabricImg.width;
        }
        if (fabricImg.height > maxHeight) {
          scaleY = maxHeight / fabricImg.height;
        }
        
        // 더 작은 비율 적용하여 비율 유지
        const scale = Math.min(scaleX, scaleY, 1);
        
        fabricImg.set({
          left: center.left,
          top: center.top,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
        });
        
        // 캔버스에 추가
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.requestRenderAll();
        
        console.log("✅ 이미지 업로드 완료:", file.name);
      };

      imgEl.onerror = () => {
        console.error("❌ 이미지 로드 실패:", file.name);
        alert("이미지 로드에 실패했습니다.");
      };
    };

    reader.onerror = () => {
      console.error("❌ 파일 읽기 실패:", file.name);
      alert("파일 읽기에 실패했습니다.");
    };

    reader.readAsDataURL(file);
    
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      {/* 헤더 */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white mb-1">이미지 업로드</h3>
        <p className="text-[11px] text-gray-400">이미지 파일을 선택하여 캔버스에 추가하세요</p>
      </div>

      {/* 파일 선택 버튼 */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
        />
        <label
          htmlFor="image-upload-input"
          className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-colors"
        >
          이미지 선택
        </label>
      </div>

      {/* 안내 문구 */}
      <div className="mt-auto pt-3 border-t border-gray-700">
        <p className="text-[11px] text-gray-400">
          💡 업로드된 이미지는 캔버스 중앙에 추가되며, 크기 조절과 회전이 가능합니다.
        </p>
      </div>
    </div>
  );
};

export default UploadPanel;
