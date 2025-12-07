import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, ArrowLeft } from "lucide-react";
import StepProgressHorizontal from "../components/step/StepProgressHorizontal";

const StepHeader = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleBack = () => navigate(-1);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50"
      style={{
        backgroundColor: "rgb(37, 37, 47)",
      }}
    >
      <div className="flex items-center justify-between px-8 py-6">

        {/* 🔹 왼쪽: 뒤로가기 버튼 */}
        <button
          onClick={handleBack}
          className="w-12 h-12 flex items-center justify-center
                     text-gray-300 hover:text-white transition-colors
                     rounded-xl border-2 border-gray-600 hover:border-gray-500
                     bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-sm"
          title="뒤로"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 🔹 가운데: Step Progress */}
        <div className="flex-1 flex justify-center">
          <StepProgressHorizontal total={7} />
        </div>

        {/* 🔹 오른쪽: 프로필 버튼 */}
        <div className="flex items-center gap-5 relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-12 h-12 rounded-full flex items-center justify-center
                       text-white shadow-md
                       bg-gradient-to-br from-blue-600 to-blue-700
                       hover:shadow-xl hover:scale-105 transition-all"
          >
            <UserCircle className="w-7 h-7" />
          </button>

          {/* 🔹 드롭다운 메뉴 */}
          {open && (
            <div
              className="absolute right-0 top-full mt-3 w-48
                         border border-gray-700 rounded-xl shadow-xl py-2
                         backdrop-blur-sm"
              style={{ backgroundColor: "rgba(37, 37, 47, 0.95)" }}
            >
              <button
                className="w-full px-4 py-2.5 text-left text-gray-200 
                           hover:bg-gray-700/70 transition-colors font-semibold"
                onClick={() => {
                  navigate("/mypage/project");
                  setOpen(false);
                }}
              >
                프로젝트
              </button>

              <button
                className="w-full px-4 py-2.5 text-left text-gray-200 
                           hover:bg-gray-700/70 transition-colors font-semibold"
                onClick={() => {
                  navigate("/mypage/drive");
                  setOpen(false);
                }}
              >
                저장소
              </button>

              <button
                className="w-full px-4 py-2.5 text-left text-gray-200 
                           hover:bg-gray-700/70 transition-colors font-semibold"
                onClick={() => {
                  navigate("/mypage/profile");
                  setOpen(false);
                }}
              >
                마이프로필
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StepHeader;
