// src/layout/MyPageLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const MyPageLayout = () => {
  return (
    <div className="min-h-screen bg-[#171717] text-white">
      {/* 상단 공통 헤더 */}
      <Header />

      {/* 헤더 높이만큼 위 여백 + 좌우 패딩 */}
      <main className="w-full px-8 pt-24 pb-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MyPageLayout;
