import React, { useEffect, useState } from "react";
import PromptCard from "../../components/create/PromptCard";
import PromptModal from "../../components/create/PromptModal";

const CreatePosterPromptPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // ✅ 1. 페이지 진입 시 sessionStorage에서 복원
  useEffect(() => {
    const raw = sessionStorage.getItem("prompts");
    if (raw) {
      const data = JSON.parse(raw);
      if (data.poster && Object.keys(data.poster).length > 0) {
        // 기존에 저장된 프롬프트 있으면 그대로 복원
        const restored = Object.values(data.poster);
        setPrompts(restored);
        console.log("📦 세션에서 포스터 프롬프트 복원됨:", restored);
        return;
      }
    }

    // ✅ 없으면 '홍보물 선택'에서 가져온 선택 항목으로 초기 생성
    const selectedRaw = sessionStorage.getItem("selectedPromotions");
    if (selectedRaw) {
      const data = JSON.parse(selectedRaw);
      const posters = data.poster || [];
      const newPrompts = posters.map((name, idx) => ({
        id: idx + 1,
        title: name,
        content: `담양 크리스마스 판타 축제 포스터 (${name}) 디자인 프롬프트 예시입니다.`,
      }));
      setPrompts(newPrompts);
      console.log("🆕 선택된 포스터 목록으로 초기화됨:", newPrompts);
    }
  }, []);

  // ✅ 프롬프트 수정 핸들러 (카드 실시간 반영)
  const handleSave = (newData) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === newData.id ? newData : p))
    );
  };

  const handleEdit = (item) => {
    setSelectedPrompt(item);
    setModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-6">포스터 프롬프트 생성</h2>

      {prompts.length === 0 ? (
        <p className="text-gray-500">
          ⚠️ 선택된 포스터 항목이 없습니다. 먼저 홍보물 선택 페이지에서 선택해주세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {prompts.map((item) => (
            <PromptCard key={item.id} item={item} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <PromptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        promptData={selectedPrompt}
        onSave={handleSave}
        type="poster"
      />
    </div>
  );
};

export default CreatePosterPromptPage;
