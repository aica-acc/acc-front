import React, { useState, useRef, useEffect, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCircle } from "lucide-react";
import mainIcon from "../assets/icorn/main_icorn.png";

const Header = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isMainPage = location.pathname === "/";

  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // 스크롤 감지 (MainPage일 때만)
  useEffect(() => {
    if (!isMainPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 상태 확인

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMainPage]);

  return (
    <header
      ref={ref}
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      style={{ 
        backgroundColor: isMainPage && !isScrolled 
          ? "transparent" 
          : "rgb(37, 37, 47)" 
      }}
    >
      <div className="flex items-center justify-between px-8 py-8">
        {/* 로고 */}
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img
            src={mainIcon}
            className="w-14 h-14 group-hover:scale-110 transition"
          />
          <span className="text-3xl font-bold text-gray-200 group-hover:text-indigo-400 transition">
            ACC
          </span>
        </div>

        {/* 유저 */}
        <div className="flex items-center gap-5 relative" ref={dropdownRef}>
          <span className="px-4 py-2 bg-gray-700 rounded text-base font-bold text-gray-200">
            크레딧: 10000
          </span>

          <button className="px-6 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition font-bold text-base">
            로그아웃 
          </button>

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
                onClick={() => navigate("/mypage/project")}
              >
                프로젝트
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 transition-colors font-bold"
                onClick={() => navigate("/mypage/drive")}
              >
                저장소
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700 transition-colors font-bold"
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
