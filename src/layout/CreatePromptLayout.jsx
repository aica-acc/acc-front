import React, { useRef, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import PromptSidebar from "../components/create/PromptSidebar";

const CreatePromptLayout = () => {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // ⭐ Layout이 관리하는 state
  const [basePrompt, setBasePrompt] = useState("");
  const [filePathNo, setFilePathNo] = useState(null);
  const [promptNo, setPromptNo] = useState(null);
  const [index, setIndex] = useState(null);
  const [thumbnailList, setThumbnailList] = useState([]);

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
          marginTop: headerHeight,
          height: `calc(100vh - ${headerHeight}px)`
        }}
      >
        <LeftSidebar />

        {/* ⭐ Page에서 setter 호출 가능하도록 context 내려줌 */}
        <main className="flex-1 overflow-auto px-6 py-6 flex justify-center bg-white">
          <Outlet
            context={{
              setBasePrompt,
              setFilePathNo,
              setPromptNo,
              setIndex,
              setThumbnailList,
              thumbnailList,   // ⭐ 추가
              index,           // ⭐ 추가
            }}
          />
        </main>

        {/* ⭐ PromptSidebar로 전달됨 */}
        <PromptSidebar
          basePrompt={basePrompt}
          filePathNo={filePathNo}
          promptNo={promptNo}
          index={index}
          thumbnailList={thumbnailList}
          onRegenerateComplete={() => {
            // 아래 CreatePosterPromptPage에게 알려줌
            window.dispatchEvent(new CustomEvent("regenerate-complete"));
          }}
        />
      </div>
    </div>
  );
};

export default CreatePromptLayout;
