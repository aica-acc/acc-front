import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StepHeader from "./StepHeader";

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
    { key: "theme", label: "키워드 트렌드 분석", path: "/analyze/theme" },
    { key: "region", label: "지역 트렌드 분석", path: "/analyze/region_trend" },
  ];

  const mainItems = [
    { label: "기획서", icon: "bi-file-earmark-text", path: "/analyze/proposal" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      {/* 헤더 (고정) */}
      <StepHeader />

      <div className="flex flex-1 pt-28"> {/* 헤더 높이만큼 패딩 */}
        
        {/* 사이드바 (왼쪽 고정) - 헤더 아래에 위치 */}
        <div
          className={`fixed left-0 bottom-0 border-r transition-all duration-300 flex flex-col ${
            collapsed ? "w-20" : "w-64"
          }`}
          style={{ 
            backgroundColor: "rgb(37, 37, 47)", // 헤더와 동일한 색상
            borderColor: "rgb(55, 55, 65)",
            top: "112px", // 헤더 높이보다 약간 더 아래로 (py-8 = 32px * 2 + 내용)
            zIndex: 45 // 헤더(z-50)보다 낮지만 충분히 높게
          }}
        >
          {/* 사이드바 헤더 */}
          <div 
            className="flex items-center justify-between px-4 h-14"
            style={{ borderBottom: "1px solid rgb(55, 55, 65)" }}
          >
            {!collapsed && <span className="font-bold text-gray-300">목차</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
              style={{ backgroundColor: "rgba(55, 55, 65, 0.5)" }}
            >
              <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
            </button>
          </div>

          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            {mainItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.label === "기획서") setOpenProposal(!openProposal);
                    else navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-bold ${
                    location.pathname.startsWith(item.path)
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : ""}
                >
                  <i className={`bi ${item.icon} text-xl`}></i>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.hasSub && (
                    <i className={`bi bi-chevron-down ml-auto text-sm transition-transform ${
                      (item.label === "기획서" && openProposal) ? "rotate-180" : ""
                    }`}></i>
                  )}
                </button>

                {/* 기획서 하위 메뉴 */}
                {!collapsed && item.label === "기획서" && openProposal && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: "rgb(55, 55, 65)" }}>
                    {proposalSubItems.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => navigate(sub.path)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition font-bold ${
                          location.pathname === sub.path
                            ? "text-yellow-500 bg-gray-700"
                            : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
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
          <Outlet/>
        </div>
      </div>
      
    </div>
  );
}