import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { JobAPI, summarizeBuild } from "../../utils/api/JobAPI";

const POLL_MS = 5000;
const KIND_LABEL = { EDITOR_BUILD: "파생물 생성" };

/**
 * 화면 오른쪽 아래 생성 작업 알림.
 * 어느 화면에 있든 진행 중인 작업의 진행률과, 끝났지만 아직 확인하지 않은 작업을 보여 준다.
 * 진행 화면(/testlodingpage)에서는 같은 정보가 이미 보이므로 숨긴다.
 */
export default function JobNotifier() {
  const loggedIn = useAuthStore((s) => !!s.token);
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!loggedIn) {
      setJobs([]);
      return undefined;
    }
    let alive = true;
    const load = () => {
      if (document.hidden) return; // 다른 탭을 보는 동안은 조회하지 않는다
      JobAPI.active().then((list) => alive && setJobs(list)).catch(() => {});
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [loggedIn, location.pathname]);

  if (!loggedIn || jobs.length === 0 || location.pathname === "/testlodingpage") return null;

  const dismiss = (job) => {
    JobAPI.markSeen(job.jobId).catch(() => {});
    setJobs((list) => list.filter((j) => j.jobId !== job.jobId));
  };

  const open = (job) => {
    if (job.status === "SUCCEEDED") {
      dismiss(job);
      navigate(`/editorpage?p=${job.pNo}`, { state: { pNo: job.pNo, runId: job.result?.runId } });
    } else {
      navigate(`/testlodingpage?p=${job.pNo}`);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[3000] flex w-80 flex-col gap-2">
      {jobs.map((job) => {
        const label = KIND_LABEL[job.kind] || "생성 작업";
        const running = job.status === "QUEUED" || job.status === "RUNNING";
        const { percent } = summarizeBuild(job);
        const p = job.progress;
        return (
          <div key={job.jobId} className="rounded-xl border border-gray-700 bg-gray-900/95 p-4 text-white shadow-2xl backdrop-blur">
            <div className="flex items-start gap-3">
              <i
                className={`bi mt-0.5 ${
                  running ? "bi-arrow-clockwise animate-spin text-yellow-400"
                    : job.status === "SUCCEEDED" ? "bi-check-circle-fill text-emerald-400"
                    : "bi-x-circle-fill text-red-400"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {label} {running ? "중" : job.status === "SUCCEEDED" ? "완료" : "실패"}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {running && p ? `${p.phase} · ${p.done}/${p.total}` : running ? "준비 중" : `프로젝트 ${job.pNo}`}
                </p>
              </div>
              {!running && (
                <button onClick={() => dismiss(job)} className="text-gray-500 hover:text-white" aria-label="닫기">
                  <i className="bi bi-x-lg text-xs" />
                </button>
              )}
            </div>
            {running && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-700" style={{ width: `${percent}%` }} />
              </div>
            )}
            {job.status !== "FAILED" && (
              <button onClick={() => open(job)} className="mt-3 w-full rounded-lg bg-gray-800 py-1.5 text-xs font-semibold hover:bg-gray-700">
                {running ? "진행 상황 보기" : "에디터 열기"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
