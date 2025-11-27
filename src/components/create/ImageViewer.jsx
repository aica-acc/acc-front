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

const TYPES_OPTIONS = [
  { value: "road_banner", label: "도로용 현수막" },
  { value: "bus_shelter", label: "버스정류장" },
  { value: "subway_light", label: "지하철 조명" },
  { value: "bus_road", label: "버스 도로" },
  { value: "streetlamp_banner", label: "가로등 현수막" },
  { value: "subway_inner", label: "지하철 내부" },
];

export default function ImageViewer({ url, onClick, selectedTypes = [], onTypesChange }) {
  const publicUrl = convertToPublicUrl(url);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClick = () => {
    if (onClick) onClick();
    setShowModal(true);
  };

  const handleTypeToggle = (type) => {
    if (!onTypesChange) return;
    
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    
    onTypesChange(newTypes);
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
          onClick={(e) => {
            // 드롭다운이나 모달 내부 클릭은 닫지 않음
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
            
            {/* Types 선택 드롭다운 */}
            <div className="mt-4 relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <span>홍보물 타입 선택</span>
                <span className="text-xs text-gray-500">
                  ({selectedTypes.length}개 선택됨)
                </span>
                <span className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] z-10">
                  {TYPES_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(option.value)}
                        onChange={() => handleTypeToggle(option.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
