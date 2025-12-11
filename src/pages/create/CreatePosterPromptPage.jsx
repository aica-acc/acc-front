import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Image } from "../../utils/api/PosterAPI";
import ImageViewer from "../../components/create/ImageViewer";
import BulletIndicator from "../../components/create/BulletIndicator";
import NaviControls from "../../components/buttons/NavControls";
import BaseSelectButton from "../../components/buttons/BaseSelectButton";
import { convertToFullPath } from "../../config/appConfig";
import { saveEditorImage } from "../../utils/api/EditorAPI";
import { imageUrlToBase64 } from "../../utils/imageUtils";

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
  const [isSelected, setIsSelected] = useState(false);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);

  /** 1) 세션 로딩 */
  useEffect(() => {
    const saved = sessionStorage.getItem("posterThumbnailList");
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
      
      // 선택된 이미지 확인
      const selectedPosterStr = sessionStorage.getItem("selectedPosterImage");
      const currentFilePathNo = Number(filePathNo);
      const currentPromptNo = Number(promptNo);
      
      if (selectedPosterStr) {
        const selectedPoster = JSON.parse(selectedPosterStr);
        if (selectedPoster.source === "generated" && 
            selectedPoster.filePathNo === currentFilePathNo && 
            selectedPoster.promptNo === currentPromptNo) {
          setIsSelected(true);
        } else {
          setIsSelected(false);
        }
      } else {
        setIsSelected(false);
      }
      
      // 업로드된 이미지 확인 (업로드된 이미지가 선택되어 있지 않은 경우에만 표시)
      const uploadedPosterStr = sessionStorage.getItem("uploadedPosterImage");
      const hasUploaded = !!uploadedPosterStr;
      
      // 업로드된 이미지가 선택되어 있는지 확인
      let uploadedImageSelected = false;
      if (selectedPosterStr) {
        const selectedPoster = JSON.parse(selectedPosterStr);
        if (selectedPoster.source === "uploaded") {
          uploadedImageSelected = true;
        }
      }
      
      // 업로드된 이미지가 있고, 선택되어 있지 않으면 회색 체크 표시
      setHasUploadedImage(hasUploaded && !uploadedImageSelected);
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

  // 선택하기 버튼 핸들러
  const handleSelectImage = () => {
    if (!detail) return;
    
    // 업로드 선택 해제 (생성된 이미지를 선택하면 업로드 선택이 해제됨)
    const uploadedPosterStr = sessionStorage.getItem("uploadedPosterImage");
    if (uploadedPosterStr) {
      const uploadedPoster = JSON.parse(uploadedPosterStr);
      uploadedPoster.selected = false;
      sessionStorage.setItem("uploadedPosterImage", JSON.stringify(uploadedPoster));
    }
    
    // 상대 경로와 절대 경로 모두 저장
    const relativePath = detail.fileUrl; // /data/promotion/... 형태
    const fullImagePath = convertToFullPath(detail.fileUrl);
    
    sessionStorage.setItem("selectedPosterImage", JSON.stringify({
      fileUrl: relativePath,        // 상대 경로 (DB 저장용)
      fullPath: fullImagePath,      // 절대 경로 (표시용)
      filePathNo: detail.filePathNo,
      promptNo: detail.promptNo,
      source: "generated"
    }));
    
    console.log("✅ [포스터 선택] 세션에 저장됨:", {
      relativePath,
      fullPath: fullImagePath
    });
    
    setIsSelected(true);
    setHasUploadedImage(false);
  };

  // 파생 만들기 버튼 핸들러
  const handleCreateDerivative = async () => {
    // 선택된 이미지 확인
    const selectedPosterStr = sessionStorage.getItem("selectedPosterImage");
    const selectedMascotStr = sessionStorage.getItem("selectedMascotImage");
    
    // 유효한 선택인지 확인
    let posterSelected = false;
    let mascotSelected = false;
    
    if (selectedPosterStr) {
      try {
        const selectedPoster = JSON.parse(selectedPosterStr);
        posterSelected = !!(selectedPoster.fileUrl && selectedPoster.fileUrl.trim() !== "");
      } catch (e) {
        console.error("포스터 선택 데이터 파싱 오류:", e);
      }
    }
    
    if (selectedMascotStr) {
      try {
        const selectedMascot = JSON.parse(selectedMascotStr);
        mascotSelected = !!(selectedMascot.fileUrl && selectedMascot.fileUrl.trim() !== "");
      } catch (e) {
        console.error("마스코트 선택 데이터 파싱 오류:", e);
      }
    }
    
    // 선택 안한 이미지가 있으면 alert 표시
    if (!posterSelected || !mascotSelected) {
      const message = `이미지를 선택해주세요.\n포스터 ${posterSelected ? 1 : 0} / 1\n마스코트 ${mascotSelected ? 1 : 0} / 1`;
      alert(message);
      return;
    }

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
    
    // 선택된 이미지 가져오기
    const selectedPoster = JSON.parse(selectedPosterStr);
    const selectedMascot = JSON.parse(selectedMascotStr);
    
    // pNo 가져오기 (proposalData에서 pNo 또는 projectNo 사용)
    const pNo = proposalData.pNo || proposalData.projectNo || 1;

    try {
      // 1️⃣ 베이스 이미지 2개를 먼저 promotion_path에 저장
      console.log("💾 [베이스 이미지 저장] 시작...");
      
      // 포스터 이미지 저장 (생성된 이미지는 경로만, 업로드된 이미지는 base64)
      let posterSaveResult;
      let posterImageUrl; // payload용 경로
      
      if (selectedPoster.source === "generated") {
        // 생성된 이미지: 상대 경로 사용
        const posterPath = selectedPoster.fileUrl; // /data/promotion/... 형태
        posterImageUrl = selectedPoster.fullPath || convertToFullPath(posterPath); // payload용은 절대 경로
        posterSaveResult = await saveEditorImage({
          pNo,
          imagePath: posterPath,
          dbFileType: "poster",
        });
      } else {
        // 업로드된 이미지: base64 변환 (하위 호환성)
        posterImageUrl = selectedPoster.fileUrl;
        const posterBase64 = await imageUrlToBase64(selectedPoster.fileUrl);
        posterSaveResult = await saveEditorImage({
          pNo,
          imageBase64: posterBase64,
          dbFileType: "poster",
        });
      }
      console.log("✅ [포스터 저장 완료]:", posterSaveResult.savedPath);

      // 마스코트 이미지 저장 (생성된 이미지는 경로만, 업로드된 이미지는 base64)
      let mascotSaveResult;
      let mascotImageUrl; // payload용 경로
      
      if (selectedMascot.source === "generated") {
        // 생성된 이미지: 상대 경로 사용
        const mascotPath = selectedMascot.fileUrl; // /data/promotion/... 형태
        mascotImageUrl = selectedMascot.fullPath || convertToFullPath(mascotPath); // payload용은 절대 경로
        mascotSaveResult = await saveEditorImage({
          pNo,
          imagePath: mascotPath,
          dbFileType: "mascot",
        });
      } else {
        // 업로드된 이미지: base64 변환 (하위 호환성)
        mascotImageUrl = selectedMascot.fileUrl;
        const mascotBase64 = await imageUrlToBase64(selectedMascot.fileUrl);
        mascotSaveResult = await saveEditorImage({
          pNo,
          imageBase64: mascotBase64,
          dbFileType: "mascot",
        });
      }
      console.log("✅ [마스코트 저장 완료]:", mascotSaveResult.savedPath);

      // 2️⃣ postersPayload 구성 (절대 경로 사용)
      const postersPayload = [
        {
          posterImageUrl: posterImageUrl,
          mascotImageUrl: mascotImageUrl,
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

      console.log("📦 [Payload 구성 완료]:", postersPayload);

      // 3️⃣ 세션 삭제 (payload 전송 전에 삭제)
      sessionStorage.removeItem("uploadedPosterImage");
      sessionStorage.removeItem("uploadedMascotImage");
      sessionStorage.removeItem("selectedPosterImage");
      sessionStorage.removeItem("selectedMascotImage");
      console.log("🗑️ [세션 삭제 완료] 선택된 이미지 정보 삭제됨");

      // 4️⃣ EditorLoadingPage로 이동 (파생물 생성)
      navigate("/testlodingpage", {
        state: {
          pNo,
          postersPayload,
        },
      });
    } catch (error) {
      console.error("❌ [파생물 만들기] 오류:", error);
      alert(`베이스 이미지 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full bg-neutral-900 overflow-hidden">
      {/* 우측 상단 선택하기 버튼 및 체크 표시 */}
      <BaseSelectButton
        isSelected={isSelected}
        hasUploadedImage={hasUploadedImage}
        onSelect={handleSelectImage}
      />

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
