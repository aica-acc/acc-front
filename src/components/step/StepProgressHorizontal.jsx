import React from "react";
import { useLocation } from "react-router-dom";

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
  { id: 3, name: "분석결과 확인", path: "/analyze" },
  { id: 4, name: "베이스 홍보물 선택", path: "/create/poster" },
  { id: 5, name: "확인 및 수정", path: "/editorpage" },
  { id: 6, name: "보도자료", path: "/create/secondary" },
];

export default function StepProgressHorizontal() {
  const { pathname } = useLocation();

  // 현재 단계 찾기
  const current = STEP_MAP.find((item) => item.match.test(pathname))?.step ?? 1;
  const activeStep = current;

  return (
    <div className="flex items-center gap-4">
      {/* 단계 표시 */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const active = activeStep === step.id;
          const done = step.id < activeStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold
                    ${active 
                      ? "bg-yellow-300 text-gray-900" 
                      : done 
                        ? "bg-gray-600 text-white" 
                        : "bg-gray-700 text-gray-400"}
                  `}
                >
                  {done ? "✓" : step.id}
                </div>
                <span
                  className={`
                    text-xs whitespace-nowrap font-medium
                    ${active ? "text-yellow-500" : done ? "text-gray-400" : "text-gray-500"}
                  `}
                >
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    w-6 h-0.5
                    ${done ? "bg-gray-600" : "bg-gray-700"}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}

