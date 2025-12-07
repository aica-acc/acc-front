import React from "react";

export default function SelectSidebar({ active, onChange }) {
  const categories = [
    { id: "poster", label: "포스터" },
    { id: "mascot", label: "마스코트" },
    { id: "etc", label: "기타" },
  ];

  return (
    <div className="flex gap-3 mb-6 sticky top-[80px] z-30 py-3 bg-[#0f1117]">
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={[
            "px-5 py-2 text-sm rounded-full border transition",
            active === c.id
              ? "bg-indigo-600 text-white border-indigo-500"
              : "border-gray-600 text-gray-300 hover:bg-gray-700",
          ].join(" ")}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
