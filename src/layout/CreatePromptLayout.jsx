import React, { useRef, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import PromptSidebar from "../components/create/PromptSidebar";

const CreatePromptLayout = () => {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const resizeHandler = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <Header ref={headerRef} />
      <div
        className="flex w-full"
        style={{
          marginTop: headerHeight,              // ← 핵심!
          height: `calc(100vh - ${headerHeight}px)`
        }}
      >
        <LeftSidebar />
        <main className="flex-1 overflow-auto px-6 py-6 flex justify-center bg-white">
          <Outlet />
        </main>
        <PromptSidebar />
      </div>
    </div>
  );
}

export default CreatePromptLayout;
