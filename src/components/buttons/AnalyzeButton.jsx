import React from "react";
import { useNavigate } from "react-router-dom";

const AnalyzeButton = ({ label = "각 홍보물 프롬프트 생성하기" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const proposalRaw = sessionStorage.getItem("proposalData");
    const trendRaw = sessionStorage.getItem("trendData");

    if (!proposalRaw || !trendRaw) {
      alert("필요한 분석 데이터가 없습니다.");
      return;
    }
    const trendData = JSON.parse(trendRaw);
    

    navigate("/generate-prompt/loading", {
      state: {
        trendData,
      },
    });
  };

  return (
    <div className="flex justify-center mt-8 mb-8">
      <button
        onClick={handleClick}
        className="
          bg-green-500 hover:bg-green-600 
          text-white font-semibold text-sm
          px-6 py-3 
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
