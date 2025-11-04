import React from "react";
import { Outlet } from "react-router-dom";

const MyPageLayout = () => {
  return (
    <div className="flex min-h-screen">

      {/* ✅ 이 부분이 “하위 페이지가 표시될 자리” */}
      <main className="flex-1 p-6 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default MyPageLayout;
