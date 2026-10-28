import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Approuter from "./utils/routes";
import './App.css'
import MainLayout from "./layout/MainLayout";
import JobNotifier from "./components/job/JobNotifier";
import ApiNotice from "./components/notice/ApiNotice";


function App() {
  const location = useLocation();

  // 페이지 전환 시 스크롤을 맨 위로 올리기
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
      <>
      <Approuter />
      {/* 백그라운드 생성 작업 알림 (어느 화면에서든) */}
      <JobNotifier />
      {/* 데모 계정 제한 / 크레딧 부족 안내 */}
      <ApiNotice />
      </>
  )
}

export default App
