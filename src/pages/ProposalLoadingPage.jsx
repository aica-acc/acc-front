import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import UnifiedLoadingPage from "../components/loding/UnifiedLoadingPage";

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

        sessionStorage.setItem(
          "proposalData",
          JSON.stringify(finalProposal.data)
        );

        setMessage("트렌드 및 홍보물 분석을 진행 중입니다...");

        /* -------------------------------
         * 2️⃣ 병렬 실행 - 모든 분석
         * ------------------------------- */

        const pd = finalProposal.data;

        // 공통 FormData (trend, video, mascot, etc…)
        const baseFD = () => {
          const fd = new FormData();
          fd.append("keyword", state.keywords[0]); // 메인 키워드
          fd.append("title", pd.title);
          fd.append("festival_start_date", pd.festival_start_date);
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
            params: { festival_start_date: pd.festival_start_date }
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

        sessionStorage.setItem(
          "trendData",
          JSON.stringify(trendRes.data)
        );

        sessionStorage.setItem(
          "regionTrendData",
          JSON.stringify(regionTrendRes.data)
        );

        /* -------------------------------
         * 3️⃣ 최종 결과 페이지 이동
         * ------------------------------- */
        navigate("/analyze", {
          state: {
            proposal: finalProposal.data,
            trend: trendRes.data,
            regionTrend: regionTrendRes.data,
            festivalStartDate: pd.festival_start_date,
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
