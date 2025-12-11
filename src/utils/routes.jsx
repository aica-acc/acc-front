import React from "react";
import { Route, Routes } from "react-router-dom";
import ProjectPage from "../pages/mypage/ProjectPage";
import ProjectDetailPage from "../pages/mypage/ProjectDetailPage";

import DrivePage from "../pages/mypage/DrivePage";
import MyPageLayout from "../layout/MyPageLayout";
import MainPage from "../pages/MainPage";
import ProfilePage from "../pages/mypage/ProfilePage";
// import SelectPromoitonPage from "../pages/SelectPromoitonPage";
import SelectPromotionPage_New from "../components/select_promotion/SelectPromotionPage";
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
import EditorPage from "../pages/EditorPage";
import EditorLoadingPage from "../pages/EditorLoadingPage";
import TestPage from "../pages/TestPage";
import CreateUploadPage from "../pages/create/CreateUploadPage";

import MyReportPage from '../pages/report/MyReportPage';
import TempEditorEntry from '../pages/report/TempEditorEntry';
import CheckPage from "../pages/CheckPage";

// ✅ 라우터 관리 컴포넌트
const Approuter = () => {
  return (
    <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<MainPage />} />
        <Route element={<MainLayout />}>
          {/* 홍보물 선택 페이지 */}
          <Route path="/select" element={<SelectPromotionPage_New />} />    
          {/* 기획서 업로드 페이지 */}
          <Route path="/upload" element={<ProposalUploadPage />} />
        </Route>  
        <Route path="/proposalloading" element={<ProposalLoadingPage />} />
        <Route path="/testlodingpage" element={<EditorLoadingPage />} />
        {/* 에디터 페이지 */}  
        <Route path="/editorpage" element={<EditorPage />} />
        {/* 에디터 페이지 */}  
        <Route path="/check" element={<CheckPage />} />
        <Route path="/testpage" element={<TestPage />} />  
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
            <Route path="mascort/detail/:filePathNo/:promptNo" element={<CreateMascortPromptPage />} />
            <Route path="upload" element={<CreateUploadPage />} />
          </Route>                                                   
        
          {/* 마이 페이지  그룹 */}
          <Route path="/mypage" element={<MyPageLayout />}>
              <Route path="project" element={<ProjectPage />} />
              <Route path="drive" element={<DrivePage />} />
              <Route path="profile" element={<ProfilePage />} />  
              {/* ✅ 새로 추가: 프로젝트 상세 */}
              <Route path="project/:projectId" element={<ProjectDetailPage />} />
          </Route> 
    

          {/* 리포트 결과 페이지 그룹 */} 
          <Route path="/report">
            <Route path="editor" element={<TempEditorEntry/>} /> {/* 임시 에디터 진입점 */}
            <Route path="result" element={<MyReportPage />} />
          </Route>
    </Routes>
  );
};

export default Approuter;