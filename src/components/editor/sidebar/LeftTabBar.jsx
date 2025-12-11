// src/components/editor/sidebar/LeftTabBar.jsx
import React from "react";
import { LEFT_TABS } from "../leftTabs";

const LeftTabBar = ({ activeTab, onTabClick }) => {
  return (
    <nav className="w-16 bg-[#050505] text-gray-200 flex flex-col justify-between border-r border-black">
      <div className="pt-3 space-y-1">
        {LEFT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              className={`w-full flex flex-col items-center gap-1 py-2 text-[10px] hover:bg-gray-800/80 ${
                isActive ? "bg-gray-800 border-l-2 border-blue-500" : ""
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pb-3 flex flex-col items-center gap-2 text-[10px]">
        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
          <span>👤</span>
        </button>
      </div>
    </nav>
  );
};

export default LeftTabBar;
