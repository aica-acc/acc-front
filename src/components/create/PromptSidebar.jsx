import React, { useEffect, useState } from "react";
import { Poster } from "../../utils/api/PosterAPI";

const TIPS = [
  "구체적인 대상과 장면을 적을수록 좋습니다.",
  "색감, 분위기, 스타일을 명시하세요.",
  "넣고 싶지 않은 요소는 'no ...' 로 적으세요.",
];

/**
 * 프롬프트 패널 (생성 화면 오른쪽).
 * 미리 작성된 프롬프트를 입력창 하나로 보여 주고, 고쳐서 이미지를 다시 만든다.
 * (예전에는 원문 박스와 입력창에 같은 내용이 두 번 보여 공간을 차지했다)
 */
export default function PromptSidebar({
  basePrompt = "",
  filePathNo,
  promptNo,
  index,
  thumbnailList,
  onRegenerateComplete, // 부모에게 알려주는 콜백
  readonly = false, // 읽기 전용 모드 (마스코트용)
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrompt(basePrompt || "");
  }, [basePrompt]);

  const edited = prompt.trim() !== (basePrompt || "").trim();
  const canSubmit = !readonly && !loading && edited && prompt.trim() !== "";

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
    // 높이는 레이아웃 본문을 그대로 채운다 (이미지·파생물 패널과 위아래 선을 맞춤)
    <aside className="relative w-[360px] shrink-0 h-full min-h-0 flex flex-col overflow-hidden rounded-xl bg-gray-800 border border-gray-700">
      {/* 로딩 전면 블러 처리 */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col gap-3 items-center justify-center z-20">
          <div className="animate-spin h-10 w-10 border-4 border-gray-400 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-300">이미지를 다시 만들고 있습니다...</p>
        </div>
      )}

      {/* 제목 + 작성 팁 */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-700">
        <h3 className="text-sm font-bold text-white">프롬프트</h3>
        <p className="mt-1 text-xs text-gray-400">
          {readonly ? "이 이미지를 만든 프롬프트입니다." : "프롬프트를 고쳐서 이미지를 다시 만들 수 있습니다."}
        </p>
        {!readonly && (
          <ul className="mt-3 space-y-1 text-xs text-gray-400 list-disc list-inside">
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
      </div>

      {/* 미리 작성된 프롬프트 (입력창 하나, 남은 높이를 모두 사용) */}
      <div className="flex-1 min-h-0 flex flex-col px-4 py-3">
        <textarea
          className="flex-1 min-h-0 w-full border border-gray-600 rounded-lg p-3 bg-gray-700 text-gray-200 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 read-only:opacity-80"
          value={prompt}
          readOnly={readonly}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="프롬프트를 입력하세요"
        />
        <div className="h-6 mt-1 flex items-center justify-between text-xs">
          {edited && !readonly ? (
            <>
              <span className="text-yellow-400">수정됨</span>
              <button type="button" className="text-gray-400 hover:text-white" onClick={() => setPrompt(basePrompt || "")}>
                원래대로
              </button>
            </>
          ) : (
            <span className="text-gray-500">{prompt.length}자</span>
          )}
        </div>
      </div>

      {/* 이미지 수정 */}
      {!readonly && (
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            title={edited ? "" : "프롬프트를 고치면 활성화됩니다"}
            className="w-full py-3 rounded-lg text-white text-sm font-semibold transition bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "이미지 수정 중..." : "이미지 수정하기"}
          </button>
        </div>
      )}
    </aside>
  );
}
