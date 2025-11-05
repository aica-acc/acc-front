import React from "react";
import { Check } from "lucide-react";

/**
 * props
 * - item: { id, title, icon, colors: { base, active }, subOptions: string[] }
 * - selectedOptions: string[]
 * - onClick: () => void  // 모달 열기
 */
const PromotionCard = ({ item, selectedOptions = [], onClick }) => {
  const isSelected = selectedOptions.length > 0;

  return (
    <div
      onClick={onClick}
      className={[
        "cursor-pointer rounded-2xl overflow-hidden transition",
        "border shadow-sm hover:shadow-md flex flex-col justify-between", // ✅ 전체 카드 세로정렬
        isSelected
          ? "border-blue-500 ring-2 ring-blue-300"
          : "border-gray-200",
      ].join(" ")}
    >
      {/* 상단 헤더(색 영역) */}
      <div
        className={[
          "relative h-28 flex flex-col items-center justify-center",
          isSelected ? item.colors.active : item.colors.base,
        ].join(" ")}
      >
        {/* 우측 상단 원형 체크 */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        {/* 아이콘 + 타이틀 */}
        <div
          className={[
            "text-3xl leading-none",
            isSelected ? "text-white" : "text-gray-700",
          ].join(" ")}
          aria-hidden
        >
          {item.icon}
        </div>
        <div
          className={[
            "mt-2 text-base font-semibold",
            isSelected ? "text-white" : "text-gray-800",
          ].join(" ")}
        >
          {item.title}
        </div>
      </div>

      {/* 하단 흰 영역 (중분류 + 안내문구 포함) */}
      <div className="bg-white px-6 py-5 flex flex-col flex-1 justify-between">
        <ul className="space-y-3">
          {item.subOptions.map((opt) => {
            const checked = selectedOptions.includes(opt);
            return (
              <li key={opt} className="flex items-center gap-2">
                {checked ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <span className="w-4 h-4 shrink-0" />
                )}
                <span className="text-gray-700">{opt}</span>
              </li>
            );
          })}
        </ul>

        {/* ✅ 항상 카드 하단 동일 위치에 */}
        {!isSelected && (
          <div className="pt-4 text-center text-sm text-gray-500">
            클릭하여 옵션 선택
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionCard;
