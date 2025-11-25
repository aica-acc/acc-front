import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Poster } from "../../utils/api/PosterAPI";
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

    if (!trendData) {
      alert("필수 데이터가 부족합니다.");
      navigate("/analyze");
      return;
    }

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

        navigate("/create/poster", { state: { images: generatedImages } });
      })
      .catch((err) => {
        console.error("❌ 로딩 과정에서 오류:", err);
        alert("이미지 또는 프롬프트 생성 중 문제가 발생했습니다.");
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
