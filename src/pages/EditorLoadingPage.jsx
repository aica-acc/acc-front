import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { JobAPI, summarizeBuild, formatDuration } from "../utils/api/JobAPI";
import { useProjectStore } from "../store/projectStore";

const POLL_MS = 2000;

const STATUS_VIEW = {
  done: { icon: "bi-check-circle-fill", color: "text-emerald-400", text: "완료" },
  reused: { icon: "bi-arrow-repeat", color: "text-sky-400", text: "기존 결과 사용" },
  running: { icon: "bi-arrow-clockwise animate-spin", color: "text-yellow-400", text: "생성 중" },
  pending: { icon: "bi-circle", color: "text-gray-500", text: "대기" },
  failed: { icon: "bi-x-circle-fill", color: "text-red-400", text: "실패" },
};

/**
 * 파생물 생성(에디터 빌드) 진행 화면.
 * 생성은 서버의 백그라운드 작업으로 돌고, 이 화면은 진행 상황만 조회한다.
 * "다른 작업 하기"로 나가도 생성은 계속되며, 끝나면 화면 오른쪽 아래 알림(JobNotifier)으로 알려 준다.
 * state 없이 들어오면(알림 클릭, 새로고침) 이 프로젝트의 최근 빌드 작업을 이어서 보여 준다.
 */
const EditorLoadingPage = () => {
  const { state } = useLocation(); // CreatePoster/Mascot/UploadPage → { pNo, postersPayload }
  const navigate = useNavigate();
  const pNo = state?.pNo || useProjectStore.getState().pNo;

  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  const openEditor = useCallback(
    (j) => {
      JobAPI.markSeen(j.jobId).catch(() => {});
      navigate("/editorpage", { replace: true, state: { pNo, runId: j.result?.runId } });
    },
    [navigate, pNo]
  );

  // 1) 작업 시작 또는 이어서 보기
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!pNo) {
      navigate("/select", { replace: true });
      return;
    }
    const begin = state?.postersPayload
      ? JobAPI.startEditorBuild(pNo, state.postersPayload)
      : JobAPI.latestEditorBuild(pNo);
    begin
      .then((j) => {
        if (!j) {
          setError("진행 중인 파생물 생성이 없습니다.");
          return;
        }
        setJob(j);
      })
      .catch(() => setError("파생물 생성을 시작하지 못했습니다."));
  }, [pNo, state, navigate]);

  // 2) 진행 상황 조회
  useEffect(() => {
    if (!job || job.status === "SUCCEEDED" || job.status === "FAILED") return undefined;
    const timer = setInterval(() => {
      JobAPI.get(job.jobId).then(setJob).catch(() => {});
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [job]);

  // 3) 끝나면 에디터로
  useEffect(() => {
    if (job?.status === "SUCCEEDED") {
      const t = setTimeout(() => openEditor(job), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [job, openEditor]);

  const retry = () => {
    if (!state?.postersPayload) {
      navigate(-1);
      return;
    }
    setError("");
    setJob(null);
    JobAPI.startEditorBuild(pNo, state.postersPayload).then(setJob).catch(() => setError("다시 시작하지 못했습니다."));
  };

  const { percent, remaining } = summarizeBuild(job);
  const p = job?.progress;
  const failed = job?.status === "FAILED" || !!error;

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-gray-700 bg-gray-800/70 p-8 shadow-xl">
        <h1 className="text-xl font-bold">
          {failed ? "파생물 생성에 실패했습니다" : job?.status === "SUCCEEDED" ? "완료! 에디터를 여는 중..." : "파생물을 만들고 있습니다"}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {failed
            ? error || job?.error
            : "서버에서 만들고 있어 다른 화면으로 가도 계속 진행됩니다. 끝나면 오른쪽 아래에 알려 드립니다."}
        </p>

        {!failed && (
          <>
            <div className="mt-6 flex items-end justify-between text-sm">
              <span className="text-gray-300">
                {p ? `${p.phase} · ${p.done}/${p.total}` : "준비 중"}
              </span>
              <span className="text-gray-400">
                {job?.status === "SUCCEEDED" ? "" : `남은 시간 약 ${formatDuration(remaining)}`}
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-gray-400">{percent}%</div>
          </>
        )}

        {p?.items?.length > 0 && (
          <ul className="mt-5 space-y-1.5">
            {p.items.map((it) => {
              const view = STATUS_VIEW[it.reused ? "reused" : it.status] || STATUS_VIEW.pending;
              const secs =
                it.status === "running" && it.startedAt ? Math.round(p.now - it.startedAt)
                  : it.finishedAt && it.startedAt && !it.reused ? Math.round(it.finishedAt - it.startedAt)
                  : null;
              return (
                <li key={it.type} className="flex items-center gap-3 rounded-lg bg-gray-900/40 px-3 py-2 text-sm">
                  <i className={`bi ${view.icon} ${view.color}`} />
                  <span className="flex-1 text-gray-200">{it.label}</span>
                  <span className={`text-xs ${view.color}`}>
                    {view.text}
                    {secs != null && ` · ${secs}초`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex gap-2">
          {failed ? (
            <>
              <button onClick={() => navigate(-1)} className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm hover:bg-gray-700">
                돌아가기
              </button>
              {state?.postersPayload && (
                <button onClick={retry} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500">
                  다시 시도
                </button>
              )}
            </>
          ) : (
            job?.status !== "SUCCEEDED" && (
              <button
                onClick={() => navigate("/mypage/project")}
                className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm hover:bg-gray-700"
              >
                다른 작업 하기 (백그라운드에서 계속)
              </button>
            )
          )}
        </div>
        {!failed && (
          <p className="mt-3 text-center text-xs text-gray-500">
            같은 베이스로 이미 만든 항목은 다시 만들지 않고 기존 결과를 사용합니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default EditorLoadingPage;
