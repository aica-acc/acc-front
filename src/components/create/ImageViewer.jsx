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
          w-[60vw] md:w-[38vw]
          aspect-[3/4]
          rounded-xl shadow-lg overflow-hidden cursor-pointer
          flex items-center justify-center
          bg-white relative
        "
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
          onClick={() => setShowModal(false)}
        >
          <img
            src={publicUrl}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-xl object-contain"
            alt="poster-full"
          />
        </div>
      )}
    </>
  );
}
