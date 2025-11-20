import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BackButton from "../components/buttons/BackButton";
import StepProgress from "../components/step/StepProgress";

export default function AnalyzeLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [openPromotion, setOpenPromotion] = useState(true); // 기본 열림 추천
  const [openProposal, setOpenProposal] = useState(true); // 기본 열림 추천
  const [selectedPromotions, setSelectedPromotions] = useState({});

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedPromotions");
    if (raw) setSelectedPromotions(JSON.parse(raw));
  }, []);

  const promotionList = Object.keys(selectedPromotions || {});
  
  const proposalSubItems = [
    { key: "overview", label: "개요", path: "/analyze/list" },
    { key: "theme", label: "테마", path: "/analyze/theme" },
  ];

  const mainItems = [
    { label: "기획서", icon: "bi-file-earmark-text", path: "/analyze/proposal" },
    { label: "홍보물", icon: "bi-megaphone", hasSub: true },
    { label: "최종보고서", icon: "bi-bar-chart", path: "/analyze/report" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 헤더 (고정) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      <div className="flex flex-1 pt-16"> {/* 헤더 높이만큼 패딩 */}
        
        {/* 사이드바 (왼쪽 고정) */}
        <div
          className={`fixed left-0 top-16 bottom-0 bg-gray-50 border-r border-gray-200 transition-all duration-300 z-40 flex flex-col ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* 사이드바 헤더 */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
            {!collapsed && <span className="font-bold text-gray-700">목차</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
            >
              <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
            </button>
          </div>

          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="mb-4">
               <BackButton /> {/* 뒤로가기 버튼을 사이드바 상단에 배치 */}
            </div>

            {mainItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.label === "기획서") setOpenProposal(!openProposal);
                    else if (item.label === "홍보물") setOpenPromotion(!openPromotion);
                    else navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} text-xl`}></i>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.hasSub && (
                    <i className={`bi bi-chevron-down ml-auto text-sm transition-transform ${
                      (item.label === "기획서" && openProposal) || (item.label === "홍보물" && openPromotion) ? "rotate-180" : ""
                    }`}></i>
                  )}
                </button>

                {/* 기획서 하위 메뉴 */}
                {!collapsed && item.label === "기획서" && openProposal && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {proposalSubItems.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => navigate(sub.path)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition ${
                          location.pathname === sub.path
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 홍보물 하위 메뉴 */}
                {!collapsed && item.hasSub && openPromotion && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {promotionList.length > 0 ? (
                      promotionList.map((key) => {
                        const subPath = `/analyze/${key}`;
                        const labelMap = {
                          video: "영상", poster: "포스터", banner: "현수막",
                          cardnews: "카드뉴스", leaflet: "리플렛", mascort: "마스코트"
                        };
                        return (
                          <button
                            key={key}
                            onClick={() => navigate(subPath)}
                            className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition ${
                              location.pathname === subPath
                                ? "text-blue-600 bg-blue-50 font-medium"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {labelMap[key] || key}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400 px-3 py-1 block">선택 없음</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* 메인 콘텐츠 영역 (사이드바 너비만큼 마진 자동 조절) */}
        <div 
          className={`flex-1 transition-all duration-300 p-8 overflow-y-auto ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="max-w-5xl mx-auto">
            {/* 단계 표시 (Step Progress) */}
            <div className="mb-8">
              <StepProgress />
            </div>

            {/* 실제 페이지 내용 */}
            <div className="bg-white min-h-[500px]">
              <Outlet />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}