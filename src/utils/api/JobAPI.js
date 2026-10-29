import api from "./BaseAPI";

/**
 * 백그라운드 생성 작업 API.
 * 생성은 서버에서 돌고, 화면은 작업 번호로 진행 상황을 조회한다 (다른 화면으로 가도 계속 진행).
 */
export const JobAPI = {
  /** 파생물 생성(에디터 빌드) 시작. 같은 프로젝트 빌드가 이미 돌고 있으면 그 작업을 돌려준다 */
  startEditorBuild: (pNo, postersPayload) =>
    api
      .post(`/api/editor/build-jobs?pNo=${pNo}`, JSON.stringify(postersPayload), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => res.data),

  /** 이 프로젝트의 최근 빌드 작업 (없으면 null) */
  latestEditorBuild: (pNo) =>
    api.get("/api/editor/build-jobs/latest", { params: { pNo } }).then((res) => (res.status === 204 ? null : res.data)),

  get: (jobId) => api.get(`/api/jobs/${jobId}`).then((res) => res.data),

  /** 진행 중 + 아직 확인하지 않은 완료 작업 */
  active: () => api.get("/api/jobs/active").then((res) => res.data || []),

  markSeen: (jobId) => api.post(`/api/jobs/${jobId}/seen`),

  /** 베이스 포스터·마스코트 생성 시작 (프롬프트 → 이미지, 포스터 → 마스코트). body 는 분석 화면의 trendData */
  startCreateImages: (pNo, trendData) =>
    api.post("/api/create-jobs", trendData, { params: { pNo } }).then((res) => res.data),

  /** 이 프로젝트의 최근 포스터·마스코트 생성 작업 (없으면 null) */
  latestCreateImages: (pNo) =>
    api.get("/api/create-jobs/latest", { params: { pNo } }).then((res) => (res.status === 204 ? null : res.data)),

  /** 기획서 분석 → 트렌드 → 지역 트렌드 작업 시작 (새 프로젝트를 만든다). formData: file, theme, keywords, title */
  startAnalyze: (formData) => api.post("/api/project/analyze/jobs", formData).then((res) => res.data),

  /** 이미 만든 파생물: { 유형: 만든 베이스 경로 } */
  derivatives: (pNo) => api.get(`/api/editor/project/${pNo}/derivatives`).then((res) => res.data || {}),
};

// 기본 예상 시간 (아직 완료된 항목이 없어 평균을 모를 때)
const DEFAULT_ITEM_SECONDS = 45;
const FINISHING_SECONDS = 25; // 글자 지우기 + 템플릿 조립

/**
 * 진행률(%)과 남은 시간(초) 계산.
 * 항목 생성 구간을 85%, 마무리(글자 지우기·조립)를 15% 로 본다.
 * 생성 중인 항목은 평균 소요 시간 대비 경과 시간만큼 채운다 (최대 90%).
 */
export function summarizeBuild(job) {
  const p = job?.progress;
  if (job?.status === "SUCCEEDED") return { percent: 100, remaining: 0 };
  if (!p || !p.total) return { percent: job?.status === "RUNNING" ? 3 : 0, remaining: null };
  if (p.items.some((it) => it.expectSeconds)) return summarizeSteps(p);

  const avg = p.avgItemSeconds || DEFAULT_ITEM_SECONDS;
  const running = p.items.find((it) => it.status === "running");
  const runningFrac = running ? Math.min((p.now - running.startedAt) / avg, 0.9) : 0;
  const itemsPart = ((p.done + runningFrac) / p.total) * 85;

  let percent = itemsPart;
  if (p.phase === "글자 지우기") percent = 88;
  if (p.phase === "에디터 템플릿 조립") percent = 96;
  if (p.status === "done") percent = 100;

  const left = p.items.filter((it) => it.status === "pending").length;
  const runningLeft = running ? Math.max(avg - (p.now - running.startedAt), 5) : 0;
  const finishing = p.phase === "파생물 생성" ? FINISHING_SECONDS : 10;
  const remaining = p.status === "done" ? 0 : Math.round(left * avg + runningLeft + finishing);

  return { percent: Math.max(1, Math.min(99, Math.round(percent))), remaining };
}

/**
 * 단계마다 예상 시간이 있는 작업(포스터·마스코트 생성)의 진행률.
 * 예상 시간을 가중치로 쓰고, 진행 중인 단계는 경과 시간만큼 채운다 (단계 예상치의 95% 까지).
 */
function summarizeSteps(p) {
  const total = p.items.reduce((sum, it) => sum + (it.expectSeconds || DEFAULT_ITEM_SECONDS), 0);
  let doneSec = 0;
  let remaining = 0;
  for (const it of p.items) {
    const expect = it.expectSeconds || DEFAULT_ITEM_SECONDS;
    if (it.status === "done") {
      doneSec += expect;
    } else if (it.status === "running") {
      const elapsed = Math.max(p.now - it.startedAt, 0);
      doneSec += Math.min(elapsed, expect * 0.95);
      remaining += Math.max(expect - elapsed, 5);
    } else {
      remaining += expect;
    }
  }
  if (p.status === "done") return { percent: 100, remaining: 0 };
  return { percent: Math.max(1, Math.min(99, Math.round((doneSec / total) * 100))), remaining: Math.round(remaining) };
}

export function formatDuration(sec) {
  if (sec == null) return "계산 중";
  if (sec < 60) return `${Math.max(sec, 1)}초`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}분 ${s}초` : `${m}분`;
}
