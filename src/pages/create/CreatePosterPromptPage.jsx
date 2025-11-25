import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Image } from "../../utils/api/PosterAPI";
import ImageViewer from "../../components/create/ImageViewer";
import BulletIndicator from "../../components/create/BulletIndicator";
import NaviControls from "../../components/buttons/NavControls";

export default function CreatePosterPromptPage() {
  const navigate = useNavigate();
  const { setBasePrompt } = useOutletContext();

  // URL 파라미터
  const { filePathNo, promptNo } = useParams();

  const [thumbnailList, setThumbnailList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [index, setIndex] = useState(0);

  /** 1) thumbnailList 세션에서 로드 */
  useEffect(() => {
    const savedList = sessionStorage.getItem("thumbnailList");
    if (!savedList) return;

    const list = JSON.parse(savedList);
    setThumbnailList(list);

    // 현재 URL 기반 index 찾기
    const foundIndex = list.findIndex(
      (item) =>
        String(item.filePathNo) === String(filePathNo) &&
        String(item.promptNo) === String(promptNo)
    );

    if (foundIndex !== -1) setIndex(foundIndex);
  }, [filePathNo, promptNo]);

  /** 2) detail API */
  useEffect(() => {
    if (!filePathNo || !promptNo) return;

    Image.getDetail({ filePathNo, promptNo })
      .then((res) => {
        setDetail(res);
        sessionStorage.setItem("currentDetail", JSON.stringify(res));
      })
      .catch((err) => console.error(err));
  }, [filePathNo, promptNo]);

  /** 3) 프롬프트 사이드바로 전달 */
  useEffect(() => {
    if (detail?.visualPrompt) {
      setBasePrompt(detail.visualPrompt);
    }
  }, [detail]);

  /** 4) 네비게이션 이동 함수 */
  const goToIndex = (newIndex) => {
    const target = thumbnailList[newIndex];
    if (!target) return;

    navigate(`/create/poster/detail/${target.filePathNo}/${target.promptNo}`);
  };

  if (!detail)
    return <p className="text-gray-500 mt-10">이미지를 불러오는 중입니다...</p>;

  return (
    <div className="relative flex flex-col items-center">

      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
        <i className="bi bi-three-dots-vertical text-lg"></i>
      </button>

      <ImageViewer url={detail.fileUrl} onClick={() => {}} />

      <NaviControls
        index={index}
        total={thumbnailList.length}
        onPrev={() => goToIndex(index - 1)}
        onNext={() => goToIndex(index + 1)}
      />

      <BulletIndicator
        index={index}
        total={thumbnailList.length}
        onSelect={(i) => goToIndex(i)}
      />
    </div>
  );
}
