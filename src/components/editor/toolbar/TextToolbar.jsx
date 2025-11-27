// src/components/editor/toolbar/TextToolbar.jsx
import React from "react";
import ColorPickerPopover from "./ColorPickerPopover";

// 간단한 폰트 드롭다운 (스크롤 가능)
const FontDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const activeOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative inline-block text-[11px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-w-[140px] h-7 px-2 bg-[#111827] border border-gray-600 rounded flex items-center justify-between text-gray-100"
      >
        <span className="truncate">{activeOption.label}</span>
        <span className="ml-1 text-[10px]">▼</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-[#111827] border border-gray-700 rounded shadow-lg max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-2 py-1 text-[11px] hover:bg-gray-700 ${
                opt.value === value ? "bg-gray-800" : ""
              }`}
              style={{ fontFamily: opt.value }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TextToolbar = ({
  visible,
  textStyle,
  fontOptions,
  onChangeFontFamily,
  onChangeColor,
  onChangeFontSize,
  onChangeAlign,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrike,
  onUndo,
  onRedo,
}) => {
  if (!visible) return null;

  const {
    color,
    fontSize,
    align,
    bold,
    italic,
    underline,
    strike,
    fontFamily,
  } = textStyle || {};

  return (
    <div className="h-11 bg-[#111111] text-gray-100 flex items-center px-4 border-b border-black gap-4 text-xs">
      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={onRedo}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800"
        >
          ↻
        </button>
      </div>

      {/* 색상 + 폰트 */}
      <div className="flex items-center gap-2">
        <ColorPickerPopover color={color} onChange={onChangeColor} />

        <FontDropdown
          value={fontFamily}
          options={fontOptions}
          onChange={onChangeFontFamily}
        />
      </div>

      {/* 폰트 사이즈 */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={fontSize}
          onChange={(e) => onChangeFontSize(Number(e.target.value) || 1)}
          className="w-14 bg-[#111827] border border-gray-600 rounded px-1 py-1 text-[11px] text-gray-100"
        />
        <span className="text-[10px] text-gray-400">pt</span>
      </div>

      {/* 정렬 */}
      <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
        {[
          { id: "left", label: "≡" },
          { id: "center", label: "≣" },
          { id: "right", label: "≡" },
          { id: "justify", label: "≡" },
        ].map((opt, idx) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChangeAlign(opt.id)}
            className={`w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800 ${
              align === opt.id ? "bg-gray-700" : ""
            } ${idx === 2 ? "rotate-180" : ""}`}
          >
            <span className="text-[11px]">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* 스타일 토글 B I U S */}
      <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
        <button
          type="button"
          onClick={onToggleBold}
          className={`w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800 ${
            bold ? "bg-gray-700" : ""
          }`}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={onToggleItalic}
          className={`w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800 ${
            italic ? "bg-gray-700" : ""
          }`}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={onToggleUnderline}
          className={`w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800 ${
            underline ? "bg-gray-700" : ""
          }`}
        >
          <span className="underline">U</span>
        </button>
        <button
          type="button"
          onClick={onToggleStrike}
          className={`w-7 h-7 flex items-center justify-center rounded hover:bg-gray-800 ${
            strike ? "bg-gray-700" : ""
          }`}
        >
          <span className="line-through">S</span>
        </button>
      </div>
    </div>
  );
};

export default TextToolbar;
