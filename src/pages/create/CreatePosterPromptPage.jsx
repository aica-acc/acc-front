import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Image } from "../../utils/api/PosterAPI";
import ImageViewer from "../../components/create/ImageViewer";
import BulletIndicator from "../../components/create/BulletIndicator";
import NaviControls from "../../components/buttons/NavControls";
import { convertToFullPath } from "../../config/appConfig";

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
  const [selectedTypes, setSelectedTypes] = useState([]);

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

  // 파생 만들기 버튼 핸들러
  const handleCreateDerivative = () => {
    if (selectedTypes.length === 0) {
      alert("최소 하나 이상의 홍보물 타입을 선택해주세요.");
      return;
    }

    // sessionStorage에서 proposalData 가져오기
    const proposalDataStr = sessionStorage.getItem("proposalData");
    if (!proposalDataStr) {
      alert("기획서 데이터를 찾을 수 없습니다.");
      return;
    }

    const proposalData = JSON.parse(proposalDataStr);
    
    // 이미지 경로를 전체 파일 시스템 경로로 변환
    const fullImagePath = convertToFullPath(detail.fileUrl);
    
    // postersPayload 구성
    const postersPayload = [
      {
        posterImageUrl: fullImagePath, // 전체 경로로 변환된 이미지 URL
        title: proposalData.title || "",
        festivalStartDate: proposalData.festivalStartDate 
          ? new Date(proposalData.festivalStartDate).toISOString().split('T')[0]
          : "",
        festivalEndDate: proposalData.festivalEndDate
          ? new Date(proposalData.festivalEndDate).toISOString().split('T')[0]
          : "",
        location: proposalData.location || "",
        types: selectedTypes, // 선택한 types
      },
    ];

    // pNo 가져오기 (proposalData에서 projectNo 사용)
    const pNo = proposalData.projectNo || 1;

    // EditorLoadingPage로 이동
    navigate("/testlodingpage", {
      state: {
        pNo,
        postersPayload,
      },
    });
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen pb-24">
      <ImageViewer 
        url={detail.fileUrl} 
        onClick={() => {}}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
      />

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

      {/* 파생 만들기 버튼 - 화면 하단 고정 */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={handleCreateDerivative}
          disabled={selectedTypes.length === 0}
          className={`px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-all
            ${selectedTypes.length === 0 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          파생 만들기
          {selectedTypes.length > 0 && (
            <span className="ml-2 text-sm">({selectedTypes.length}개 선택됨)</span>
          )}
        </button>
      </div>
    </div>
  );
}
