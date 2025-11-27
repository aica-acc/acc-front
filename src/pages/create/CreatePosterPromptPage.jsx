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
    thumbnailList,
    index,
  } = useOutletContext();

  const { filePathNo, promptNo } = useParams();
  const [detail, setDetail] = useState(null);

  /** 1) 세션 로딩 */
  useEffect(() => {
    const saved = sessionStorage.getItem("thumbnailList");
    if (!saved) return;

    const list = JSON.parse(saved);
    setThumbnailList(list);

    const foundIndex = list.findIndex(
      (item) =>
        String(item.filePathNo) === String(filePathNo) &&
        String(item.promptNo) === String(promptNo)
    );

    if (foundIndex !== -1) {
      setIndex(foundIndex);
    }
  }, [filePathNo, promptNo]);

  /** 2) detail API */
  useEffect(() => {
    if (!filePathNo || !promptNo) return;

    Image.getDetail({ filePathNo, promptNo }).then((res) => {
      setDetail(res);
      setBasePrompt(res.visualPrompt);
      setFilePathNo(Number(filePathNo));
      setPromptNo(Number(promptNo));
    });
  }, [filePathNo, promptNo]);

  /** 3) 안전 렌더링 */
  if (!thumbnailList || thumbnailList.length === 0)
    return <p className="mt-10">로딩 중... (리스트 준비)</p>;

  if (!detail) return <p className="mt-10">로딩 중... (디테일)</p>;
  if (index == null) return <p className="mt-10">로딩 중... (인덱스)</p>;

  /** 4) 이동 */
  const goToIndex = (newIndex) => {
    const target = thumbnailList[newIndex];
    if (!target) return;
    navigate(`/create/poster/detail/${target.filePathNo}/${target.promptNo}`);
  };

  return (
    <div className="relative flex flex-col items-center">
      <ImageViewer url={detail.fileUrl} />

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
