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

  const handleBack = () => {
    navigate(-1);
  };


  return (
    <header
      className="fixed top-0 left-0 w-full z-50 "
      style={{ 
        backgroundColor: "rgb(37, 37, 47)"
      }}
    >
      <div className="flex items-center justify-between px-8 py-8">
        {/* 왼쪽: 백 버튼 (화살표만) */}
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-white transition-colors rounded border-2 border-gray-600 hover:border-gray-500 font-bold"
            title="뒤로"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* 가운데: StepProgress */}
        <div className="flex-1 flex justify-center">
          <StepProgressHorizontal total={7} />
        </div>

        {/* 오른쪽: 프로필 */}
        <div className="flex items-center gap-5 relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
          >
            <UserCircle className="w-7 h-7" />
          </button>

          {open && (
            <div 
              className="absolute right-0 top-full mt-2 w-44 border border-gray-700 rounded shadow-lg py-2 text-base"
              style={{ backgroundColor: "rgb(37, 37, 47)" }}
            >
              <button
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 transition-colors font-bold"
                onClick={() => {
                  navigate("/mypage/project");
                  setOpen(false);
                }}
              >
                프로젝트
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 transition-colors font-bold"
                onClick={() => {
                  navigate("/mypage/drive");
                  setOpen(false);
                }}
              >
                저장소
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 transition-colors font-bold"
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

