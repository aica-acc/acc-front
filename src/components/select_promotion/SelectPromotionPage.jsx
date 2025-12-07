// src/pages/select_promotion/SelectPromotionPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SelectSidebar from "../../components/select_promotion/SelectSidebar";
import PromotionCard from "../../components/select_promotion/PromotionCard";
import SelectInspirationViewer from "../../components/select_promotion/SelectInspirationViewer";

import { promotionItems } from "../../assets/promotionItems";

export default function SelectPromotionPage() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("poster");
  const [selectedMap, setSelectedMap] = useState({});

  /* -----------------------------------------
   * 1. 세션 로드
   * ----------------------------------------- */
  useEffect(() => {
    const raw = sessionStorage.getItem("types");
    if (!raw) return;

    const types = JSON.parse(raw);
    const separated = {};

    promotionItems.forEach((cat) => {
      separated[cat.id] = types.filter((t) =>
        cat.subOptions.some((opt) => opt.value === t)
      );
    });

    setSelectedMap(separated);
  }, []);

  /* -----------------------------------------
   * 2. 세션 저장
   * ----------------------------------------- */
  useEffect(() => {
    const merged = [];
    Object.values(selectedMap).forEach((arr) => merged.push(...arr));
    sessionStorage.setItem("types", JSON.stringify(merged));
  }, [selectedMap]);

  const currentCategory = promotionItems.find(
    (p) => p.id === activeCategory
  );

  /* -----------------------------------------
   * 3. 옵션 선택/해제
   * ----------------------------------------- */
  const toggleOption = (value) => {
    setSelectedMap((prev) => {
      const list = prev[activeCategory] || [];
      const updated = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];

      return { ...prev, [activeCategory]: updated };
    });
  };

  /* -----------------------------------------
   * 4. 전체 선택 / 전체 해제
   * ----------------------------------------- */
  const handleSelectAll = () => {
    setSelectedMap((prev) => ({
      ...prev,
      [activeCategory]: currentCategory.subOptions.map((o) => o.value),
    }));
  };

  const handleClearAll = () => {
    setSelectedMap((prev) => ({
      ...prev,
      [activeCategory]: [],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white px-10 py-6">

      {/* 🔥 상단 카테고리 탭 */}
      <div className="w-full flex justify-center mb-8">
        <SelectSidebar
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* 🔥 홍보물 옵션 선택 영역 (영감 이미지보다 위로!) */}
      <div className="flex justify-between items-center mb-4 mt-2">
        <h2 className="text-2xl font-bold">선택 옵션</h2>

        <div className="flex gap-3">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            전체 선택
          </button>

          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* 🔥 카드 리스트 */}
      <PromotionCard
        category={activeCategory}
        selected={selectedMap[activeCategory] || []}
        onToggle={toggleOption}
      />

      {/* 🔥 다음 단계 버튼을 카드와 영감 이미지 사이에 배치 */}
      <div className="flex justify-center mt-10 mb-10">
        <button
          onClick={() => navigate("/upload")}
          className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500
                     hover:brightness-110 text-white rounded-full px-10 py-4
                     font-semibold shadow-lg transition hover:scale-105"
        >
          다음 단계
        </button>
      </div>

      {/* 🔥 영감 이미지 (맨 아래로 이동) 
        이거 나중에 
      */}
      {/* <SelectInspirationViewer category={activeCategory} /> */}
    </div>
  );
}
