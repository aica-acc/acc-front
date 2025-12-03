import React, { useState, useRef, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import mainIcon from "../assets/icorn/main_icorn.png";

const Header = forwardRef((props, ref) => {
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

  return (
    <header
      ref={ref}
      className="fixed top-0 left-0 w-full z-50"
      style={{ backgroundColor: "rgb(37, 37, 47)" }}
    >
      <div className="flex items-center justify-between px-8 py-6">
        {/* 로고 */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img
            src={mainIcon}
            className="w-10 h-10 group-hover:scale-110 transition"
          />
          <span className="text-2xl font-bold text-gray-200 group-hover:text-indigo-400 transition">
            ACC
          </span>
        </div>

        {/* 유저 */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <span className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300">
            크레딧: 10000
          </span>

          <button className="px-4 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition">
            업그레이드
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
          >
            <UserCircle className="w-6 h-6" />
          </button>

          {open && (
            <div 
              className="absolute right-0 mt-2 w-40 border border-gray-700 rounded shadow-lg py-2 text-sm"
              style={{ backgroundColor: "rgb(37, 37, 47)" }}
            >
              <button
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/mypage/project")}
              >
                프로젝트
              </button>
              <button
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/mypage/drive")}
              >
                저장소
              </button>
              <button
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/mypage/profile")}
              >
                마이프로필
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
