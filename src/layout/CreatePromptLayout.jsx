import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StepHeader from "./StepHeader";
import PromptSidebar from "../components/create/PromptSidebar";

const CreatePromptLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  // ⭐ Layout이 관리하는 state
  const [basePrompt, setBasePrompt] = useState("");
  const [filePathNo, setFilePathNo] = useState(null);
  const [promptNo, setPromptNo] = useState(null);
  const [index, setIndex] = useState(null);
  const [thumbnailList, setThumbnailList] = useState([]);

  const createSubItems = [
    { key: "poster", label: "포스터", path: "/create/poster" },
    { key: "mascort", label: "마스코트", path: "/create/mascort" },
    { key: "upload", label: "업로드", path: "/create/upload" },
  ];

  const mainItems = [
    { label: "홍보물 생성", icon: "bi-image", path: "/create" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      {/* 헤더 (고정) */}
      <StepHeader />

      <div className="flex flex-1 pt-28">
        {/* 사이드바 (왼쪽 고정) - 헤더 아래에 위치 */}
        <div
          className={`fixed left-0 bottom-0 border-r transition-all duration-300 flex flex-col ${
            collapsed ? "w-20" : "w-64"
          }`}
          style={{ 
            backgroundColor: "rgb(37, 37, 47)",
            borderColor: "rgb(55, 55, 65)",
            top: "112px",
            zIndex: 45
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
                    if (item.label === "홍보물 생성") {
                      // 하위 메뉴 토글은 필요 없을 수도 있지만, 필요시 추가
                    } else {
                      navigate(item.path);
                    }
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
                </button>

                {/* 하위 메뉴 */}
                {!collapsed && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: "rgb(55, 55, 65)" }}>
                    {createSubItems.map((sub) => {
                      const handleClick = () => {
                        // 포스터 메뉴인 경우, sessionStorage에서 posterThumbnailList의 첫 번째 항목으로 이동
                        if (sub.key === "poster") {
                          const saved = sessionStorage.getItem("posterThumbnailList");
                          if (!saved) {
                            alert("생성된 포스터 이미지가 없습니다. 먼저 이미지를 생성해주세요.");
                            return;
                          }
                          try {
                            const list = JSON.parse(saved);
                            if (!list || list.length === 0) {
                              alert("생성된 포스터 이미지가 없습니다. 먼저 이미지를 생성해주세요.");
                              return;
                            }
                            const first = list[0];
                            navigate(`/create/poster/detail/${first.filePathNo}/${first.promptNo}`);
                            return;
                          } catch (e) {
                            console.error("posterThumbnailList 파싱 오류:", e);
                            alert("포스터 이미지 데이터를 불러오는 중 오류가 발생했습니다.");
                            return;
                          }
                        }
                        // 마스코트 메뉴인 경우, sessionStorage에서 mascotThumbnailList의 첫 번째 항목으로 이동
                        if (sub.key === "mascort") {
                          const saved = sessionStorage.getItem("mascotThumbnailList");
                          if (!saved) {
                            alert("생성된 마스코트 이미지가 없습니다. 먼저 이미지를 생성해주세요.");
                            return;
                          }
                          try {
                            const list = JSON.parse(saved);
                            if (!list || list.length === 0) {
                              alert("생성된 마스코트 이미지가 없습니다. 먼저 이미지를 생성해주세요.");
                              return;
                            }
                            const first = list[0];
                            navigate(`/create/mascort/detail/${first.filePathNo}/${first.promptNo}`);
                            return;
                          } catch (e) {
                            console.error("mascotThumbnailList 파싱 오류:", e);
                            alert("마스코트 이미지 데이터를 불러오는 중 오류가 발생했습니다.");
                            return;
                          }
                        }
                        // 업로드 같은 다른 메뉴는 기본 경로로 이동
                        navigate(sub.path);
                      };

                      return (
                        <button
                          key={sub.key}
                          onClick={handleClick}
                          className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition font-bold ${
                            location.pathname.includes(sub.path)
                              ? "text-yellow-500 bg-gray-700"
                              : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
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
          <div className="flex w-full h-full">
            {/* ⭐ Page에서 setter 호출 가능하도록 context 내려줌 */}
            <main className="flex-1 overflow-hidden flex justify-center" style={{ height: 'calc(100vh - 112px)' }}>
              <Outlet
                context={{
                  setBasePrompt,
                  setFilePathNo,
                  setPromptNo,
                  setIndex,
                  setThumbnailList,
                  thumbnailList,
                  index,
                }}
              />
            </main>

            {/* ⭐ PromptSidebar로 전달됨 */}
            <PromptSidebar
              basePrompt={basePrompt}
              filePathNo={filePathNo}
              promptNo={promptNo}
              index={index}
              thumbnailList={thumbnailList}
              readonly={location.pathname.includes("/mascort")}
              onRegenerateComplete={() => {
                window.dispatchEvent(new CustomEvent("regenerate-complete"));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePromptLayout;
