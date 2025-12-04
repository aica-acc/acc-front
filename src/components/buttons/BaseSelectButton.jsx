import React from "react";

/**
 * 이미지 선택하기 버튼 컴포넌트
 * @param {boolean} isSelected - 현재 이미지가 선택되었는지 여부
 * @param {boolean} hasUploadedImage - 업로드된 이미지가 있고 선택되지 않은 경우
 * @param {function} onSelect - 선택하기 버튼 클릭 핸들러
 */
const BaseSelectButton = ({ isSelected, hasUploadedImage, onSelect }) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-3">
      {isSelected ? (
        // 현재 페이지가 선택된 경우: 초록색 체크만
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
          <i className="bi bi-check text-white text-xl"></i>
        </div>
      ) : hasUploadedImage ? (
        // 업로드된 이미지가 있지만 현재 페이지가 선택되지 않은 경우: 회색 체크만
        <div className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center bg-gray-700">
          <i className="bi bi-circle text-gray-400 text-sm"></i>
        </div>
      ) : (
        // 업로드도 없고 선택도 안된 경우: 선택하기 버튼
        <button
          onClick={onSelect}
          className="px-6 py-2 rounded-lg text-white font-semibold shadow-lg transition-all bg-blue-500 hover:bg-blue-600"
        >
          선택하기
        </button>
      )}
    </div>
  );
};

export default BaseSelectButton;

