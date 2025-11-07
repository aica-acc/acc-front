import React, { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BackButton from "../components/buttons/BackButton";
import StepProgress from "../components/step/StepProgress";

export default function CreatePromptLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ 세션에서 홍보물 불러오기 (렌더 시 바로)
  const selectedPromotions = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("selectedPromotions");
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error("sessionStorage 불러오기 오류:", err);
      return {};
    }
  }, []);

  // ✅ 대분류 키 목록
  const mainCategories = Object.keys(selectedPromotions || {});

  // ✅ 라벨 매핑
  const getLabel = (key) => {
    switch (key) {
      case "poster":
        return "포스터";
      case "cardnews":
        return "카드뉴스";
      case "banner":
        return "현수막";
      case "leaflet":
        return "리플렛";
      case "mascort":
        return "마스코트";
      case "video":
        return "영상";
      default:
        return key;
    }
  };

  // ✅ 아이콘 매핑 (Bootstrap Icons)
  const getIcon = (key) => {
    switch (key) {
      case "poster":
        return "bi bi-file-earmark-image";
      case "cardnews":
        return "bi bi-instagram";
      case "banner":
        return "bi bi-easel";
      case "leaflet":
        return "bi bi-file-earmark-text";
      case "mascort":
        return "bi bi-person-bounding-box";
      case "video":
        return "bi bi-camera-video";
      default:
        return "bi bi-file-earmark";
    }
  };

  return (
    <div className="flex flex-col min-h-screen mt-20">
      {/* 상단 공통 헤더 */}
      <Header />
      <BackButton />
      <StepProgress />

      {/* 본문 구조 */}
      <div className="flex flex-1">
        {/* ✅ 사이드바 */}
        <div
          className={`sticky left-0 top-0 h-[calc(100vh-80px)] transition-all duration-300 ${
            collapsed ? "w-24" : "w-64"
          } flex flex-col bg-gray-50 shadow-md rounded-r-2xl`}
        >
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            {!collapsed && (
              <span className="font-semibold text-gray-700 tracking-tight">
                홍보물 목록
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition"
            >
              {collapsed ? "▶" : "◀"}
            </button>
          </div>

          {/* ✅ 항목 목록 */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
            {mainCategories.length > 0 ? (
              mainCategories.map((key) => {
                const isActive =
                  location.pathname === `/create/${key}` ||
                  location.pathname.startsWith(`/create/${key}/`);
                const count = selectedPromotions[key]?.length || 0;

                return (
                  <button
                    key={key}
                    onClick={() => navigate(`/create/${key}`)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl shadow-sm transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {collapsed ? (
                      <i className={`${getIcon(key)} text-xl mx-auto`} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <i className={`${getIcon(key)} text-lg`} />
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-[15px]">
                            {getLabel(key)}
                          </span>
                          <span
                            className={`text-xs ${
                              isActive ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {count}개 항목
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm text-center mt-4">
                선택된 홍보물이 없습니다.
              </p>
            )}
          </nav>
        </div>

        {/* ✅ 우측 콘텐츠 영역 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
