import React from "react";
import { Route, Routes } from "react-router-dom";
import ProjectPage from "../pages/mypage/projectpage";

import DrivePage from "../pages/mypage/DrivePage";
import MyPageLayout from "../layout/MyPageLayout";
import MainPage from "../pages/MainPage";
import ProfilePage from "../pages/mypage/ProfilePage";
import SelectPromoitonPage from "../pages/SelectPromoitonPage";
import ProposalUploadPage from "../pages/ProposalUploadPage";
import MainLayout from "../layout/MainLayout";

import AnalyzeLayout from "../layout/AnalyzeLayout";
import AnalyzePosterTrendPage from "../pages/analyze/AnalyzePosterTrendPage";
import AnalyzeBannerTrendPage from "../pages/analyze/AnalyzeBannerTrendPage";
import AnalyzeCardnewsTrendPage from "../pages/analyze/AnalyzeCardnewsTrendPage";
import AnalyzeLeafletTrendPage from "../pages/analyze/AnalyzeLeafletTrendPage";
import AnalyzeMascortTrendPage from "../pages/analyze/AnalyzeMascortTrendPage";
import AnalyzeVideoTrendPage from "../pages/analyze/AnalyzeVideoTrendPage";
import AnalyzeReportPage from "../pages/analyze/AnalyzeReportPage";
import AnalyzeProposalListPage from "../pages/analyze/AnalyzeProposalListPage";
import AnalyzeProposalThemePage from "../pages/analyze/AnalyzeProposalThemePage";
import CreatePromptLayout from "../layout/CreatePromptLayout";
import CreatePosterPromptPage from "../pages/create/CreatePosterPromptPage";
import CreateMascortPromptPage from "../pages/create/CreateMascortPromptPage";
import CreateLoadingPage from "../pages/create/CreateLoadingPage";
import AnalyzeRegionTrendPage from '../pages/analyze/AnalyzeRegionTrendPage';
import ProposalLoadingPage from "../pages/ProposalLoadingPage";

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
        </Route>  
        <Route path="/proposalloading" element={<ProposalLoadingPage />} />
        <Route path="/generate-prompt/loading" element={<CreateLoadingPage />} />
          
          {/* 기획서 분석 그룹 */}
          <Route path="/analyze" element={<AnalyzeLayout/>}>
            <Route index element={<AnalyzeProposalListPage />} />          
            <Route path="list" element={<AnalyzeProposalListPage />} />
            <Route path="theme" element={<AnalyzeProposalThemePage />} />
            <Route path="region_trend" element={<AnalyzeRegionTrendPage />} />
            <Route path="poster" element={<AnalyzePosterTrendPage />} />    
            <Route path="banner" element={<AnalyzeBannerTrendPage />} />    
            <Route path="cardnews" element={<AnalyzeCardnewsTrendPage />} />    
            <Route path="leaflet" element={<AnalyzeLeafletTrendPage />} />    
            <Route path="mascort" element={<AnalyzeMascortTrendPage />} />
            <Route path="video" element={<AnalyzeVideoTrendPage />} />
            <Route path="report" element={<AnalyzeReportPage />} />
          </Route>   

          {/* 프롬포트 생성 그룹 */}
          <Route path="/create" element={<CreatePromptLayout/>}>         
            <Route path="poster/detail/:filePathNo/:promptNo" element={<CreatePosterPromptPage />} />    
            <Route path="mascort" element={<CreateMascortPromptPage />} />
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