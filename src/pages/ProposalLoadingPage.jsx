import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import UnifiedLoadingPage from "../components/loding/UnifiedLoadingPage";
import { useProjectStore } from "../store/projectStore";
import projectSession from "../utils/projectSession";
import { isDemoUser, sleep } from "../utils/demo";

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
  const { state } = useLocation();
  const [message, setMessage] = useState("기획서를 분석 중입니다...");

  useEffect(() => {
    if (!state) {
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

        // 새 기획서 = 새 프로젝트. 이전 프로젝트의 진행 상태를 이어받지 않는다
        useProjectStore.getState().reset();

        /* -------------------------------
         * 1️⃣ 기획서 분석
         * ------------------------------- */
        const proposalData = new FormData();
        proposalData.append("file", state.file);
        proposalData.append("theme", state.theme);
        proposalData.append("keywords", JSON.stringify(state.keywords));
        proposalData.append("title", state.festivalName);

        await api.post(
          "/api/project/analyze/proposal", 
          proposalData
        );

        // 백엔드에서 저장된 최신 값 가져오기
        const finalProposal = await api.get("/api/project/analyze/lastst");

        // 이 프로젝트를 현재 프로젝트로 삼고 서버 진행 상태를 연다 (이후 값은 서버에 저장된다)
        await useProjectStore.getState().start(finalProposal.data.pNo ?? finalProposal.data.projectNo);
        projectSession.setItem("proposalData", JSON.stringify(finalProposal.data));
        // 유형 선택 화면(/select)에서 고른 초안을 이 프로젝트의 진행 상태로 옮긴다
        const draftTypes = sessionStorage.getItem("types");
        if (draftTypes) projectSession.setItem("types", draftTypes);

        setMessage("트렌드 및 홍보물 분석을 진행 중입니다...");

        /* -------------------------------
         * 2️⃣ 병렬 실행 - 모든 분석
         * ------------------------------- */

        const pd = finalProposal.data;
        // 서버 응답은 festivalStartDate("2023-05-19T00:00:00.000+00:00"). 트렌드 API 는 yyyy-MM-dd 를 받는다
        const festivalStartDate = String(pd.festivalStartDate || "").slice(0, 10);

        // 공통 FormData (trend, video, mascot, etc…)
        const baseFD = () => {
          const fd = new FormData();
          fd.append("keyword", state.keywords[0]); // 메인 키워드
          fd.append("title", pd.title);
          fd.append("festival_start_date", festivalStartDate);
          return fd;
        };

        // ⭐ 2-1) 트렌드 분석 (최우선)
        const trendReq = api.post(
          "/api/project/analyze/total_trend",
          baseFD()
        );

        // ⭐ 2-2) 지역 트렌드 분석
        const regionTrendReq = api.post(
          "/api/project/analyze/region_trend",
          null,
          {
            params: { festival_start_date: festivalStartDate }
          }
        );

        // // ⭐ 2-3) 나머지 분석 – 일단 구조만 주석 처리한 상태로 둠
        // const videoReq = api.post(
        //   "/api/project/analyze/video",
        //   baseFD()
        // );

        // const mascotReq = api.post(
        //   "/api/project/analyze/mascot",
        //   baseFD()
        // );

        // const posterReq = api.post(
        //   "/api/project/analyze/poster",
        //   baseFD()
        // );

        // const bannerReq = api.post(
        //   "/api/project/analyze/banner",
        //   baseFD()
        // );

        // const cardnewsReq = api.post(
        //   "/api/project/analyze/cardnews",
        //   baseFD()
        // );

        // const leafletReq = api.post(
        //   "/api/project/analyze/leaflet",
        //   baseFD()
        // );

        // 실제로 아직 API 없는 경우 주석처리 ↓↓↓
        const results = await Promise.all([
          trendReq,
          regionTrendReq,
          // videoReq,
          // mascotReq,
          // posterReq,
          // bannerReq,
          // cardnewsReq,
          // leafletReq
        ]);

        const trendRes = results[0];
        const regionTrendRes = results[1];

        projectSession.setItem("trendData", JSON.stringify(trendRes.data));
        projectSession.setItem("regionTrendData", JSON.stringify(regionTrendRes.data));

        /* -------------------------------
         * 3️⃣ 최종 결과 페이지 이동
         * ------------------------------- */
        navigate("/analyze", {
          state: {
            proposal: finalProposal.data,
            trend: trendRes.data,
            regionTrend: regionTrendRes.data,
            festivalStartDate,
          },
        });
      } catch (err) {
        console.error("❌ 분석 실패:", err);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/upload");
      }
    };

    runAnalysis();
  }, [navigate, state]);

  return (
    <UnifiedLoadingPage 
      title={message}
      description="잠시만 기다려 주세요."
    />
  );
};

export default ProposalLoadingPage;
