// src/pages/mypage/ProjectPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/BaseAPI";

const formatDate = (d) => (d ? d.replaceAll("-", ".") : "");

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/api/mypage/projects", {
          // 로그인 붙기 전까지는 임시 고정
          params: { m_no: "M000001" },
        });
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

  // ✅ 프로젝트 카드 리스트 화면
  return (
    <div className="min-h-screen bg-[#111118] text-white">
      <div className="max-w-6xl mx-auto px-10 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Project</h1>
          <p className="text-gray-300">
            생성한 축제 프로젝트와 홍보물을 한눈에 확인할 수 있어요.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 justify-center">
          {projects.map((p) => (
            <button
              key={p.projectId}
              type="button"
              onClick={() => handleClickCard(p.projectId)}
              className="relative w-full max-w-md bg-gradient-to-b from-[#27283b] to-[#1b1c25] rounded-3xl shadow-xl overflow-hidden text-left transition-transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none"
            >
              {/* 상단 폴더 탭 모양 */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-10 rounded-2xl bg-[#30324a] shadow-md" />

              <div className="pt-8 px-8 pb-6">
                <div className="mt-4">
                  <p className="text-lg font-semibold mb-3">
                    {p.festivalName}
                  </p>
                  <p className="text-sm text-gray-300 mb-2">
                    {formatDate(p.festivalStartDate)} -{" "}
                    {formatDate(p.festivalEndDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(p.promotionCount ?? 0) + "개의 홍보물"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
