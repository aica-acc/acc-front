// src/components/studio/LeftSidebar.jsx
import React from "react";
import BackButton from "../components/buttons/BackButton";
import StepProgress from "../components/step/StepProgress";
import { useLocation, useNavigate } from "react-router-dom";

export default function LeftSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const steps = [
    { id: 1, name: "홍보물 선택", path: "/select" },
    { id: 2, name: "기획서 업로드", path: "/upload" },
    { id: 3, name: "분석", path: "/analyze" },
    { id: 4, name: "메인 홍보물 제작", path: "/create/poster" },
    { id: 5, name: "파생 홍보물 선택", path: "/select/secondary" },
    { id: 6, name: "파생 홍보물 제작", path: "/create/secondary" },
    { id: 7, name: "확인", path: "/confirm" },
  ];

  const stepMap = {
    "/select": 1,
    "/upload": 2,
    "/analyze": 3,
    "/create/poster": 4,
  };

  const current = stepMap[pathname] || 1;

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 h-full flex flex-col px-5 py-6 gap-6">
      {/* 🔹 BackButton 섹션 + 구분선 */}
      <div className="pb-4 mb-2 border-b border-gray-400">
        <BackButton />
      </div>

      {/* 🔹 진행률 */}
      <StepProgress />

      {/* 🔹 단계 리스트 */}
      <div className="flex flex-col gap-2 mt-2">
        {steps.map((step) => {
          const active = current === step.id;
          const done = step.id < current;
          const upcoming = step.id > current;

          return (
            <button
              key={step.id}
              onClick={() => !upcoming && navigate(step.path)}
              disabled={upcoming}
              className={`
                w-full text-left px-3 py-2 rounded-lg flex items-center gap-3
                transition-all duration-150
                ${
                  active
                    ? "bg-gray-200 text-gray-900"
                    : done
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-400"
                }
                ${upcoming ? "cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div
                className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                  ${
                    active
                      ? "bg-white text-gray-900 border border-gray-400"
                      : done
                      ? "bg-gray-800 text-white"
                      : "bg-gray-300 text-white"
                  }
                `}
              >
                {done ? "✓" : step.id}
              </div>

              <span className="text-sm">{step.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
