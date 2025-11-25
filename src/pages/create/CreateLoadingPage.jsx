import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Poster } from "../../utils/api/PosterAPI";
import { Image } from "../../utils/api/PosterAPI"; // 신규 리스트/디테일 API
import LoadingSpinner from "../../components/loding/LoadingSpinner";

const CreateLoadingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [message, setMessage] = useState("프롬프트를 생성하고 있습니다...");

  useEffect(() => {
    if (!state) {
      alert("프롬프트 생성에 필요한 데이터가 없습니다.");
      navigate("/analyze");
      return;
    }

    const trendData = state;

    // 1단계 — FastAPI 프롬프트 생성
    Poster.generatePrompt(trendData)
      .then((promptList) => {
        console.log("💡 프롬프트 생성 완료:", promptList);

        sessionStorage.setItem("promptList", JSON.stringify(promptList));

        // 문구 업데이트
        setMessage("이미지를 생성하고 있습니다...");

        // 2단계 — 이미지 생성
        return Poster.createImage(promptList);
      })
      .then((generatedImages) => {
        console.log("🎨 이미지 생성 완료:", generatedImages);

        sessionStorage.setItem(
          "generatedImages",
          JSON.stringify(generatedImages)
        );

        // 3단계 — 리스트 데이터 백엔드에서 불러오기
        setMessage("생성된 이미지를 불러오고 있습니다...");

        return Image.getThumbnailList("포스터");
      })
      .then((thumbnailList) => {
        console.log("🖼️ 썸네일 리스트 로드 완료:", thumbnailList);

        if (!thumbnailList || thumbnailList.length === 0) {
          throw new Error("생성된 이미지 리스트가 없습니다.");
        }

        // 리스트 세션 저장
        sessionStorage.setItem(
          "thumbnailList",
          JSON.stringify(thumbnailList)
        );

        // 첫 번째 요소 기준으로 상세 조회
        const first = thumbnailList[0];
        return Image.getDetail({
          filePathNo: first.filePathNo,
          promptNo: first.promptNo,
        });
      })
      .then((detail) => {
        console.log("🔍 첫 번째 상세 데이터 로드 완료:", detail);

        sessionStorage.setItem("currentDetail", JSON.stringify(detail));

        // 디테일 페이지로 이동
        navigate("/create/poster/detail", {
          state: {
            detail,
            index: 0,
          },
        });
      })
      .catch((err) => {
        console.error("❌ 로딩 과정에서 오류:", err);
        alert("생성 과정에서 오류가 발생했습니다.");
        navigate("/analyze");
      });
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
      <LoadingSpinner message={message} />
    </div>
  );
};

export default CreateLoadingPage;
