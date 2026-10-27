import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Image } from "../../utils/api/PosterAPI";
import { JobAPI } from "../../utils/api/JobAPI";
import { useProjectStore } from "../../store/projectStore";
import JobProgressCard from "../../components/job/JobProgressCard";

import projectSession from "../../utils/projectSession";

const POLL_MS = 2000;

/**
 * 베이스 포스터·마스코트 생성 진행 화면.
 * 예전에는 이 화면이 프롬프트 → 이미지 생성을 4번 직접 호출해, 화면을 벗어나면 진행을 알 수 없었다.
 * 이제 서버의 백그라운드 작업(CREATE_IMAGES)으로 맡기고 단계별 진행만 조회한다.
 * state 없이 들어오면(알림 클릭, 새로고침) 이 프로젝트의 최근 생성 작업을 이어서 보여 준다.
 */
const CreateLoadingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // AnalyzeButton → { trendData }
  const pNo = useProjectStore.getState().pNo;

  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  const trendData = state || (() => {
    const raw = projectSession.getItem("trendData");
    return raw ? { trendData: JSON.parse(raw) } : null;
  })();

  // 완료 → 썸네일 목록을 받아 첫 포스터 상세로
  const openResult = useCallback(
    async (j) => {
      try {
        JobAPI.markSeen(j.jobId).catch(() => {});
        const [posterList, mascotList] = await Promise.all([
          Image.getThumbnailList("poster"),
          Image.getThumbnailList("mascot"),
        ]);
        projectSession.setItem("posterThumbnailList", JSON.stringify(posterList));
        projectSession.setItem("mascotThumbnailList", JSON.stringify(mascotList));
        if (posterList.length === 0) throw new Error("생성된 포스터 이미지가 없습니다.");

        const first = posterList[0];
        const detail = await Image.getDetail({ filePathNo: first.filePathNo, promptNo: first.promptNo });
        projectSession.setItem("currentDetail", JSON.stringify(detail));
        navigate(`/create/poster/detail/${first.filePathNo}/${first.promptNo}`, { replace: true });
      } catch (e) {
        console.error(e);
        setError("생성 결과를 불러오지 못했습니다: " + e.message);
      }
    },
    [navigate]
  );

  const start = useCallback(() => {
    setError("");
    setJob(null);
    return JobAPI.startCreateImages(pNo, trendData).then(setJob);
  }, [pNo, trendData]);

  // 1) 작업 시작 또는 이어서 보기
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!pNo) {
      navigate("/select", { replace: true });
      return;
    }
    const begin = state
      ? JobAPI.startCreateImages(pNo, state)
      : JobAPI.latestCreateImages(pNo);
    begin
      .then((j) => {
        if (!j) {
          setError("진행 중인 포스터·마스코트 생성이 없습니다.");
          return;
        }
        setJob(j);
      })
      .catch(() => setError("포스터·마스코트 생성을 시작하지 못했습니다."));
  }, [pNo, state, navigate]);

  // 2) 진행 상황 조회
  useEffect(() => {
    if (!job || job.status === "SUCCEEDED" || job.status === "FAILED") return undefined;
    const timer = setInterval(() => {
      JobAPI.get(job.jobId).then(setJob).catch(() => {});
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [job]);

  // 3) 끝나면 결과 화면으로
  useEffect(() => {
    if (job?.status === "SUCCEEDED") {
      const t = setTimeout(() => openResult(job), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [job, openResult]);

  const failed = job?.status === "FAILED" || !!error;

  return (
    <JobProgressCard
      job={job}
      error={error}
      titles={{
        running: "포스터와 마스코트를 만들고 있습니다",
        succeeded: "완료! 결과를 여는 중...",
        failed: "포스터·마스코트 생성에 실패했습니다",
      }}
      note="이미 만든 포스터·마스코트가 있으면 다시 만들지 않고 기존 결과를 사용합니다."
      actions={
        failed ? (
          <>
            <button onClick={() => navigate("/analyze")} className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm hover:bg-gray-700">
              분석 화면으로
            </button>
            {trendData && (
              <button
                onClick={() => start().catch(() => setError("다시 시작하지 못했습니다."))}
                className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500"
              >
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

export default CreateLoadingPage;
