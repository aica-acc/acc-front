import React, { useEffect, useState } from "react";

export default function PromptSidebar({ basePrompt = "", onSubmit }) {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    setPrompt(basePrompt || "");
  }, [basePrompt]);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(prompt);
    } else {
      console.log("이미지 생성 요청 프롬프트:", prompt);
    }
  };

  return (
    <aside className="w-[22vw] min-w-[320px] max-w-[420px] bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* (A) 상단: 타이틀 + 초안 프롬프트 카드 */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">프롬프트</h2>
        <p className="text-sm text-gray-500 mb-4">
          이미지를 생성하거나 수정하세요
        </p>

        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
          {basePrompt && basePrompt.trim().length > 0
            ? basePrompt
            : "초안 프롬프트가 여기에 들어갑니다."}
        </div>
      </div>

      {/* (B) 가운데: 프롬프트 작성 팁 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          프롬프트 작성 팁
        </h3>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>구체적인 설명을 적을수록 좋습니다.</li>
          <li>색감, 분위기, 스타일을 명시하세요.</li>
          <li>고해상도 언급(4K 등)을 추가할 수 있습니다.</li>
        </ul>
      </div>

      {/* (C) 하단: 입력창 + 버튼 (항상 사이드바 맨 아래 고정) */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
        <textarea
          className="w-full h-28 border border-gray-300 rounded-lg p-3 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="새로운 프롬프트를 입력하세요"
        />
        <button
          onClick={handleSubmit}
          className="w-full mt-3 py-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
        >
          이미지 생성하기
        </button>
      </div>
    </aside>
  );
}
