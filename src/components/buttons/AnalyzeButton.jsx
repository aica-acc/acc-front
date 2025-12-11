import React from "react";
import { useNavigate } from "react-router-dom";

const AnalyzeButton = ({ label = "각 홍보물 프롬프트 생성하기" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const proposalRaw = sessionStorage.getItem("proposalData");
    const trendRaw = sessionStorage.getItem("trendData");

    if (!proposalRaw || !trendRaw) {
      alert("필요한 분석 데이터가 없습니다. proposalData 또는 trendData가 없습니다.");
      console.error("AnalyzeButton 에러:", { 
        hasProposalData: !!proposalRaw, 
        hasTrendData: !!trendRaw 
      });
      return;
    }

    try {
      const trendData = JSON.parse(trendRaw);
      
      navigate("/generate-prompt/loading", {
        state: {
          trendData,
        },
      });
    } catch (error) {
      console.error("trendData 파싱 오류:", error);
      alert("데이터 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex justify-center mt-8 mb-8">
      <button
        onClick={handleClick}
        className="
          bg-yellow-300 hover:bg-yellow-400 
          text-black font-bold text-base
          px-8 py-3 
          rounded-lg shadow-md
          transition-all duration-200
          hover:shadow-lg active:scale-95
        "
      >
        {label}
      </button>
    </div>
  );
};

export default AnalyzeButton;
