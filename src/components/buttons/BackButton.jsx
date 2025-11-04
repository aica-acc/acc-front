// src/components/BackButton.jsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { goBack } from "../../utils/goBack";


const BackButton = ({ label = "이전" }) => {
  const goBack = goBack();

  return (
    <button
      onClick={goBack}
      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
    >
      <ArrowLeft className="w-4 h-4 text-gray-600" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
