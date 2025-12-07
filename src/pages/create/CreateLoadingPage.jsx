import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Poster, Image } from "../../utils/api/PosterAPI";
import UnifiedLoadingPage from "../../components/loding/UnifiedLoadingPage";

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
        return Poster.createImage(posterPromptList, "poster");
      })
      .then((generatedImages) => {
        sessionStorage.setItem("generatedImages", JSON.stringify(generatedImages));
        setMessage("마스코트 프롬프트를 생성하고 있습니다...");
        // 3. 마스코트 프롬프트 생성
        return Poster.generatePrompt(trendData, "mascot");
      })
      .then((mascotPromptList) => {
        sessionStorage.setItem("mascotPromptList", JSON.stringify(mascotPromptList));
        setMessage("마스코트 이미지를 생성하고 있습니다...");
        // 4. 마스코트 이미지 생성 (추가됨)
        return Poster.createImage(mascotPromptList, "mascot");
      })
      .then((generatedMascotImages) => {
        sessionStorage.setItem("generatedMascotImages", JSON.stringify(generatedMascotImages));
        setMessage("생성된 이미지를 불러오고 있습니다...");

        // 5. 이미지 목록 조회 (포스터 + 마스코트 모두 조회)
        // DB에는 "poster", "mascot"으로 저장되므로 영문으로 호출해야 합니다.
        return Promise.all([
          Image.getThumbnailList("poster"),
          Image.getThumbnailList("mascot")
        ]);
      })
      .then(([posterList, mascotList]) => {
        // 포스터와 마스코트 리스트를 각각 분리 저장
        sessionStorage.setItem("posterThumbnailList", JSON.stringify(posterList));
        sessionStorage.setItem("mascotThumbnailList", JSON.stringify(mascotList));

        // 포스터 리스트가 없으면 에러
        if (posterList.length === 0) {
          throw new Error("생성된 포스터 이미지가 없습니다.");
        }

        const first = posterList[0];

        return Image.getDetail({
          filePathNo: first.filePathNo,
          promptNo: first.promptNo,
        });
      })
      .then((detail) => {
        sessionStorage.setItem("currentDetail", JSON.stringify(detail));

        const posterList = JSON.parse(sessionStorage.getItem("posterThumbnailList"));
        const first = posterList[0];

        navigate(`/create/poster/detail/${first.filePathNo}/${first.promptNo}`);
      })
      .catch((e) => {
        console.error(e);
        alert("오류 발생: " + e.message);
        navigate("/analyze");
      });
  }, [])

  return (
    <UnifiedLoadingPage 
      title={message}
      description="잠시만 기다려 주세요."
    />
  );
};

export default CreateLoadingPage;