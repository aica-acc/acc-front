import React, { useState } from "react";
import { X } from "lucide-react";

const SelectModal = ({ data, onClose, onSave, defaultSelected = [] }) => {
  const [selected, setSelected] = useState(defaultSelected);

  const toggleSelect = (option) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSave = () => {
    onSave(selected);
  };

  return (
    <div className="fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold">{data.title} 선택</h2>
          <X className="cursor-pointer text-gray-500" onClick={onClose} />
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button 
          className="text-sm px-1 py-0.5 border border-gray-400 text-gray-600 hover:bg-gray-100 transition rounded-md"
          variant="outline" onClick={() => setSelected([])}>전체해제
          </button>  
          <button 
          className="text-sm px-1 py-0.5 border border-blue-500 text-blue-500 hover:bg-blue-50 transition rounded-md "
          variant="outline" onClick={() => setSelected(data.subOptions)}>전체선택
          </button>
         
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {data.subOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleSelect(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button 
          className="text-sm px-1 py-0.5 border border-black-500 text-black-500 hover:bg-blue-50 transition rounded-md "
          variant="outline" onClick={onClose}>취소
          </button>
          
          <button 
          className="text-sm px-1 py-0.5 border border-blue-500 text-blue-500 hover:bg-blue-50 transition rounded-md"
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
