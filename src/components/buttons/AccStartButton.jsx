import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/** 메인 섹션의 시작 버튼: 로그인했으면 홍보물 유형 선택, 아니면 로그인 화면으로 */
const AccStartButton = ({ onClick }) => {
  const navigate = useNavigate();
  const loggedIn = useAuthStore((s) => !!s.token);
  return (
    <button
      onClick={onClick || (() => navigate(loggedIn ? "/select" : "/login"))}
      className="px-8 py-3 mt-10 rounded-full text-lg font-semibold
                 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500
                 text-white shadow-md hover:brightness-110 hover:scale-105
                 transition-transform duration-200"
    >
      ACC 시작하기
    </button>
  );
};

export default AccStartButton;
