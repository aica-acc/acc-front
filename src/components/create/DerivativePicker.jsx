import React from "react";
import { promotionItems } from "../../assets/promotionItems";

// 영상 생성은 비용 때문에 막아 두었다 (선택 불가로 표시)
const DISABLED_TYPES = new Set(["poster_video", "mascot_video", "etc_video"]);

/**
 * 베이스 이미지로 만들 파생물 선택 패널 (포스터 / 마스코트 상세 화면 오른쪽).
 *
 * 값은 프로젝트의 types(유형 선택 화면에서 고른 전체 목록)를 그대로 쓴다.
 * 이 패널에서 바꾸면 해당 카테고리 항목만 갱신하고, 다른 카테고리의 선택은 유지한다.
 * "파생 만들기"는 같은 types 를 읽으므로 여기서 고른 것이 그대로 반영된다.
 */
export default function DerivativePicker({ category, types, onChange, onSubmit, submitting = false }) {
  const group = promotionItems.find((p) => p.id === category);
  if (!group) return null;

  const options = group.subOptions;
  const selectedHere = options.filter((o) => types.includes(o.value)).length;

  const toggle = (value) => {
    if (DISABLED_TYPES.has(value)) return;
    onChange(types.includes(value) ? types.filter((t) => t !== value) : [...types, value]);
  };

  return (
    <aside className="w-64 shrink-0 h-full flex flex-col rounded-xl bg-gray-800/80 border border-gray-700">
      <div className="px-4 pt-4 pb-3 border-b border-gray-700">
        <h3 className="text-sm font-bold text-white">만들 파생물</h3>
        <p className="mt-1 text-xs text-gray-400">
          이 {group.titleKo}로 만들 홍보물 · {selectedHere}개 선택
        </p>
      </div>

      <ul className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {options.map((o) => {
          const disabled = DISABLED_TYPES.has(o.value);
          const checked = types.includes(o.value);
          return (
            <li key={o.value}>
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  disabled
                    ? "text-gray-500 cursor-not-allowed"
                    : checked
                    ? "bg-indigo-600/30 text-white cursor-pointer"
                    : "text-gray-300 hover:bg-gray-700 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-indigo-500"
                  checked={checked && !disabled}
                  disabled={disabled}
                  onChange={() => toggle(o.value)}
                />
                <span className="flex-1">{o.label}</span>
                {disabled && <span className="text-[10px] text-gray-500">준비 중</span>}
              </label>
            </li>
          );
        })}
      </ul>

      {onSubmit && (
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-all bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60"
          >
            파생 만들기
          </button>
        </div>
      )}
    </aside>
  );
}
