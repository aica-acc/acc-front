import React from "react";
import { useNavigate } from "react-router-dom";

const AnalyzeButton = ({ label = "각 홍보물 프롬프트 생성하기" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center mt-8 mb-8">
      <button
        onClick={() => navigate("/create")}
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
