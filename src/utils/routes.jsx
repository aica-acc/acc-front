import React from "react";
import { Route, Routes } from "react-router-dom";
import ProjectPage from "../pages/mypage/projectpage";

import DrivePage from "../pages/mypage/DrivePage";
import MyPageLayout from "../layout/MyPageLayout";
import MainPage from "../pages/MainPage";
import ProfilePage from "../pages/mypage/ProfilePage";
import SelectPromoitonPage from "../pages/SelectPromoitonPage";
import ProposalUploadPage from "../pages/ProposalUploadPage";
import AnalyzeProposalPage from "../pages/AnalyzeProposalPage";
import MainLayout from "../layout/MainLayout";


// ✅ 라우터 관리 컴포넌트
const Approuter = () => {
  return (
    <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<MainPage />} />
        <Route element={<MainLayout />}>
          {/* 홍보물 선택 페이지 */}
          <Route path="/select" element={<SelectPromoitonPage />} />    
          {/* 기획서 업로드 페이지 */}
          <Route path="/upload" element={<ProposalUploadPage />} />
          {/* 기획서 분석 결과 페이지 */}
          <Route path="/analyze" element={<AnalyzeProposalPage />} />        
        </Route>
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