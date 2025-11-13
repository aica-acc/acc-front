import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import mainIcon from "../assets/icorn/main_icorn.png"; // ✅ 아이콘 경로 추가

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ 로고 클릭 시 메인 페이지로 이동
  const handleLogoClick = () => {
    navigate("/"); // 👉 메인 경로로 이동
  };

  // ✅ 드롭다운 항목 클릭 시 페이지 이동
  const handleMenuClick = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  return (
    <header className="w-full h-20 bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 z-50">
      <div className="flex justify-between items-center px-8 py-5">
        {/* 🟢 로고 + 서비스명 */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* 로고 아이콘 */}
          <img
            src={mainIcon}
            alt="logo"
            className="w-10 h-10 object-contain transition-transform duration-200 group-hover:scale-110"
          />
          {/* 서비스명 */}
          <span className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition">
            ACC
          </span>
        </div>

        {/* 🟣 오른쪽 메뉴 */}
        <div className="flex items-center gap-4 relative">
          {/* 크레딧 */}
          <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
            크레딧: 10000
          </span>

          {/* 업그레이드 */}
          <button className="px-4 py-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition">
            업그레이드
          </button>

          {/* 프로필 아이콘 + 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-indigo-400 text-white flex items-center justify-center hover:bg-indigo-500 transition"
            >
              <UserCircle className="w-5 h-5" />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2 text-sm">
                <button
                  onClick={() => handleMenuClick("/mypage/project")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  프로젝트
                </button>
                <button
                  onClick={() => handleMenuClick("/mypage/drive")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  저장소
                </button>
                <button
                  onClick={() => handleMenuClick("/mypage/profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  마이프로필
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
