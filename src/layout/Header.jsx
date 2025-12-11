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
      <div className="flex items-center justify-between px-8 py-4">
        {/* 로고 */}
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img
            src={mainIcon}
            className="w-24 h-14 group-hover:scale-110 transition"
          />
          {/* <span className="text-3xl font-bold text-gray-200 group-hover:text-indigo-400 transition">
            ACC
          </span> */}
        </div>

        {/* 유저 */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {/* 크레딧 - 그라디언트 + 둥근 알약 모양 */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-sm font-bold text-white shadow-lg">
            크레딧: <span className="text-blue-100">10000</span>
          </div>

          {/* 로그아웃 버튼 - 둥근 + 그림자 효과 */}
          <button className="px-7 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-lg transition-all font-semibold text-sm">
            로그아웃
          </button>

          {/* 프로필 아이콘 - 그라디언트 + 호버 확대 */}
          <button
            onClick={() => setOpen(!open)}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all shadow-md"
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
