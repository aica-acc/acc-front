import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";
import UnifiedLoadingPage from "../components/loding/UnifiedLoadingPage";

import projectSession from "../utils/projectSession";
const EditorLoadingPage = () => {
  const { state } = useLocation(); // TestPage → { pNo, postersPayload }
  const navigate = useNavigate();

  const [message] = useState("포스터 레이아웃을 생성 중입니다...");

  useEffect(() => {
    if (!state) {
      alert("빌드 정보가 없습니다. 포스터 선택 페이지로 이동합니다.");
      // sessionStorage에서 thumbnailList의 첫 번째 항목 가져오기
      const saved = projectSession.getItem("thumbnailList");
      if (saved) {
        const list = JSON.parse(saved);
        if (list && list.length > 0) {
          const firstItem = list[0];
          navigate(`/create/poster/detail/${firstItem.filePathNo}/${firstItem.promptNo}`);
          return;
        }
      }
      // thumbnailList가 없으면 select 페이지로
      navigate("/select");
      return;
    }

    const runBuild = async () => {
      try {
        const { pNo, postersPayload } = state;

        /* -------------------------------
         * 1️⃣ POST - 템플릿 빌드
         * ------------------------------- */
        const buildRes = await api.post(
          `/api/editor/build?pNo=${pNo}`,
          JSON.stringify(postersPayload), // ⭐ 반드시 문자열로 보내야 함
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📌 Build Response:", buildRes.data);

        const runId = buildRes.data.runId;

        // pNo 는 현재 프로젝트(useProjectStore)와 같다. EditorPage 는 state 또는 스토어에서 읽는다

        /* -------------------------------
         * 2️⃣ EditorPage로 이동 (pNo만 전달, GET은 EditorPage에서 수행)
         * ------------------------------- */
        navigate("/editorpage", {
          state: {
            pNo,
            runId,
          },
        });

      } catch (err) {
        console.error("❌ Editor 빌드 실패:", err);
        alert("빌드 중 오류가 발생했습니다. 포스터 선택 페이지로 이동합니다.");
        // sessionStorage에서 thumbnailList의 첫 번째 항목 가져오기
        const saved = projectSession.getItem("thumbnailList");
        if (saved) {
          const list = JSON.parse(saved);
          if (list && list.length > 0) {
            const firstItem = list[0];
            navigate(`/create/poster/detail/${firstItem.filePathNo}/${firstItem.promptNo}`);
            return;
          }
        }
        // thumbnailList가 없으면 select 페이지로
        navigate("/select");
      }
    };

    runBuild();
  }, [state, navigate]);

  return (
    <UnifiedLoadingPage 
      title={message}
      description="잠시만 기다려 주세요."
    />
  );
};

export default EditorLoadingPage;
