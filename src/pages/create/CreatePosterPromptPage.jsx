import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Image } from "../../utils/api/PosterAPI";
import ImageViewer from "../../components/create/ImageViewer";
import BulletIndicator from "../../components/create/BulletIndicator";
import NaviControls from "../../components/buttons/NavControls";

export default function CreatePosterPromptPage() {
  const navigate = useNavigate();

  const {
    setBasePrompt,
    setFilePathNo,
    setPromptNo,
    setIndex,
    setThumbnailList,
  } = useOutletContext();

  const { filePathNo, promptNo } = useParams();

  const [thumbnailList, localSetList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [index, localSetIndex] = useState(0);

  /** 1) thumbnailList 세션에서 로드 */
  useEffect(() => {
    const saved = sessionStorage.getItem("thumbnailList");
    if (!saved) return;

    const list = JSON.parse(saved);
    localSetList(list);
    setThumbnailList(list); // ⭐ Layout 업데이트

    const foundIndex = list.findIndex(
      (item) =>
        String(item.filePathNo) === String(filePathNo) &&
        String(item.promptNo) === String(promptNo)
    );

    if (foundIndex !== -1) {
      localSetIndex(foundIndex);
      setIndex(foundIndex); // ⭐ Layout 업데이트
    }
  }, [filePathNo, promptNo]);

  /** 2) detail API - 최초 로드 + URL 변경 시 호출 */
  useEffect(() => {
    if (!filePathNo || !promptNo) return;

    Image.getDetail({ filePathNo, promptNo })
      .then((res) => {
        setDetail(res);

        // ⭐ Layout 업데이트 (상위로 전달하는 값들)
        setBasePrompt(res.visualPrompt);
        setFilePathNo(Number(filePathNo));
        setPromptNo(Number(promptNo));
      })
      .catch((err) => console.error(err));
  }, [filePathNo, promptNo]);

  /** 3) regenerate-complete 이벤트 발생 시 detail 다시 가져오기 */
  useEffect(() => {
    const handler = () => {
      setDetail(null); // ← Skeleton 다시 표시
      Image.getDetail({ filePathNo, promptNo })
        .then((res) => {
          setDetail(res);
          setBasePrompt(res.visualPrompt);
          setFilePathNo(Number(filePathNo));
          setPromptNo(Number(promptNo));
        });
    };

    window.addEventListener("regenerate-complete", handler);
    return () => window.removeEventListener("regenerate-complete", handler);
  }, [filePathNo, promptNo]);

  const goToIndex = (newIndex) => {
    const target = thumbnailList[newIndex];
    if (!target) return;

    navigate(`/create/poster/detail/${target.filePathNo}/${target.promptNo}`);
  };

  if (!detail)
    return <p className="text-gray-500 mt-10">로딩 중...</p>;

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
