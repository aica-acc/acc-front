import React from "react";

/**
 * 선택 상태 체크 아이콘 컴포넌트
 * @param {boolean} isSelected - 현재 선택되었는지 여부
 * @param {boolean} showEmptyCheck - 빈 체크 표시를 보여줄지 여부 (업로드된 이미지가 있지만 선택되지 않은 경우)
 * @param {string} position - 위치 ("top-right" | "inline")
 */
const SelectCheckIcon = ({ isSelected, showEmptyCheck = false, position = "top-right" }) => {
  const positionClass = position === "top-right" 
    ? "absolute top-4 right-4 z-10" 
    : "";

  if (isSelected) {
    return (
      <div className={positionClass}>
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <i className="bi bi-check text-white text-xl"></i>
        </div>
      </div>
    );
  }

  if (showEmptyCheck) {
    return (
      <div className={positionClass}>
        <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center bg-gray-700">
          <i className="bi bi-circle text-gray-400 text-sm"></i>
        </div>
      </div>
    );
  }

  return null;
};

export default SelectCheckIcon;

