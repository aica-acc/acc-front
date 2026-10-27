import React, { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useProjectStore } from "../../store/projectStore";

// 다시 들어오면 작업이 다시 실행되는 진행 화면은 "이어서 하기" 위치로 기록하지 않는다
const NOT_RESUMABLE = ["/proposalloading", "/generate-prompt/loading", "/testlodingpage"];

/**
 * 프로젝트 흐름 화면(분석 결과 → 유형 선택 → 생성 → 베이스 선택 → 에디터)의 입구.
 *  1. 서버에서 진행 상태를 불러온 뒤에 화면을 그린다 (화면은 projectSession 으로 동기 조회).
 *     ?p=번호 가 있으면 그 프로젝트, 없으면 이 탭에서 보던 프로젝트, 그것도 없으면 가장 최근 프로젝트.
 *  2. 지금 화면 경로를 서버에 기록해 "이어서 하기"가 이 화면으로 돌아오게 한다.
 */
const ProjectGate = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const wanted = Number(params.get("p")) || null;

  const pNo = useProjectStore((s) => s.pNo);
  const status = useProjectStore((s) => s.status);
  const load = useProjectStore((s) => s.load);
  const loadCurrent = useProjectStore((s) => s.loadCurrent);
  const setRoute = useProjectStore((s) => s.setRoute);

  // 같은 대상을 실패할 때마다 다시 부르지 않도록 마지막 시도를 기억한다
  const tried = useRef(null);

  useEffect(() => {
    if (status === "loading") return;
    if (wanted) {
      if (wanted === pNo && status === "ready") return;
      if (tried.current === `p:${wanted}`) return;
      tried.current = `p:${wanted}`;
      load(wanted).catch(() => {});
      return;
    }
    if (status !== "idle" || tried.current === `tab:${pNo}`) return;
    tried.current = `tab:${pNo}`;
    // 이 탭에서 보던 프로젝트가 삭제·권한 변경으로 열리지 않으면 가장 최근 프로젝트로
    (pNo ? load(pNo).catch(() => loadCurrent()) : loadCurrent()).catch(() => {});
  }, [status, wanted, pNo, load, loadCurrent]);

  const ready = status === "ready" && !(wanted && wanted !== pNo);
  useEffect(() => {
    if (!ready || NOT_RESUMABLE.includes(location.pathname)) return;
    // ?p= 는 진입용이라 기록하지 않는다
    const search = new URLSearchParams(location.search);
    search.delete("p");
    const qs = search.toString();
    setRoute(location.pathname + (qs ? `?${qs}` : ""));
  }, [ready, location.pathname, location.search, setRoute]);

  if (status === "none") {
    return <Navigate to="/upload" replace state={{ message: "진행 중인 프로젝트가 없습니다. 기획서를 먼저 분석해 주세요." }} />;
  }
  if (status === "error") {
    return (
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-300">
        <p>프로젝트를 불러오지 못했습니다.</p>
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          onClick={() => (wanted || pNo ? load(wanted || pNo) : loadCurrent()).catch(() => {})}
        >
          다시 시도
        </button>
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="w-full h-full min-h-[60vh] flex items-center justify-center text-gray-400">
        프로젝트를 불러오는 중...
      </div>
    );
  }
  return <Outlet />;
};

export default ProjectGate;
