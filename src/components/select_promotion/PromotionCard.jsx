import React from "react";
import { Check } from "lucide-react";

/**
 * props
 * - item: { id, title, titleKo, icon, colors: { base, active }, subOptions: [{value, label}] }
 * - selectedOptions: string[] (영어 value 배열)
 * - onClick: () => void  // 모달 열기
 */
const PromotionCard = ({ item, selectedOptions = [], onClick }) => {
  const isSelected = selectedOptions.length > 0;
  const IconComponent = item.icon && typeof item.icon === 'function' ? item.icon : null;

  return (
    <div
      onClick={onClick}
      className={[
        "cursor-pointer rounded-2xl overflow-hidden transition",
        "border shadow-lg hover:shadow-xl flex flex-col justify-between h-full",
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-400/50"
          : "border-gray-700 hover:border-gray-600",
      ].join(" ")}
    >
      {/* 상단 헤더(색 영역) */}
      <div
        className={[
          "relative h-32 flex flex-col items-center justify-center",
          isSelected ? item.colors.active : item.colors.base,
        ].join(" ")}
      >
        {/* 우측 상단 원형 체크 */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        {/* 아이콘 + 타이틀 */}
        <div className="text-white" aria-hidden>
          {IconComponent ? (
            <IconComponent className="w-16 h-16" strokeWidth={1.5} />
          ) : (
            <span className="text-4xl leading-none">{item.icon}</span>
          )}
        </div>
        <div
          className={[
            "mt-3 text-2xl font-bold",
            "text-white",
          ].join(" ")}
        >
          {item.titleKo || item.title}
        </div>
      </div>

      {/* 하단 다크 영역 (중분류 + 안내문구 포함) */}
      <div className="bg-gray-800 px-6 py-6 flex flex-col flex-1 justify-between min-h-[200px]">
        <ul className="space-y-3">
          {item.subOptions.map((opt) => {
            const checked = selectedOptions.includes(opt.value);
            return (
              <li key={opt.value} className="flex items-center gap-2">
                {checked ? (
                  <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                ) : (
                  <span className="w-5 h-5 shrink-0" />
                )}
                <span className="text-gray-300 text-base">{opt.label}</span>
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
