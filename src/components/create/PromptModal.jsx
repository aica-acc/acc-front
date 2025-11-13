import React, { useEffect, useState } from "react";

const PromptModal = ({ open, onClose, promptData, onSave, type = "poster" }) => {
  const [localData, setLocalData] = useState(promptData || {});

  // 모달이 열릴 때 선택한 데이터로 초기화
  useEffect(() => {
    setLocalData(promptData || {});
  }, [promptData]);

  if (!open) return null;

  // ✅ 실시간 프리뷰 반영
  const handleChange = (e) => {
    const updated = { ...localData, content: e.target.value };
    setLocalData(updated);
    onSave(updated);
  };

  // ✅ 저장 버튼 클릭 시: sessionStorage + 부모 state 동시 반영
  const handleSaveClick = () => {
    try {
      const raw = sessionStorage.getItem("prompts");
      const all = raw ? JSON.parse(raw) : {};

      const updated = {
        ...all,
        [type]: {
          ...(all[type] || {}),
          [localData.id]: localData,
        },
      };

      sessionStorage.setItem("prompts", JSON.stringify(updated));
      onSave(localData);
      onClose();

      console.log(`💾 [${type}] 프롬프트 세션 및 state 반영 완료`, localData);
    } catch (err) {
      console.error("❌ 세션 저장 중 오류:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4">프롬프트 편집</h2>

        <textarea
          className="w-full h-64 border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          value={localData.content || ""}
          onChange={handleChange}
        />

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
