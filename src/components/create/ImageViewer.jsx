import React, { useState } from "react";
import SkeletonImage from "../loding/SkeletonLoading";

/**
 * 로컬 환경에선 public에 있는 이미지만 import 없이 사용할 수 있어서 
 * db 경로를 public 하위 기준 URL로 변환하는 유틸 함수
 */
const convertToPublicUrl = (path) => {
  if (!path) return "";
  let normalized = path.replace(/\\/g, "/"); // \ → /
  const idx = normalized.indexOf("/data/");
  if (idx !== -1) return normalized.substring(idx);
  return normalized;
};

// 파생물 선택은 상세 화면 오른쪽 DerivativePicker 가 맡는다. 이 컴포넌트는 이미지 표시와 확대만 한다
export default function ImageViewer({ url, onClick }) {
  const publicUrl = convertToPublicUrl(url);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
    setShowModal(true);
  };


  return (
    <>
      {/* ★ 카드 영역  */}
      <div
        className="
          w-full max-w-full h-full max-h-full
          rounded-xl shadow-lg overflow-hidden cursor-pointer
          flex items-center justify-center
          bg-gray-800 relative
        "
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        onClick={handleClick}
      >
        {/* 🔥 스켈레톤 로딩 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <SkeletonImage />
          </div>
        )}

        {/* 🔥 실제 이미지 */}
        <img
          src={publicUrl}
          alt="poster"
          onLoad={() => setLoading(false)}
          className={`
            max-w-full max-h-full object-contain transition-opacity duration-300
            ${loading ? "opacity-0" : "opacity-100"}
          `}
        />
      </div>

      {/* ★ 확대 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-[2000]"
          onClick={(e) => {
            // 배경을 클릭하면 닫는다
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center">
            <img
              src={publicUrl}
              className="max-h-[85vh] max-w-[85vw] rounded-xl shadow-xl object-contain"
              alt="poster-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
