import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import UnifiedLoadingPage from "../components/loding/UnifiedLoadingPage";
import { useProjectStore } from "../store/projectStore";
import projectSession from "../utils/projectSession";

const ProposalLoadingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [message, setMessage] = useState("기획서를 분석 중입니다...");

  useEffect(() => {
    if (!state) {
      alert("업로드된 데이터가 없습니다. 다시 시도해주세요.");
      navigate("/upload");
      return;
    }

    const runAnalysis = async () => {
      try {
        // 새 기획서 = 새 프로젝트. 이전 프로젝트의 진행 상태를 이어받지 않는다
        useProjectStore.getState().reset();

        /* -------------------------------
         * 1️⃣ 기획서 분석
         * ------------------------------- */
        const proposalData = new FormData();
        proposalData.append("file", state.file);
        proposalData.append("theme", state.theme);
        proposalData.append("keywords", JSON.stringify(state.keywords));
        proposalData.append("title", state.festivalName);

        await api.post(
          "/api/project/analyze/proposal", 
          proposalData
        );

        // 백엔드에서 저장된 최신 값 가져오기
        const finalProposal = await api.get("/api/project/analyze/lastst");

        // 이 프로젝트를 현재 프로젝트로 삼고 서버 진행 상태를 연다 (이후 값은 서버에 저장된다)
        await useProjectStore.getState().start(finalProposal.data.pNo ?? finalProposal.data.projectNo);
        projectSession.setItem("proposalData", JSON.stringify(finalProposal.data));
        // 유형 선택 화면(/select)에서 고른 초안을 이 프로젝트의 진행 상태로 옮긴다
        const draftTypes = sessionStorage.getItem("types");
        if (draftTypes) projectSession.setItem("types", draftTypes);

        setMessage("트렌드 및 홍보물 분석을 진행 중입니다...");

        /* -------------------------------
         * 2️⃣ 병렬 실행 - 모든 분석
         * ------------------------------- */

        const pd = finalProposal.data;
        // 서버 응답은 festivalStartDate("2023-05-19T00:00:00.000+00:00"). 트렌드 API 는 yyyy-MM-dd 를 받는다
        const festivalStartDate = String(pd.festivalStartDate || "").slice(0, 10);

        // 공통 FormData (trend, video, mascot, etc…)
        const baseFD = () => {
          const fd = new FormData();
          fd.append("keyword", state.keywords[0]); // 메인 키워드
          fd.append("title", pd.title);
          fd.append("festival_start_date", festivalStartDate);
          return fd;
        };

        // ⭐ 2-1) 트렌드 분석 (최우선)
        const trendReq = api.post(
          "/api/project/analyze/total_trend",
          baseFD()
        );

        // ⭐ 2-2) 지역 트렌드 분석
        const regionTrendReq = api.post(
          "/api/project/analyze/region_trend",
          null,
          {
            params: { festival_start_date: festivalStartDate }
          }
        );

        // // ⭐ 2-3) 나머지 분석 – 일단 구조만 주석 처리한 상태로 둠
        // const videoReq = api.post(
        //   "/api/project/analyze/video",
        //   baseFD()
        // );

        // const mascotReq = api.post(
        //   "/api/project/analyze/mascot",
        //   baseFD()
        // );

        // const posterReq = api.post(
        //   "/api/project/analyze/poster",
        //   baseFD()
        // );

        // const bannerReq = api.post(
        //   "/api/project/analyze/banner",
        //   baseFD()
        // );

        // const cardnewsReq = api.post(
        //   "/api/project/analyze/cardnews",
        //   baseFD()
        // );

        // const leafletReq = api.post(
        //   "/api/project/analyze/leaflet",
        //   baseFD()
        // );

        // 실제로 아직 API 없는 경우 주석처리 ↓↓↓
        const results = await Promise.all([
          trendReq,
          regionTrendReq,
          // videoReq,
          // mascotReq,
          // posterReq,
          // bannerReq,
          // cardnewsReq,
          // leafletReq
        ]);

        const trendRes = results[0];
        const regionTrendRes = results[1];

        projectSession.setItem("trendData", JSON.stringify(trendRes.data));
        projectSession.setItem("regionTrendData", JSON.stringify(regionTrendRes.data));

        /* -------------------------------
         * 3️⃣ 최종 결과 페이지 이동
         * ------------------------------- */
        navigate("/analyze", {
          state: {
            proposal: finalProposal.data,
            trend: trendRes.data,
            regionTrend: regionTrendRes.data,
            festivalStartDate,
          },
        });
      } catch (err) {
        console.error("❌ 분석 실패:", err);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/upload");
      }
    };

    runAnalysis();
  }, [navigate, state]);

  return (
    <UnifiedLoadingPage 
      title={message}
      description="잠시만 기다려 주세요."
    />
  );
};

export default ProposalLoadingPage;
