// src/components/editor/toolbar/ActionButtons.jsx
import React, { useState } from "react";

const ActionButtons = ({ 
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDuplicate, 
  onDelete, 
  hasSelection = false 
}) => {
  const [showPositionMenu, setShowPositionMenu] = useState(false);

  return (
    <div className="flex items-center gap-1">
      {/* Position 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => setShowPositionMenu(!showPositionMenu)}
          disabled={!hasSelection}
          className={`flex items-center gap-1 px-2 h-7 rounded transition-colors ${
            hasSelection ? "text-white hover:bg-gray-800" : "text-gray-600 cursor-not-allowed"
          }`}
          title="Position"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="text-xs font-medium">Position</span>
        </button>

        {/* Position 서브메뉴 */}
        {showPositionMenu && hasSelection && (
          <div className="absolute top-full mt-1 right-0 bg-[#1f2937] border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[140px] z-30">
            <button
              onClick={() => {
                onBringToFront();
                setShowPositionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700 text-white flex items-center gap-2"
            >
              <span>⬆️</span> 맨 앞으로
            </button>
            <button
              onClick={() => {
                onBringForward();
                setShowPositionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700 text-white flex items-center gap-2 border-t border-gray-700"
            >
              <span>↑</span> 앞으로
            </button>
            <button
              onClick={() => {
                onSendBackward();
                setShowPositionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700 text-white flex items-center gap-2 border-t border-gray-700"
            >
              <span>↓</span> 뒤로
            </button>
            <button
              onClick={() => {
                onSendToBack();
                setShowPositionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-700 text-white flex items-center gap-2 border-t border-gray-700"
            >
              <span>⬇️</span> 맨 뒤로
            </button>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="w-px h-5 bg-gray-700 mx-1"></div>

      {/* 잠금 버튼 (UI만) */}
      <button
        disabled={!hasSelection}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
          hasSelection ? "text-white hover:bg-gray-800" : "text-gray-600 cursor-not-allowed"
        }`}
        title="잠금"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>

      {/* 복제 버튼 */}
      <button
        onClick={onDuplicate}
        disabled={!hasSelection}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
          hasSelection ? "text-white hover:bg-gray-800" : "text-gray-600 cursor-not-allowed"
        }`}
        title="복제"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      {/* 삭제 버튼 */}
      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
          hasSelection ? "text-white hover:bg-red-600" : "text-gray-600 cursor-not-allowed"
        }`}
        title="삭제"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default ActionButtons;

