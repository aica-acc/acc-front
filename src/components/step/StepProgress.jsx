import React from "react";
import { useLocation } from "react-router-dom";

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

export default function StepProgress({ total = 7 }) {
  const { pathname } = useLocation();

  // 현재 단계 찾기
  const current =
    STEP_MAP.find((item) => item.match.test(pathname))?.step ?? 1;

  return (
    <div>
      <p className="text-sm text-gray-700 mb-1 font-medium">
        전체 진행률 {current} / {total}
      </p>

      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}