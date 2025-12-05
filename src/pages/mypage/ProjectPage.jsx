// src/pages/mypage/ProjectPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/BaseAPI";

const formatDate = (d) => (d ? d.replaceAll("-", ".") : "");

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 6; // 2행 3열 = 6개

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/api/mypage/projects", {
          // 로그인 붙기 전까지는 임시 고정
          params: { m_no: "M000001" },
        });
        // 백엔드에서 이미 thumbnailUrl을 포함해서 반환하므로 그대로 사용
        setProjects(res.data);
      } catch (e) {
        console.error(e);
        setError("프로젝트 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleClickCard = (projectId) => {
    // 👉 여기서 상세 페이지로 이동
    navigate(`/mypage/project/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111118] text-white flex items-center justify-center">
        <p className="text-gray-300">프로젝트를 불러오는 중입니다...</p>
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

  if (projects.length === 0) {
    // ✅ 프로젝트 없을 때 화면 (지금 쓰고 있는 화면이랑 같은 느낌)
    return (
      <div className="min-h-screen bg-[#111118] text-white">
        <div className="max-w-6xl mx-auto px-10 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Project</h1>
          <p className="text-gray-300">
            생성한 축제 프로젝트와 홍보물을 한눈에 확인할 수 있어요.
          </p>
          <p className="mt-24 text-gray-400">
            아직 생성된 프로젝트가 없어요.
            <br />
            새로운 축제 기획서를 업로드해서 첫 프로젝트를 만들어보세요.
          </p>
        </div>
      </div>
    );
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, endIndex);

  // ✅ 프로젝트 카드 리스트 화면
  return (
    <div className="min-h-screen bg-[#111118] text-white">
      <div className="max-w-[1400px] mx-auto px-10 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">My Project</h1>
          <p className="text-gray-300">
            생성한 축제 프로젝트와 홍보물을 한눈에 확인할 수 있어요.
          </p>
        </div>

        {/* ProjectDetailPage와 비슷한 그리드 레이아웃 (2행 3열 = 6개) */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {currentProjects.map((p) => (
            <button
              key={p.projectId}
              type="button"
              onClick={() => handleClickCard(p.projectId)}
              className="relative bg-[#1b1c25] rounded-2xl shadow-lg overflow-hidden text-left transition-transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none flex flex-col"
            >
              {/* 상단 폴더 탭 모양 (유지) */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-10 rounded-2xl bg-[#30324a] shadow-md z-10" />

              {/* 썸네일 이미지 영역 */}
              <div className="aspect-[4/3] overflow-hidden bg-gray-800 flex items-center justify-center relative">
                {p.thumbnailUrl ? (
                  <>
                    <img
                      src={p.thumbnailUrl}
                      alt={p.festivalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 숨기고 "정보 없음" 표시
                        e.target.style.display = 'none';
                        const errorDiv = e.target.nextElementSibling;
                        if (errorDiv) {
                          errorDiv.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden text-gray-500 text-sm absolute inset-0 items-center justify-center">
                      정보 없음
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-sm">정보 없음</div>
                )}
              </div>

              {/* 카드 하단 정보 */}
              <div className="px-6 py-4 flex-1 flex flex-col">
                <p className="text-lg font-semibold mb-2">
                  {p.festivalName}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  {formatDate(p.festivalStartDate)} ~ {formatDate(p.festivalEndDate)}
                </p>
                <p className="text-sm text-gray-500">
                  {(p.promotionCount ?? 0) + "개의 홍보물"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 페이지네이션 (6개 이상일 때만 표시) */}
        {projects.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              이전
            </button>

            <span className="text-sm text-gray-400 font-medium">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
