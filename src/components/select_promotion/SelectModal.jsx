import React, { useState } from "react";
import { X } from "lucide-react";

const SelectModal = ({ data, onClose, onSave, defaultSelected = [] }) => {
  // defaultSelected는 영어 value 배열
  const [selected, setSelected] = useState(defaultSelected);

  const toggleSelect = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSave = () => {
    // 영어 value 배열로 저장
    onSave(selected);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50" style={{ paddingTop: '128px' }}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-[500px] max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{data.titleKo || data.title} 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 p-4 border-b border-gray-700">
          <button 
            className="text-base font-bold px-4 py-2 border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition rounded-md"
            onClick={() => setSelected([])}
          >
            전체해제
          </button>  
          <button 
            className="text-base font-bold px-4 py-2 border border-indigo-500 text-indigo-400 hover:bg-indigo-500/20 transition rounded-md"
            onClick={() => setSelected(data.subOptions.map(opt => opt.value))}
          >
            전체선택
          </button>
        </div>

        <div className="flex flex-col gap-2 p-6 overflow-y-auto flex-1">
          {data.subOptions.map((opt) => (
            <label 
              key={opt.value} 
              className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-700/50 transition"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggleSelect(opt.value)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="text-gray-300 text-base">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button 
            className="text-base font-bold px-5 py-2.5 border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition rounded-md"
            onClick={onClose}
          >
            취소
          </button>
          
          <button 
            className="text-base font-bold px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black transition rounded-md"
            onClick={handleSave}
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectModal;
