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
  const [selectedTypes, setSelectedTypes] = useState([]);

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
    
    // postersPayload 구성
    const postersPayload = [
      {
        posterImageUrl: detail.fileUrl, // 현재 이미지 URL
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

  if (!detail)
    return <p className="text-gray-500 mt-10">로딩 중...</p>;

  return (
    <div className="relative flex flex-col items-center min-h-screen pb-24">
      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
        <i className="bi bi-three-dots-vertical text-lg"></i>
      </button>

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
