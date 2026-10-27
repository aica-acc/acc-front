import api from "./api/BaseAPI";

/**
 * 진행 중인 프로젝트 번호(pNo).
 * sessionStorage 의 proposalData 에 없으면 서버의 최신 분석 결과에서 가져와 다시 저장한다.
 * 찾지 못하면 null — 임의의 번호(예: 1)로 대체하면 다른 프로젝트에 결과가 저장되므로 호출부에서 중단한다.
 */
export async function resolveProjectNo(proposalData) {
  const known = proposalData?.pNo ?? proposalData?.projectNo;
  if (known) return known;

  try {
    const res = await api.get("/api/project/analyze/lastst");
    const fetched = res.data?.pNo ?? res.data?.projectNo;
    if (!fetched) return null;
    sessionStorage.setItem(
      "proposalData",
      JSON.stringify({ ...proposalData, pNo: fetched, projectNo: fetched })
    );
    return fetched;
  } catch {
    return null;
  }
}

export const PROJECT_NOT_FOUND_MESSAGE =
  "진행 중인 프로젝트를 찾을 수 없습니다. 기획서 분석부터 다시 진행해 주세요.";
