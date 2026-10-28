import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endDemoSession } from "../../utils/demo";

/**
 * 데모 계정 제한(DEMO)·크레딧 부족(CREDIT) 안내. BaseAPI 응답 인터셉터가 acc:notice 이벤트로 알려 준다.
 * 같은 안내가 연달아 오면(자동 저장 등) 한 번만 띄운다.
 */
export default function ApiNotice() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    const onNotice = (e) => {
      const { code, message } = e.detail || {};
      setNotice((prev) => (prev && prev.code === code ? prev : { code, message }));
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(null), 8000);
    };
    window.addEventListener("acc:notice", onNotice);
    return () => {
      window.removeEventListener("acc:notice", onNotice);
      clearTimeout(timer.current);
    };
  }, []);

  if (!notice) return null;

  const isDemo = notice.code === "DEMO";
  const action = isDemo
    ? {
        label: "회원가입하고 직접 만들기",
        run: () => {
          endDemoSession();
          navigate("/login");
        },
      }
    : { label: "내 크레딧 보기", run: () => navigate("/mypage/profile") };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[min(560px,calc(100vw-32px))]">
      <div className="rounded-xl border border-indigo-400/40 bg-gray-900/95 shadow-2xl px-5 py-4 text-sm text-gray-100">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded bg-indigo-500 text-white text-xs font-bold">
            {isDemo ? "데모" : "크레딧"}
          </span>
          <p className="flex-1 leading-relaxed">{notice.message}</p>
          <button onClick={() => setNotice(null)} className="text-gray-400 hover:text-white" aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              setNotice(null);
              action.run();
            }}
            className="px-4 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
          >
            {action.label}
          </button>
        </div>
      </div>
    </div>
  );
}
