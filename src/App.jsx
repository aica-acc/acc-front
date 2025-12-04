import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Approuter from "./utils/routes";
import './App.css'
import MainLayout from "./layout/MainLayout";


function App() {
  const location = useLocation();

  // 페이지 전환 시 스크롤을 맨 위로 올리기
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
      <>
      <Approuter />
      </>
  )
}

export default App
