// src/components/editor/toolbar/ColorPickerPopover.jsx
import React, { useState } from "react";

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#f97316",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#ec4899",
  "#facc15",
  "#dc2626",
  "#111827",
];

const ColorPickerPopover = ({ color, onChange }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(color || "#ffffff");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(value)) {
      onChange(value);
    }
  };

  const handleColorChange = (e) => {
    setInput(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative inline-block">
      {/* 현재 색상 미리보기 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded border border-gray-500 bg-transparent flex items-center justify-center"
      >
        <span
          className="block w-5 h-5 rounded"
          style={{ backgroundColor: color }}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 p-3 bg-[#1f2933] border border-gray-600 rounded shadow-lg w-56">
          {/* 상단: native color input */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={input}
              onChange={handleColorChange}
              className="w-8 h-8 border-none bg-transparent"
            />
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              className="flex-1 bg-[#111827] text-xs text-gray-100 px-2 py-1 rounded border border-gray-600"
              placeholder="#FFFFFF"
            />
          </div>

          {/* 프리셋 컬러들 */}
          <div className="grid grid-cols-5 gap-1 mb-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setInput(c);
                  onChange(c);
                }}
                className="w-6 h-6 rounded border border-gray-700"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-gray-300 hover:text-white"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPickerPopover;
