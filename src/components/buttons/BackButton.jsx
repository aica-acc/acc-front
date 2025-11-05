// src/components/BackButton.jsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


const BackButton = ({ label = "이전" }) => {
  const navigate = useNavigate();
  
  return (
    
    <button
      onClick={() => navigate(-1)}
      className="ml-3 flex items-center gap-1 hover:text-blue-600 transition"
    >
      <ArrowLeft className="w-4 h-4 text-gray-600" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
