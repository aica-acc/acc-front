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
        // 1️⃣ 분석 요청
        const formData = new FormData();
        formData.append("file", state.file);
        formData.append("theme", state.theme);
        formData.append("keywords", JSON.stringify(state.keywords));
        formData.append("title", state.festivalName);

        await api.post("/api/project/analyze", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 2️⃣ 로딩 메시지 변경
        setMessage("분석 결과를 불러오는 중입니다...");

        // 3️⃣ 최신 분석 결과 GET
        const res = await api.get("/api/project/analyze/lastst");

        // 4️⃣ 세션스토리지 저장
        sessionStorage.setItem("proposalData", JSON.stringify(res.data));

        // 5️⃣ 분석 페이지로 이동
        navigate("/analyze", { state: res.data });

      } catch (err) {
        console.error("❌ 분석 실패:", err);
        alert("오류가 발생했습니다.");
        navigate("/upload");
      }
    };

    runAnalysis();
  }, [state, navigate]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
      <LoadingSpinner message={message} />
    </div>
  );
};

export default ProposalLoadingPage;
