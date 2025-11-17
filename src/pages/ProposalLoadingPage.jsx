import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import LoadingSpinner from "../components/loding/LoadingSpinner";

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
      // 1️⃣ 기획서 분석 요청 준비
      const proposalData = new FormData();
      proposalData.append("file", state.file);
      proposalData.append("theme", state.theme);
      proposalData.append("keywords", JSON.stringify(state.keywords));
      proposalData.append("title", state.festivalName);

      // 2️⃣ 총 트렌드 분석 요청 준비
      const primaryKeyword = state.keywords[0];
      const totalTrendData = new FormData();
      totalTrendData.append("keyword", primaryKeyword);
      totalTrendData.append("title", state.festivalName);

      const bannerData = new FormData();
      bannerData.append("theme", state.theme);
      bannerData.append("keywords", JSON.stringify(state.keywords));
      bannerData.append("title", state.festivalName);

      // 3️⃣ 병렬 실행 (속도 2배!)
      const proposalReq = api.post(
        "/api/project/analyze/proposal",
        proposalData
        // axios는 FormData에서 content-type 자동 설정함 → headers 제거
      );

      // const analyzeBannerReq = api.post(
      //   "/api/analyze/banner",
      //   bannerData
      //   // axios는 FormData에서 content-type 자동 설정함 → headers 제거
      // );

      // const trendReq = api.post(
      //   "/api/project/analyze/total_trend",
      //   totalTrendData
      // );

      await Promise.all([proposalReq]);

      // 4️⃣ 메시지 업데이트
      setMessage("분석 결과를 불러오는 중입니다...");

      // 5️⃣ 최신 결과 GET
      const res = await api.get("/api/project/analyze/lastst");

      // 6️⃣ 세션스토리지 저장
      sessionStorage.setItem("proposalData", JSON.stringify(res.data));

      // 7️⃣ 결과 페이지 이동
      navigate("/analyze", { state: res.data });

    } catch (err) {
      console.error("❌ 병렬 분석 실패:", err);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      navigate("/upload");
    }
  };


    runAnalysis();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
      <LoadingSpinner message={message} />
    </div>
  );
};

export default ProposalLoadingPage;
