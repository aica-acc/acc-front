// src/components/editor/sidebar/SidePanelContainer.jsx
import React from "react";
import { LEFT_TABS } from "../leftTabs";

const SidePanelContainer = ({ activeTab, onClose, children }) => {
  const current = LEFT_TABS.find((t) => t.id === activeTab);

  return (
    <section className="relative w-80 bg-[#111111] text-gray-100 flex flex-col border-r border-black/80">
      {/* 닫기 화살표 (1번 ↔ 2번 전환) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute -right-3 top-24 w-6 h-12 bg-[#111111] border border-gray-700 rounded-r-full flex items-center justify-center text-xs hover:bg-gray-900"
      >
        {"<"}
      </button>

      {/* 탭 타이틀 헤더 */}
      <div className="h-10 border-b border-gray-800 flex items-center px-3 text-[12px] font-semibold">
        {current?.label || "Panel"}
      </div>

      {/* 실제 패널 내용 영역 */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </section>
  );
};

export default SidePanelContainer;
