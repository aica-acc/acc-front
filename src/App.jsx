import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Approuter from "./utils/routes";
import './App.css'
import MainLayout from "./layout/MainLayout";
import JobNotifier from "./components/job/JobNotifier";


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
      </>
  )
}

export default App
