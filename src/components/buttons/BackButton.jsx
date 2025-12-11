import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        inline-flex items-center gap-2
        text-sm text-gray-700
        px-3 py-2
        rounded-lg
        bg-white
        border border-gray-200
        hover:bg-gray-200 hover:text-gray-900
        transition-colors duration-150
      "
    >
      <ArrowLeft size={16} />
      이전 단계로
    </button>
  );
}
