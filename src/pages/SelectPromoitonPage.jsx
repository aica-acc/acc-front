import React, { useEffect, useState } from "react";
import SelectModal from "../components/select_promotion/SelectModal";
import { useNavigate } from "react-router-dom";
import { promotionItems } from "../assets/promotionItems";
import PromotionCard from "../components/select_promotion/PromotionCard";

export default function SelectPromotionPage() {
  const navigate = useNavigate();

  // UI용: { poster: ["logo_illustration", ...], mascot: [...], etc: [...] }
  // sessionStorage용: types: ["logo_illustration", "parking", ...] (구분 없이 통합)
  const [selectedPromotions, setSelectedPromotions] = useState({});
  const [modalData, setModalData] = useState(null); // {id,title,...} or null

  // 1) 세션에서 로드 (types 배열을 카테고리별로 분리)
  useEffect(() => {
    const raw = sessionStorage.getItem("types");
    if (raw) {
      const types = JSON.parse(raw);
      // types 배열을 카테고리별로 분리
      const separated = {};
      promotionItems.forEach((item) => {
        separated[item.id] = types.filter((type) =>
          item.subOptions.some((opt) => opt.value === type)
        );
      });
      setSelectedPromotions(separated);
    } else {
      // 기존 selectedPromotions 형식도 지원 (하위 호환성)
      const oldRaw = sessionStorage.getItem("selectedPromotions");
      if (oldRaw) {
        setSelectedPromotions(JSON.parse(oldRaw));
      }
    }
  }, []);

  // 2) 변경 시 저장 (types 배열로 통합 저장)
  useEffect(() => {
    // UI 상태를 types 배열로 변환
    const allTypes = [];
    Object.values(selectedPromotions).forEach((types) => {
      allTypes.push(...types);
    });
    sessionStorage.setItem("types", JSON.stringify(allTypes));
    
    // 하위 호환성을 위해 selectedPromotions도 저장 (필요시)
    // sessionStorage.setItem("selectedPromotions", JSON.stringify(selectedPromotions));
  }, [selectedPromotions]);

  // 모달 저장 콜백
  const handleSaveModal = (id, selectedValues) => {
    setSelectedPromotions(prev => ({ ...prev, [id]: selectedValues }));
    setModalData(null);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const all = {};
    promotionItems.forEach((it) => {
      all[it.id] = it.subOptions.map(opt => opt.value);
    });
    setSelectedPromotions(all);
  };
  const handleResetAll = () => {
    setSelectedPromotions({});
    sessionStorage.removeItem("types");
    sessionStorage.removeItem("selectedPromotions");
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">홍보물 종류 선택</h1>
        
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={handleSelectAll}
            className="border border-indigo-500 text-indigo-400 hover:bg-indigo-500/20 transition rounded-md px-5 py-2.5 text-base font-bold"
          >
            전체 선택
          </button>
          <button
            onClick={handleResetAll}
            className="border border-gray-500 text-gray-400 hover:bg-gray-500/20 transition rounded-md px-5 py-2.5 text-base font-bold"
          >
            전체 해제
          </button>
        </div>

        {/* 3개 카드 - 더 길게 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {promotionItems.map((item) => (
            <PromotionCard
              key={item.id}
              item={item}
              selectedOptions={selectedPromotions[item.id] || []}
              onClick={() => setModalData(item)}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/upload")}
            className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 text-white rounded-full px-8 py-3 font-semibold shadow-lg transition hover:scale-105"
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
    </div>
  );
}
