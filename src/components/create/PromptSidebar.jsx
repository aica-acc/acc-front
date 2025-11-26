import React, { useEffect, useState } from "react";
import { Poster } from "../../utils/api/PosterAPI";

export default function PromptSidebar({
  basePrompt = "",
  filePathNo,
  promptNo,
  index,
  thumbnailList,
  onRegenerateComplete, // 부모에게 알려주는 콜백
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrompt(basePrompt || "");
  }, [basePrompt]);

  const handleSubmit = () => {
    if (!filePathNo) {
      alert("파일 번호를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);

    Poster.updatePosterInfo(filePathNo, prompt)
      .then((data) => {
        console.log("재생성 성공:", data);

        // 부모에게 재생성이 완료되었다고 알려서 detail을 새로 불러오게 함
        onRegenerateComplete?.();

      })
      .catch((err) => {
        console.error("재생성 실패:", err);
        alert("이미지 재생성 실패했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <aside className="w-[22vw] min-w-[320px] max-w-[420px] bg-gray-50 border-l border-gray-200 flex flex-col">

      {/* 로딩 전면 블러 처리 */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="animate-spin h-10 w-10 border-4 border-gray-400 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* ---------------------------- */}
      {/* 기존 UI 그대로 유지 */}
      {/* ---------------------------- */}

      <div className="px-5 pt-5 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">프롬프트</h2>
        <p className="text-sm text-gray-500 mb-4">이미지를 생성하거나 수정하세요</p>

        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
          {basePrompt || "초안 프롬프트가 여기에 들어갑니다."}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">프롬프트 작성 팁</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>구체적인 설명을 적을수록 좋습니다.</li>
          <li>색감, 분위기, 스타일을 명시하세요.</li>
          <li>고해상도 언급을 추가할 수 있습니다.</li>
        </ul>
      </div>

      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
        <textarea
          className="w-full h-28 border border-gray-300 rounded-lg p-3 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-800"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="새로운 프롬프트를 입력하세요"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-3 py-3 rounded-lg text-white text-sm font-medium transition
            ${loading ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"}`}
        >
          {loading ? "이미지 생성 중..." : "이미지 생성하기"}
        </button>

      </div>
    
    </aside>
  );
}
