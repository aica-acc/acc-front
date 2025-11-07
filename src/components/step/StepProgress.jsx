import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const steps = [
  { id: 1, title: "홍보물 선택", path: "/select" },
  { id: 2, title: "기획서 업로드", path: "/upload" },
  { id: 3, title: "분석", path: "/analyze" },
  { id: 4, title: "프롬프트 생성", path: "/create" },
  { id: 5, title: "수정", path: "/edit" },
];

const StepProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 경로 기반으로 활성 단계 계산
  const currentStep =
    steps.findIndex((step) =>
      location.pathname.startsWith(step.path)
    ) + 1 || 1;

  return (
    <div className="flex justify-center items-center gap-6 py-6">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            {/* 각 단계 */}
            <div
              className="flex flex-col items-center cursor-pointer select-none"
              onClick={() =>
                step.path && step.id <= currentStep
                  ? navigate(step.path)
                  : undefined
              }
            >
              {/* 원형 표시 */}
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 ${
                  isCompleted
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isActive
                    ? "bg-blue-600 text-white shadow-[0_0_0_4px_rgba(22,103,240,0.15)]"
                    : "bg-gray-200 text-gray-500 border-gray-300"
                }`}
              >
                {isCompleted ? "✓" : step.id}
              </div>

              {/* 텍스트 */}
              <p
                className={`mt-2 text-sm ${
                  isActive
                    ? "text-gray-900 font-semibold"
                    : isCompleted
                    ? "text-gray-800"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </p>
            </div>

            {/* 단계 사이의 선 */}
            {index < steps.length - 1 && (
              <div
                className={`w-10 h-[2px] rounded-full ${
                  isCompleted ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgress;
