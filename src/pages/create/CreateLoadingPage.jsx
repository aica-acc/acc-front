import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Poster, Image } from "../../utils/api/PosterAPI";
import LoadingSpinner from "../../components/loding/LoadingSpinner";

const CreateLoadingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [message, setMessage] = useState("포스터 프롬프트를 생성하고 있습니다...");

  useEffect(() => {
    if (!state) {
      alert("프롬프트 데이터가 없습니다.");
      navigate("/analyze");
      return;
    }

    const trendData = state;

    // 1. 포스터 프롬프트 생성
    Poster.generatePrompt(trendData, "poster")
      .then((posterPromptList) => {
        sessionStorage.setItem("posterPromptList", JSON.stringify(posterPromptList));
        setMessage("포스터 이미지를 생성하고 있습니다...");
        // 2. 포스터 이미지 생성
        return Poster.createImage(posterPromptList);
      })
      .then((generatedImages) => {
        sessionStorage.setItem("generatedImages", JSON.stringify(generatedImages));
        setMessage("마스코트 프롬프트를 생성하고 있습니다...");
        // 3. 마스코트 프롬프트 생성
        return Poster.generatePrompt(trendData, "mascot");
      })
      .then((mascotPromptList) => {
        sessionStorage.setItem("mascotPromptList", JSON.stringify(mascotPromptList));
        setMessage("생성된 이미지를 불러오고 있습니다...");
        // 4. 이미지 목록 조회
        return Image.getThumbnailList("포스터");
      })
      .then((thumbnailList) => {
        sessionStorage.setItem("thumbnailList", JSON.stringify(thumbnailList));

        const first = thumbnailList[0];

        return Image.getDetail({
          filePathNo: first.filePathNo,
          promptNo: first.promptNo,
        });
      })
      .then((detail) => {
        sessionStorage.setItem("currentDetail", JSON.stringify(detail));

        const first = JSON.parse(sessionStorage.getItem("thumbnailList"))[0];

        // ★ navigate는 절대경로 사용
        navigate(`/create/poster/detail/${first.filePathNo}/${first.promptNo}`);
      })
      .catch((e) => {
        console.error(e);
        alert("오류 발생");
        navigate("/analyze");
      });
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-white">
      <LoadingSpinner message={message} />
    </div>
  );
};

export default CreateLoadingPage;