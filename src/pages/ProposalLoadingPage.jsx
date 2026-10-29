import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import UnifiedLoadingPage from "../components/loding/UnifiedLoadingPage";
import { useProjectStore } from "../store/projectStore";
import projectSession from "../utils/projectSession";
import { isDemoUser, sleep } from "../utils/demo";
import { JobAPI } from "../utils/api/JobAPI";

const POLL_MS = 3000;

/**
 * 데모(test 계정): 기획서를 실제로 분석하지 않고, 같은 축제로 미리 만들어 둔 프로젝트를 연다.
 * 분석에 걸리는 시간을 짧게 보여 준 뒤 그 프로젝트의 분석 결과 화면으로 간다. 새 프로젝트는 만들지 않는다.
 */
async function openDemoProject(state, setMessage) {
  const res = await api.get("/api/mypage/projects");
  const project = (res.data || []).find((p) => p.festivalName === state.festivalName);
  if (!project) return null;
  await sleep(2200);
  setMessage("트렌드 및 홍보물 분석을 진행 중입니다...");
  const pNo = project.projectId;
  await useProjectStore.getState().start(pNo);
  // 베이스(포스터·마스코트)는 미리 정해 두고, 만들 파생물은 미리 만들어 둔 종류 안에서 고른다
  const base = (await api.get(`/api/editor/project/${pNo}/demo-base`)).data;
  projectSession.setItem("demoBase", JSON.stringify(base));
  const draft = JSON.parse(sessionStorage.getItem("types") || "[]");
  const picked = draft.filter((t) => base.types.includes(t));
  projectSession.setItem("types", JSON.stringify(picked.length ? picked : base.types));
  // 이전 데모 관람에서 남은 선택·편집은 지우고 처음부터 보여 준다 (데모는 서버에 저장하지 않는다)
  ["selectedPosterImage", "selectedMascotImage", "uploadedPosterImage", "uploadedMascotImage", "editorEdits"]
    .forEach((k) => projectSession.removeItem(k));
  await sleep(2500);
  return pNo;
}

const ProposalLoadingPage = () => {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const [message, setMessage] = useState("기획서를 분석 중입니다...");
  const jobId = new URLSearchParams(search).get("job");

  useEffect(() => {
    let alive = true;
    if (!state && !jobId) {
      alert("업로드된 데이터가 없습니다. 다시 시도해주세요.");
      navigate("/upload");
      return;
    }

    const runAnalysis = async () => {
      try {
        if (isDemoUser()) {
          const pNo = await openDemoProject(state, setMessage);
          if (!pNo) {
            alert("예시 기획서로만 진행할 수 있습니다.");
            navigate("/upload");
            return;
          }
          const read = (k) => JSON.parse(projectSession.getItem(k) || "null");
          const proposal = read("proposalData");
          navigate("/analyze", {
            state: {
              proposal,
              trend: read("trendData"),
              regionTrend: read("regionTrendData"),
              festivalStartDate: String(proposal?.festivalStartDate || "").slice(0, 10),
            },
          });
          return;
        }

        // 이미 시작한 분석 작업을 이어서 본다 (새로고침, 오른쪽 아래 알림에서 다시 열기)
        if (jobId) {
          await followJob(jobId);
          return;
        }

        // 새 기획서 = 새 프로젝트. 이전 프로젝트의 진행 상태를 이어받지 않는다
        useProjectStore.getState().reset();

        /* -------------------------------
         * 기획서 분석 → 트렌드 → 지역 트렌드를 서버 작업으로 (트러블슈팅 #32)
         * 예전에는 이 화면이 세 요청을 차례로 기다려 새로고침하면 결과를 잃었다
         * ------------------------------- */
        const proposalData = new FormData();
        proposalData.append("file", state.file);
        proposalData.append("theme", state.theme);
        proposalData.append("keywords", JSON.stringify(state.keywords));
        proposalData.append("title", state.festivalName);

        const job = await JobAPI.startAnalyze(proposalData);
        // 주소에 작업 번호를 남겨 새로고침해도 이어서 본다. 주소가 바뀌면 이 효과가 다시 돌아 위의 followJob 으로 이어진다
        navigate(`/proposalloading?job=${job.jobId}`, { replace: true });
      } catch (err) {
        console.error("❌ 분석 실패:", err);
        alert(err?.message && err.isJobFailure ? err.message : "오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/upload");
      }
    };

    /** 작업이 끝날 때까지 진행 단계를 보여 주고, 끝나면 분석 결과 화면으로 */
    const followJob = async (id) => {
      let job = await JobAPI.get(id);
      while (job.status === "QUEUED" || job.status === "RUNNING") {
        if (!alive) return;
        if (job.progress?.phase) setMessage(`${job.progress.phase} 중입니다...`);
        await sleep(POLL_MS);
        job = await JobAPI.get(id);
      }
      if (!alive) return;
      if (job.status !== "SUCCEEDED") {
        const e = new Error(job.error || "분석에 실패했습니다. 다시 시도해주세요.");
        e.isJobFailure = true;
        throw e;
      }
      JobAPI.markSeen(id).catch(() => {});
      const r = job.result;

      // 이 프로젝트를 현재 프로젝트로 삼고 서버 진행 상태를 연다 (이후 값은 서버에 저장된다)
      await useProjectStore.getState().start(r.pNo);
      projectSession.setItem("proposalData", JSON.stringify(r.proposal));
      // 유형 선택 화면(/select)에서 고른 초안을 이 프로젝트의 진행 상태로 옮긴다
      const draftTypes = sessionStorage.getItem("types");
      if (draftTypes) projectSession.setItem("types", draftTypes);
      projectSession.setItem("trendData", JSON.stringify(r.trend));
      projectSession.setItem("regionTrendData", JSON.stringify(r.regionTrend));
      if (r.regionTrendError) projectSession.setItem("regionTrendError", r.regionTrendError);

      navigate("/analyze", {
        replace: true,
        state: {
          proposal: r.proposal,
          trend: r.trend,
          regionTrend: r.regionTrend,
          festivalStartDate: r.festivalStartDate,
        },
      });
    };

    runAnalysis();
    return () => {
      alive = false;
    };
  }, [navigate, state, jobId]);

  return (
    <UnifiedLoadingPage 
      title={message}
      description="잠시만 기다려 주세요."
    />
  );
};

export default ProposalLoadingPage;
