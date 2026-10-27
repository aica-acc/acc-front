import React from "react";
import { useNavigate } from "react-router-dom";

/** 존재하지 않는 주소 */
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-yellow-300 mb-4">404</p>
      <h1 className="text-2xl font-semibold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-400 mb-8">주소가 바뀌었거나 삭제된 페이지일 수 있어요.</p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-full border border-gray-500 text-gray-200 hover:bg-gray-800 transition"
        >
          이전으로
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-full bg-yellow-300 text-black font-semibold hover:bg-yellow-400 transition"
        >
          메인으로
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
