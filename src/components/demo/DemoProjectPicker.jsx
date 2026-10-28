import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/BaseAPI";
import { openProject } from "../../utils/project";
import { useAuthStore } from "../../store/authStore";

/**
 * 데모(test) 계정의 시작 화면. 새 기획서를 분석하는 대신, 미리 만들어 둔 축제 프로젝트를 골라
 * 분석 결과 → 홍보물 선택 → 생성 → 에디터 → 리포트를 실제 흐름 그대로 따라가 본다.
 * 생성 단계는 미리 만든 결과를 바로 보여 주고, 새로 만들거나 저장하지는 않는다.
 */
export default function DemoProjectPicker() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    api
      .get("/api/mypage/projects")
      .then((res) => setProjects(res.data || []))
      .catch(() => setError("데모 프로젝트를 불러오지 못했습니다."));
  }, []);

  const start = async (projectId) => {
    setOpening(projectId);
    setError("");
    try {
      await openProject(projectId);
      // 기획서 분석이 끝난 직후 화면부터 시작
      navigate("/analyze/list");
    } catch {
      setError("데모 프로젝트를 열지 못했습니다.");
      setOpening(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4" style={{ marginTop: "128px" }}>
      <div className="text-center mb-10">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold mb-4">
          데모
        </span>
        <h2 className="text-3xl font-semibold text-white mb-3">미리 만들어 둔 축제로 둘러보기</h2>
        <p className="text-gray-400 leading-relaxed">
          실제 서비스 흐름을 그대로 따라가 보세요. 생성 단계는 미리 만들어 둔 결과를 보여 드리며,
          <br className="hidden sm:block" />
          데모에서는 새로 만들거나 저장하지 않습니다.
        </p>
      </div>

      {error && <p className="text-center text-red-300 mb-6">{error}</p>}
      {projects === null && !error && <p className="text-center text-gray-400">불러오는 중…</p>}
      {projects && projects.length === 0 && (
        <p className="text-center text-gray-400">준비된 데모 프로젝트가 없습니다.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {(projects || []).map((p) => (
          <button
            key={p.projectId}
            onClick={() => start(p.projectId)}
            disabled={opening !== null}
            className="text-left rounded-2xl overflow-hidden border border-gray-700 bg-gray-800 hover:border-indigo-400 hover:-translate-y-0.5 transition disabled:opacity-60"
          >
            <div className="aspect-[4/3] bg-gray-900 flex items-center justify-center overflow-hidden">
              {p.thumbnailUrl ? (
                <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-sm">미리보기 없음</span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white">{p.festivalName}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {[p.festivalStartDate, p.festivalEndDate].filter(Boolean).join(" ~ ")}
              </p>
              <p className="mt-4 text-sm font-semibold text-indigo-300">
                {opening === p.projectId ? "여는 중…" : "이 축제로 데모 시작 →"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-12 mb-16 text-gray-400 text-sm">
        내 기획서로 직접 만들어 보려면{" "}
        <button
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
          className="text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
        >
          회원가입
        </button>
        해 주세요. 가입하면 홍보물 전체를 한 번 만들 수 있는 크레딧을 드립니다.
      </div>
    </div>
  );
}
