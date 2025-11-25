import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BackButton from "../components/buttons/BackButton";
import StepProgress from "../components/step/StepProgress";
import AnalyzeButton from "../components/buttons/AnalyzeButton";

export default function AnalyzeLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [openPromotion, setOpenPromotion] = useState(false);
  const [openProposal, setOpenProposal] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState({});


  // ✅ 세션에서 사용자가 선택한 홍보물 로드
  useEffect(() => {
    const raw = sessionStorage.getItem("selectedPromotions");
    if (raw) setSelectedPromotions(JSON.parse(raw));
  }, []);

  // ✅ 사이드 항목 데이터 구성
  const promotionList = Object.keys(selectedPromotions || {});
   // ✅ 기획서 하위 항목 (항상 고정)
  const proposalSubItems = [
    { key: "overview", label: "개요", path: "/analyze/list" },
    { key: "theme", label: "테마", path: "/analyze/theme" },
  ];

  const mainItems = [
    { label: "기획서", icon: "bi-file-earmark-text", path: "/analyze/proposal" },
    {
      label: "홍보물",
      icon: "bi-megaphone",
      hasSub: true,
    },
    { label: "최종보고서", icon: "bi-bar-chart", path: "/analyze/report" },
  ];

  const getActiveClass = (path) => {
    return location.pathname === path 
      ? "bg-blue-600 text-white font-semibold"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  const getSubActiveClass = (path) => {
    return location.pathname === path
      ? "bg-blue-100 text-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-100";
  };

  return (
    
    <div className=" flex flex-col min-h-screen mt-20">
      <Header/>
      <BackButton/>
      
      <div className="flex flex-1">  
      {/* 사이드바 */}
        <div
          className={`mt-8 sticky left-0 top-0 h-[calc(100vh-80px)] transition-all duration-300 ${
            collapsed ? "w-17" : "w-64"
          } flex flex-col bg-gray-50 shadow-md rounded-r-2xl`}
        >
          
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            {!collapsed && (
              <span className="font-semibold text-gray-700 tracking-tight">
                목차
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition"
            >
              {collapsed ? "▶" : "◀"}
            </button>
          </div>

          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
            {mainItems.map((item) => (
              <div key={item.label}>
                <button
                   onClick={() => {
                    if (item.label === "기획서") {
                      setOpenProposal((prev) => !prev);
                    } else if (item.label === "홍보물") {
                      setOpenPromotion((prev) => !prev);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-medium shadow-sm transition ${
                    location.pathname.startsWith(item.path)
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {collapsed ? (
                    <i className={`bi ${item.icon} text-xl flex justify-center`} />
                  ) : (
                    <span className="flex items-center gap-2 text-base">
                      <i className={`bi ${item.icon} text-lg`} />
                      {item.label}
                    </span>
                  )}
                </button>

                {/* ✅ 기획서 하위 항목 (항상 표시 가능, 토글 열기형) */}
                {item.label === "기획서" && openProposal && !collapsed && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {proposalSubItems.map((sub) => (
                      <li key={sub.key}>
                        <button
                          onClick={() => navigate(sub.path)}
                          className={`block w-full text-left px-4 py-1.5 rounded-lg text-sm transition ${
                            location.pathname === sub.path
                              ? "bg-blue-100 text-blue-600 font-medium"
                              : "bg-white text-gray-600 hover:bg-blue-50"
                          }`}
                        >
                          {sub.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                  {/* ✅ 홍보물 하위 항목 */}
                  {item.hasSub && openPromotion && !collapsed && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {promotionList.length > 0 ? (
                        promotionList.map((key) => {
                          const subPath = `/analyze/${key}`;
                          return (
                            <li key={key}>
                              <button
                                onClick={() => navigate(subPath)}
                                className={`block w-full text-left px-4 py-1.5 rounded-lg text-sm transition ${
                                  location.pathname === subPath
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "bg-white text-gray-600 hover:bg-blue-50"
                                }`}
                              >
                                {key === "video"
                                  ? "영상"
                                  : key === "poster"
                                  ? "포스터"
                                  : key === "banner"
                                  ? "현수막"
                                  : key === "cardnews"
                                  ? "카드뉴스"
                                  : key === "leaflet"
                                  ? "리플렛"
                                  : key === "mascort"
                                  ? "마스코트"
                                  : key}
                              </button>
                            </li>
                          );
                        })
                      ) : (
                        <li className="text-gray-400 text-sm px-3 py-1">선택된 홍보물 없음</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          </div>

        {/* 우측 콘텐츠 영역 */}
        <div
          className={`transition-all duration-300 flex-1 p-6 ${
            collapsed ? "ml-14" : "ml-14"
          }`}
        >
          <div className="mb-6">
           <StepProgress current={3}/>
          </div>
          <Outlet />
        </div>
      </div>
      
    </div>
  );
}
