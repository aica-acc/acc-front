// src/pages/mypage/ProjectDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/BaseAPI";
import ImageModal from "../../components/mypage/ImageModal";

const formatDate = (d) => (d ? d.replaceAll("-", ".") : "");

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("promotions"); // "promotions" 또는 "strategy"
  const [modalImage, setModalImage] = useState(null);
  const [modalMediaType, setModalMediaType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/mypage/projects/${projectId}`);
        setProject(res.data);
      } catch (err) {
        console.error(err);
        setError("프로젝트 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111118] text-white flex items-center justify-center">
        <p className="text-gray-300">프로젝트 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111118] text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#111118] text-white flex items-center justify-center">
        <p className="text-gray-300">프로젝트 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const {
    festivalName,
    festivalStartDate,
    festivalEndDate,
    location,
    promotionCount,
    assets = [],
    projectNo, // pNo (프로젝트 번호)
  } = project;

  const countLabel = promotionCount ?? assets.length ?? 0;
  // pNo는 projectNo 또는 projectId로 사용 (API 응답에 따라)
  const pNo = projectNo || projectId;

  // 미디어 타입 감지 (이미지 또는 영상)
  const getMediaType = (url, typeCode) => {
    // typeCode로 영상 타입 확인
    if (typeCode && (typeCode.includes("video") || typeCode.includes("_video"))) {
      return "video";
    }
    // URL 확장자로 확인
    if (url && url.match(/\.(mp4|webm|ogg|mov)$/i)) {
      return "video";
    }
    return "image";
  };

  const handleImageClick = (mediaUrl, typeCode) => {
    const mediaType = getMediaType(mediaUrl, typeCode);
    setModalImage(mediaUrl);
    setModalMediaType(mediaType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
    setModalMediaType(null);
  };

  const handleStrategyTabClick = () => {
    // pNo를 sessionStorage에 저장하고 리포트 페이지로 이동
    if (pNo) {
      sessionStorage.setItem("editorPNo", pNo.toString());
      navigate("/report/result");
    } else {
      alert("프로젝트 번호를 찾을 수 없습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#111118] text-white">
      <div className="max-w-[1400px] mx-auto px-10 py-16">
        {/* ← 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-400 hover:text-white"
        >
          ← 프로젝트 목록으로
        </button>

        {/* 상단 프로필 영역 (이미지 참고) */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            {/* 프로필 아바타 */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              약
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{festivalName}</h1>
              <p className="text-sm text-gray-400">
                {formatDate(festivalStartDate)} ~ {formatDate(festivalEndDate)}
              </p>
              {location && (
                <p className="text-sm text-gray-500 mt-1">{location}</p>
              )}
            </div>
          </div>

          {/* 탭 버튼 (테두리 없이 밑줄만) */}
          <div className="flex gap-8 mb-0">
            <button
              onClick={() => setSelectedTab("promotions")}
              className={`pb-3 px-1 text-base font-medium transition-colors ${
                selectedTab === "promotions"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              내 홍보물
            </button>
            <button
              onClick={handleStrategyTabClick}
              className="pb-3 px-1 text-base font-medium transition-colors text-gray-400 hover:text-gray-300"
            >
              홍보물 전략
            </button>
          </div>

          {/* 탭 밑 구분선 */}
          <div className="border-b border-gray-700 mb-8"></div>
        </div>

        {/* 홍보물 카드 그리드 (3열, 더 큰 사이즈) */}
        {selectedTab === "promotions" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <div
                key={asset.assetId}
                className="bg-[#1b1c25] rounded-2xl overflow-hidden shadow-lg flex flex-col relative group"
              >
                {/* Draft 라벨 및 메뉴 아이콘 */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                  <span className="bg-gray-800/80 text-gray-300 text-xs px-2 py-1 rounded">
                    Draft
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 메뉴 기능 추가 가능
                    }}
                    className="text-gray-300 hover:text-white"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                </div>

                {/* 이미지/영상 영역 (클릭 가능) */}
                <div 
                  className="aspect-[4/3] overflow-hidden cursor-pointer relative bg-gray-900"
                  onClick={() => handleImageClick(asset.imageUrl, asset.typeCode)}
                >
                  {getMediaType(asset.imageUrl, asset.typeCode) === "video" ? (
                    // 영상 썸네일 표시
                    <video
                      src={asset.imageUrl}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      muted
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        // 첫 프레임을 썸네일로 사용
                        e.target.currentTime = 0.1;
                      }}
                    >
                      <source src={asset.imageUrl} type="video/mp4" />
                    </video>
                  ) : (
                    // 이미지 표시
                    <img
                      src={asset.imageUrl}
                      alt={asset.typeLabel}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                  {/* 영상 아이콘 표시 */}
                  {getMediaType(asset.imageUrl, asset.typeCode) === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl">▶</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 카드 하단 정보 및 버튼 */}
                <div className="px-6 py-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-base font-semibold mb-1">
                      {asset.typeLabel || asset.typeCode}
                    </p>
                  </div>

                  {/* 다운로드/삭제 버튼 */}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={asset.imageUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-center text-sm py-2 rounded-xl border border-gray-500 hover:border-purple-400 hover:bg-purple-600/20 transition"
                    >
                      ⬇ 다운로드
                    </a>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 text-sm py-2 rounded-xl border border-red-500 text-red-400 hover:bg-red-600/20 transition"
                      disabled
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {assets.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12">
                아직 생성된 홍보물이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 홍보물 전략 탭 - 리포트 페이지로 이동하므로 여기서는 표시 안 함 */}
      </div>

      {/* 이미지/영상 모달 */}
      <ImageModal
        mediaUrl={modalImage}
        mediaType={modalMediaType}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProjectDetailPage;
