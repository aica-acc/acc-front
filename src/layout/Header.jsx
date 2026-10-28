import React, { useState, useRef, useEffect, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCircle } from "lucide-react";
import mainIcon from "../assets/icorn/main_icorn.webp";
import { useAuthStore } from "../store/authStore";
import api from "../utils/api/BaseAPI";

const ROLE_LABEL = { USER: "", TEST: "", ADMIN: "관리자" };

const Header = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isMainPage = location.pathname === "/home";
  const member = useAuthStore((s) => s.member);
  const loggedIn = useAuthStore((s) => !!s.token);
  const clearSession = useAuthStore((s) => s.clearSession);

  const isDemo = member?.role === "TEST";
  // 남은 크레딧: 화면을 옮길 때마다 다시 읽는다 (생성으로 차감·환불된 값 반영)
  const [credit, setCredit] = useState(null);
  useEffect(() => {
    if (!loggedIn) {
      setCredit(null);
      return;
    }
    let alive = true;
    api
      .get("/api/credits/me")
      .then((res) => alive && setCredit(res.data))
      .catch(() => alive && setCredit(null));
    return () => {
      alive = false;
    };
  }, [loggedIn, location.pathname]);

  const logout = () => {
    clearSession();
    setOpen(false);
    navigate("/");
  };

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
          onClick={() => navigate(loggedIn ? "/home" : "/")}
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
          {/* 크레딧 - 그라디언트 + 둥근 알약 모양 (누르면 마이프로필의 크레딧 내역) */}
          {loggedIn && credit && !isDemo && (
            <button
              onClick={() => navigate("/mypage/profile")}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full text-sm font-bold text-white shadow-lg hover:brightness-110"
            >
              크레딧:{" "}
              <span className="text-blue-100">
                {credit.unlimited ? "무제한" : credit.balance.toLocaleString()}
              </span>
            </button>
          )}

          {loggedIn && (
            <span className="text-sm text-gray-200 hidden sm:flex items-center gap-2">
              {member?.name}
              {ROLE_LABEL[member?.role] && (
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-500 text-white">
                  {ROLE_LABEL[member?.role]}
                </span>
              )}
            </span>
          )}

          {/* 로그인 / 로그아웃 버튼 - 둥근 + 그림자 효과 */}
          {loggedIn ? (
            <button
              onClick={logout}
              className="px-7 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-lg transition-all font-semibold text-sm"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-lg transition-all font-semibold text-sm"
            >
              로그인
            </button>
          )}

          {/* 프로필 아이콘 - 그라디언트 + 호버 확대 */}
          <button
            onClick={() => setOpen(!open)}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all shadow-md"
          >
            <UserCircle className="w-7 h-7" />
          </button>

          {open && loggedIn && (
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
              {member?.role === "ADMIN" && (
                <button
                  className="w-full px-4 py-2.5 text-left text-indigo-300 hover:bg-gray-700 transition-colors font-bold"
                  onClick={() => navigate("/admin")}
                >
                  관리자
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
