import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectCheckIcon from "../../components/buttons/SelectCheckIcon";
import { convertToFullPath } from "../../config/appConfig";

const CreateUploadPage = () => {
  const navigate = useNavigate();
  const [posterImage, setPosterImage] = useState(null);
  const [mascotImage, setMascotImage] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [mascotPreview, setMascotPreview] = useState(null);
  const [posterSelected, setPosterSelected] = useState(false);
  const [mascotSelected, setMascotSelected] = useState(false);
  const posterFileInputRef = useRef(null);
  const mascotFileInputRef = useRef(null);

  // 세션에서 업로드한 이미지 복원
  useEffect(() => {
    const uploadedPosterStr = sessionStorage.getItem("uploadedPosterImage");
    const uploadedMascotStr = sessionStorage.getItem("uploadedMascotImage");
    
    if (uploadedPosterStr) {
      const uploadedPoster = JSON.parse(uploadedPosterStr);
      setPosterPreview(uploadedPoster.preview);
      setPosterSelected(uploadedPoster.selected || false);
    }
    
    if (uploadedMascotStr) {
      const uploadedMascot = JSON.parse(uploadedMascotStr);
      setMascotPreview(uploadedMascot.preview);
      setMascotSelected(uploadedMascot.selected || false);
    }

    // 선택된 이미지 확인
    const selectedPosterStr = sessionStorage.getItem("selectedPosterImage");
    const selectedMascotStr = sessionStorage.getItem("selectedMascotImage");
    
    if (selectedPosterStr) {
      const selectedPoster = JSON.parse(selectedPosterStr);
      if (selectedPoster.source === "uploaded") {
        setPosterSelected(true);
      }
    }
    
    if (selectedMascotStr) {
      const selectedMascot = JSON.parse(selectedMascotStr);
      if (selectedMascot.source === "uploaded") {
        setMascotSelected(true);
      }
    }
  }, []);

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setPosterImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result;
      setPosterPreview(preview);
      // 세션에 저장
      sessionStorage.setItem("uploadedPosterImage", JSON.stringify({
        preview: preview,
        fileName: file.name,
        selected: false
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleMascotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setMascotImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result;
      setMascotPreview(preview);
      // 세션에 저장
      sessionStorage.setItem("uploadedMascotImage", JSON.stringify({
        preview: preview,
        fileName: file.name,
        selected: false
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePosterSelect = () => {
    if (!posterPreview) {
      alert("포스터 이미지를 먼저 업로드해주세요.");
      return;
    }

    // 업로드한 이미지를 세션에 저장
    sessionStorage.setItem("selectedPosterImage", JSON.stringify({
      fileUrl: posterPreview,
      source: "uploaded",
      fileName: posterImage?.name || "uploaded_poster"
    }));
    
    // 업로드 이미지 세션 업데이트
    const uploadedPosterStr = sessionStorage.getItem("uploadedPosterImage");
    if (uploadedPosterStr) {
      const uploadedPoster = JSON.parse(uploadedPosterStr);
      uploadedPoster.selected = true;
      sessionStorage.setItem("uploadedPosterImage", JSON.stringify(uploadedPoster));
    }
    
    setPosterSelected(true);
  };

  const handleMascotSelect = () => {
    if (!mascotPreview) {
      alert("마스코트 이미지를 먼저 업로드해주세요.");
      return;
    }

    // 업로드한 이미지를 세션에 저장
    sessionStorage.setItem("selectedMascotImage", JSON.stringify({
      fileUrl: mascotPreview,
      source: "uploaded",
      fileName: mascotImage?.name || "uploaded_mascot"
    }));
    
    // 업로드 이미지 세션 업데이트
    const uploadedMascotStr = sessionStorage.getItem("uploadedMascotImage");
    if (uploadedMascotStr) {
      const uploadedMascot = JSON.parse(uploadedMascotStr);
      uploadedMascot.selected = true;
      sessionStorage.setItem("uploadedMascotImage", JSON.stringify(uploadedMascot));
    }
    
    setMascotSelected(true);
  };

  const handlePosterRemove = () => {
    setPosterImage(null);
    setPosterPreview(null);
    setPosterSelected(false);
    sessionStorage.removeItem("uploadedPosterImage");
    sessionStorage.removeItem("selectedPosterImage");
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = "";
    }
  };

  const handleMascotRemove = () => {
    setMascotImage(null);
    setMascotPreview(null);
    setMascotSelected(false);
    sessionStorage.removeItem("uploadedMascotImage");
    sessionStorage.removeItem("selectedMascotImage");
    if (mascotFileInputRef.current) {
      mascotFileInputRef.current.value = "";
    }
  };

  // 파생 만들기 버튼 핸들러
  const handleCreateDerivative = () => {
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
    
    const typesStr = sessionStorage.getItem("types");
    const types = typesStr ? JSON.parse(typesStr) : [];
    
    let programName = [];
    if (proposalData.programName) {
      if (Array.isArray(proposalData.programName)) {
        programName = proposalData.programName;
      } else if (typeof proposalData.programName === 'string') {
        try {
          const parsed = JSON.parse(proposalData.programName);
          programName = Array.isArray(parsed) ? parsed : [proposalData.programName];
        } catch {
          programName = proposalData.programName.split(/[,\n]/).map(s => s.trim()).filter(s => s);
        }
      }
    }
    
    const conceptDescription = proposalData.conceptDescription || "";
    
    // 선택된 이미지 가져오기
    const selectedPoster = JSON.parse(selectedPosterStr);
    const selectedMascot = JSON.parse(selectedMascotStr);
    
    // 이미지 URL 처리
    let posterImageUrl = selectedPoster.fileUrl;
    let mascotImageUrl = selectedMascot.fileUrl;
    
    if (selectedPoster.source === "generated") {
      posterImageUrl = convertToFullPath(selectedPoster.fileUrl);
    }
    if (selectedMascot.source === "generated") {
      mascotImageUrl = convertToFullPath(selectedMascot.fileUrl);
    }
    
    // postersPayload 구성
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
        types: types,
        programName: programName,
        conceptDescription: conceptDescription,
      },
    ];

    const pNo = proposalData.projectNo || 1;

    // 업로드 이미지 세션 삭제
    sessionStorage.removeItem("uploadedPosterImage");
    sessionStorage.removeItem("uploadedMascotImage");

    // EditorLoadingPage로 이동
    navigate("/testlodingpage", {
      state: {
        pNo,
        postersPayload,
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 p-8">
      <div className="flex gap-8 w-full max-w-4xl mb-6">
        {/* 포스터 업로드 카드 */}
        <div className="flex-1 bg-gray-800 rounded-xl p-6 border border-gray-700 relative">
          {/* 체크 표시 */}
          <SelectCheckIcon
            isSelected={posterSelected}
            showEmptyCheck={!posterSelected && !!posterPreview}
          />
          <h2 className="text-xl font-bold text-white mb-4">포스터 업로드</h2>
          
          <div className="flex flex-col items-center gap-4">
            {/* 업로드 영역 */}
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handlePosterUpload}
                ref={posterFileInputRef}
                className="hidden"
                id="poster-upload"
              />
              <label
                htmlFor="poster-upload"
                className="block w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-center bg-gray-700"
              >
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="포스터 미리보기"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <i className="bi bi-cloud-upload text-4xl mb-2"></i>
                    <p className="text-sm">클릭하여 포스터 이미지 업로드</p>
                  </div>
                )}
              </label>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 w-full">
              {posterPreview && (
                <>
                  <button
                    onClick={handlePosterSelect}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-semibold bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    선택하기
                  </button>
                  <button
                    onClick={handlePosterRemove}
                    className="px-4 py-2 rounded-lg text-white font-semibold bg-gray-600 hover:bg-gray-500 transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 마스코트 업로드 카드 */}
        <div className="flex-1 bg-gray-800 rounded-xl p-6 border border-gray-700 relative">
          {/* 체크 표시 */}
          <SelectCheckIcon
            isSelected={mascotSelected}
            showEmptyCheck={!mascotSelected && !!mascotPreview}
          />
          <h2 className="text-xl font-bold text-white mb-4">마스코트 업로드</h2>
          
          <div className="flex flex-col items-center gap-4">
            {/* 업로드 영역 */}
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleMascotUpload}
                ref={mascotFileInputRef}
                className="hidden"
                id="mascot-upload"
              />
              <label
                htmlFor="mascot-upload"
                className="block w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors flex items-center justify-center bg-gray-700"
              >
                {mascotPreview ? (
                  <img
                    src={mascotPreview}
                    alt="마스코트 미리보기"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <i className="bi bi-cloud-upload text-4xl mb-2"></i>
                    <p className="text-sm">클릭하여 마스코트 이미지 업로드</p>
                  </div>
                )}
              </label>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 w-full">
              {mascotPreview && (
                <>
                  <button
                    onClick={handleMascotSelect}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-semibold bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    선택하기
                  </button>
                  <button
                    onClick={handleMascotRemove}
                    className="px-4 py-2 rounded-lg text-white font-semibold bg-gray-600 hover:bg-gray-500 transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 파생 만들기 버튼 */}
      <button
        onClick={handleCreateDerivative}
        className="px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-all bg-yellow-500 hover:bg-yellow-600"
      >
        파생 만들기
      </button>
    </div>
  );
};

export default CreateUploadPage;
