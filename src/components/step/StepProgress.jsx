import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * 진짜 유지보수 편한 URL → 단계 매핑 테이블
 * 어떤 URL 구조든 정확한 단계 매칭 가능
 */
const STEP_MAP = [
  { step: 1, match: /^\/select/ },
  { step: 2, match: /^\/upload/ },
  { step: 3, match: /^\/analyze/ },
  { step: 4, match: /^\/create\/poster/ },
  { step: 5, match: /^\/select\/secondary/ },
  { step: 6, match: /^\/create\/secondary/ },
  { step: 7, match: /^\/confirm/ },
];

const STEPS = [
  { id: 1, name: "홍보물 선택", path: "/select" },
  { id: 2, name: "기획서 업로드", path: "/upload" },
  { id: 3, name: "분석", path: "/analyze" },
  { id: 4, name: "메인 홍보물 제작", path: "/create/poster" },
  { id: 5, name: "파생 홍보물 선택", path: "/select/secondary" },
  { id: 6, name: "파생 홍보물 제작", path: "/create/secondary" },
  { id: 7, name: "확인", path: "/confirm" },
];

export default function StepProgress({ total = 7 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // 현재 단계 찾기
  const current =
    STEP_MAP.find((item) => item.match.test(pathname))?.step ?? 1;

  // StepProgress가 자동으로 계산하므로 여기에는 표시목적 current만 필요
  const activeStep = current;

  return (
    <div className="flex flex-col gap-2">
      {STEPS.map((step) => {
        const active = activeStep === step.id;
        const done = step.id < activeStep;
        const upcoming = step.id > activeStep;

        return (
          <button
            key={step.id}
            onClick={() => !upcoming && navigate(step.path)}
            disabled={upcoming}
            className={`
              w-full text-left px-3 py-2 rounded-lg flex items-center gap-3
              transition-all duration-150
              ${active ? "bg-gray-700 text-white" :
                done ? "bg-gray-800 text-gray-300" :
                    "bg-gray-800 text-gray-500"}
              ${upcoming ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-700"}
            `}
          >
            <div
              className={`
                w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                ${active ? "bg-white text-gray-900 border border-gray-400"
                         : done ? "bg-indigo-600 text-white"
                                : "bg-gray-600 text-gray-300"}
              `}
            >
              {done ? "✓" : step.id}
            </div>

            <span className="text-sm">{step.name}</span>
          </button>
        );
      })}
    </div>
  );
}
