// src/pages/mypage/ProjectDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api/BaseAPI";

const formatDate = (d) => (d ? d.replaceAll("-", ".") : "");

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  } = project;

  const countLabel = promotionCount ?? assets.length ?? 0;

  return (
    <div className="min-h-screen bg-[#111118] text-white">
      <div className="max-w-6xl mx-auto px-10 py-16">
        {/* ← 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-400 hover:text-white"
        >
          ← 프로젝트 목록으로
        </button>

        {/* 상단 텍스트 헤더 (이미지 없음) */}
        <h1 className="text-3xl font-bold mb-2">{festivalName}</h1>
        <p className="text-gray-300 mb-1">
          {formatDate(festivalStartDate)} ~ {formatDate(festivalEndDate)}
        </p>
        {location && (
          <p className="text-gray-400 mb-8">{location}</p>
        )}

        {/* 홍보물 개수 */}
        <h2 className="text-lg font-semibold mb-4">
          {countLabel}개의 홍보물
        </h2>

        {/* 홍보물 카드 그리드 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div
              key={asset.assetId}
              className="bg-[#1b1c25] rounded-2xl overflow-hidden shadow-lg flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={asset.imageUrl}
                  alt={asset.typeLabel}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="px-6 py-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-base font-semibold">
                    {asset.typeLabel || asset.typeCode}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {/* 다운로드 버튼 – 진짜 다운로드되게만 해두고 삭제는 아직 기능 없이 UI만 */}
                  <a
                    href={asset.imageUrl}
                    download
                    className="flex-1 text-center text-sm py-2 rounded-xl border border-gray-500 hover:border-purple-400 hover:bg-purple-600/20 transition"
                  >
                    ⬇ 다운로드
                  </a>
                  <button
                    type="button"
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
            <div className="text-gray-400">
              아직 생성된 홍보물이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
