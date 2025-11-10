import React, { useEffect, useState } from "react";
import SelectModal from "../components/select_promotion/SelectModal";
import { useNavigate } from "react-router-dom";
import { promotionItems } from "../assets/promotionItems";
import PromotionCard from "../components/select_promotion/PromotionCard";

export default function SelectPromotionPage() {
  const navigate = useNavigate();

  // { video: ["인스타용 (20초)"], poster: [...], ... }
  const [selectedPromotions, setSelectedPromotions] = useState({});
  const [modalData, setModalData] = useState(null); // {id,title,...} or null

  // 1) 세션에서 로드
  useEffect(() => {
    const raw = sessionStorage.getItem("selectedPromotions");
    if (raw) setSelectedPromotions(JSON.parse(raw));
  }, []);

  // 2) 변경 시 저장
  useEffect(() => {
    sessionStorage.setItem("selectedPromotions", JSON.stringify(selectedPromotions));
  }, [selectedPromotions]);

  // 모달 저장 콜백
  const handleSaveModal = (id, selectedOptions) => {
    setSelectedPromotions(prev => ({ ...prev, [id]: selectedOptions }));
    setModalData(null);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const all = {};
    promotionItems.forEach((it) => (all[it.id] = [...it.subOptions]));
    setSelectedPromotions(all);
  };
  const handleResetAll = () => {
    setSelectedPromotions({});
    sessionStorage.removeItem("selectedPromotions");
  };

  return (
    <div className="bg-neutral-900 px-8 py-10">
      <div className="bg-neutral-900 flex justify-end gap-2 mb-4">
        <button
          onClick={handleSelectAll}
          className="border border-blue-500 text-blue-500 hover:bg-blue-50 transition rounded-md px-4 py-2 text-sm font-medium"
        >
          전체 선택
        </button>
        <button
          onClick={handleResetAll}
          className="border border-gray-400 text-gray-600 hover:bg-gray-100 transition rounded-md px-4 py-2 text-sm font-medium"
        >
          전체 해제
        </button>
      </div>

      {/* 여기서 map — promotionItems가 배열이면 당연히 렌더됩니다 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotionItems.map((item) => (
          <PromotionCard
            key={item.id}
            item={item}
            selectedOptions={selectedPromotions[item.id] || []}
            onClick={() => setModalData(item)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/upload")}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-6 py-2 font-medium"
        >
          다음 단계
        </button>
      </div>

      {/* 공통 모달 */}
      {modalData && (
        <SelectModal
          data={modalData}
          defaultSelected={selectedPromotions[modalData.id] || []}
          onClose={() => setModalData(null)}
          onSave={(selected) => handleSaveModal(modalData.id, selected)}
        />
      )}
    </div>
  );
}
