import React from "react";

const UnifiedLoadingPage = ({ 
  title = "로딩 중입니다...", 
  description = "잠시만 기다려 주세요."
}) => {
  return (
    <div className="min-h-screen bg-[#111118] text-white">
      <div className="w-full h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-200 mb-2">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoadingPage;
