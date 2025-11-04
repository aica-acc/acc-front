import React from "react";
import { Route, Routes } from "react-router-dom";
import ProjectPage from "../pages/mypage/projectpage";

import DrivePage from "../pages/mypage/DrivePage";
import MyPageLayout from "../layout/MyPageLayout";
import MainPage from "../pages/MainPage";
import ProfilePage from "../pages/mypage/ProfilePage";


// ✅ 라우터 관리 컴포넌트
const Approuter = () => {
  return (
    <Routes>
      {/* 메인 페이지 */}
      <Route path="/" element={<MainPage />} />

      {/* 마이 페이지  그룹 */}
          <Route path="/mypage" element={<MyPageLayout />}>
              <Route path="project" element={<ProjectPage />} />
              <Route path="drive" element={<DrivePage />} />
              <Route path="profile" element={<ProfilePage />} />  
          </Route>   
    </Routes>
  );
};

export default Approuter;