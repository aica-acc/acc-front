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
    // sessionStorage에서 proposalData 가져오기
    const proposalDataStr = sessionStorage.getItem("proposalData");
    if (!proposalDataStr) {
      alert("기획서 데이터를 찾을 수 없습니다.");
      return;
    }

    const proposalData = JSON.parse(proposalDataStr);
    
    // 원래 코드 (주석 처리 - 필요시 사용)
    const typesStr = sessionStorage.getItem("types");
    const types = typesStr ? JSON.parse(typesStr) : [];
    
    // programName 처리 (배열 또는 문자열일 수 있음)
    let programName = [];
    if (proposalData.programName) {
      if (Array.isArray(proposalData.programName)) {
        programName = proposalData.programName;
      } else if (typeof proposalData.programName === 'string') {
        // 문자열인 경우 파싱 시도
        try {
          const parsed = JSON.parse(proposalData.programName);
          programName = Array.isArray(parsed) ? parsed : [proposalData.programName];
        } catch {
          // 파싱 실패 시 줄바꿈이나 쉼표로 분리
          programName = proposalData.programName.split(/[,\n]/).map(s => s.trim()).filter(s => s);
        }
      }
    }
    
    // conceptDescription 가져오기
    const conceptDescription = proposalData.conceptDescription || "";
    
    // 현재 보고 있는 이미지의 주소 사용 (detail.fileUrl)
    const fullImagePath = convertToFullPath(detail.fileUrl);
    
    // 마스코트 이미지 URL 더미 값
    const mascotImageUrl = "C:/final_project/ACC/acc-frontend/public/data/test/mascot1.png"; // 더미 고정값
    
    // postersPayload 구성
    const postersPayload = [
      {
        posterImageUrl: fullImagePath, // 현재 보고 있는 이미지의 전체 경로
        mascotImageUrl: mascotImageUrl, // 더미 고정값
        title: proposalData.title || "",
        festivalStartDate: proposalData.festivalStartDate
          ? new Date(proposalData.festivalStartDate).toISOString().split('T')[0]
          : "",
        festivalEndDate: proposalData.festivalEndDate
          ? new Date(proposalData.festivalEndDate).toISOString().split('T')[0]
          : "",
        location: proposalData.location || "",
        types: types, // SelectPromotionPage에서 선택한 types
        programName: programName, // metadata에서 가져온 programName
        conceptDescription: conceptDescription, // metadata에서 가져온 conceptDescription
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
    <div className="relative flex flex-col items-center justify-center h-full w-full bg-neutral-900 overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full w-full gap-4">
        {/* 이미지 뷰어 - 남은 공간을 차지하도록 flex-1 사용 */}
        <div className="flex-1 flex items-center justify-center min-h-0 w-full px-4">
          <ImageViewer 
            url={detail.fileUrl} 
            onClick={() => {}}
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
          />
        </div>

        {/* 하단 컨트롤 영역 - 고정 높이 */}
        <div className="flex flex-col items-center gap-3 pb-4 shrink-0">
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

          {/* 파생 만들기 버튼 */}
          <button
            onClick={handleCreateDerivative}
            className="px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-all bg-yellow-500 hover:bg-yellow-600"
          >
            파생 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
