import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { JobAPI } from "../utils/api/JobAPI";
import { useProjectStore } from "../store/projectStore";
import JobProgressCard from "../components/job/JobProgressCard";

const POLL_MS = 2000;

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

  const failed = job?.status === "FAILED" || !!error;

  return (
    <JobProgressCard
      job={job}
      error={error}
      titles={{
        running: "파생물을 만들고 있습니다",
        succeeded: "완료! 에디터를 여는 중...",
        failed: "파생물 생성에 실패했습니다",
      }}
      note="같은 베이스로 이미 만든 항목은 다시 만들지 않고 기존 결과를 사용합니다."
      actions={
        failed ? (
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
        )
      }
    />
  );
};

export default EditorLoadingPage;
