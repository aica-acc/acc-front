import { useProjectStore } from "../store/projectStore";

/**
 * sessionStorage 와 같은 사용법의 "프로젝트 진행 상태" 저장소.
 *
 *   projectSession.getItem("types")            // 동기. 없으면 null
 *   projectSession.setItem("types", JSON.stringify(v))
 *   projectSession.removeItem("types")
 *
 * 값은 서버(project_progress)에 저장되어 새로고침·다른 기기에서도 이어진다.
 * 프로젝트 흐름 화면은 ProjectGate 안에 있어 화면이 그려질 때 이미 서버 상태가 불러와져 있다.
 */
const store = () => useProjectStore.getState();

const projectSession = {
  getItem: (key) => store().getItem(key),
  setItem: (key, value) => store().setItem(key, value),
  removeItem: (key) => store().removeItem(key),
};

export default projectSession;
