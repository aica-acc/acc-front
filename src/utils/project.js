import { useProjectStore } from "../store/projectStore";

/**
 * 진행 중인 프로젝트 번호(pNo).
 * 현재 프로젝트(ProjectGate 가 서버에서 불러온 값)를 우선 쓰고, 없으면 proposalData 의 번호를 쓴다.
 * 찾지 못하면 null — 임의의 번호(예: 1)로 대체하면 다른 프로젝트에 결과가 저장되므로 호출부에서 중단한다.
 */
export async function resolveProjectNo(proposalData) {
  return useProjectStore.getState().pNo ?? proposalData?.pNo ?? proposalData?.projectNo ?? null;
}

/**
 * "이어서 하기": 프로젝트를 현재 프로젝트로 열고, 마지막으로 머문 화면 경로를 돌려준다.
 * pNo 를 주면 그 프로젝트(마이페이지에서 고른 것), 없으면 가장 최근에 진행한 프로젝트.
 * 진행 중인 프로젝트가 없으면 null.
 */
export async function openProject(pNo) {
  const store = useProjectStore.getState();
  const progress = pNo ? await store.load(pNo) : await store.loadCurrent();
  return progress ? progress.route || "/analyze/list" : null;
}

/** 경로로 보여줄 단계 이름 */
export function stepLabel(route) {
  if (!route) return "기획서 분석 결과";
  if (route.startsWith("/editorpage")) return "에디터";
  if (route.startsWith("/create/upload")) return "베이스 이미지 선택";
  if (route.startsWith("/create/mascort")) return "마스코트 선택";
  if (route.startsWith("/create/poster")) return "포스터 선택";
  if (route.startsWith("/report")) return "홍보 리포트";
  if (route.startsWith("/check")) return "생성 결과 확인";
  return "기획서 분석 결과";
}

export const PROJECT_NOT_FOUND_MESSAGE =
  "진행 중인 프로젝트를 찾을 수 없습니다. 기획서 분석부터 다시 진행해 주세요.";
