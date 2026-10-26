import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/BaseAPI";

const isVideo = (a) =>
  /video/i.test(a.typeCode || "") || /\.(mp4|webm|ogg|mov)$/i.test(a.imageUrl || "");

const formatDate = (d) => (d ? d.replaceAll("-", ".") : "");

/** 저장소: 내가 만든 모든 프로젝트의 홍보물을 한곳에서 모아 보고 내려받는다 */
const DrivePage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [type, setType] = useState("all");
  const [project, setProject] = useState("all");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api
      .get("/api/mypage/assets")
      .then((res) => setAssets(res.data))
      .catch(() => setError("저장소를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const types = useMemo(
    () => [...new Map(assets.map((a) => [a.typeCode, a.typeLabel || a.typeCode])).entries()],
    [assets]
  );
  const projects = useMemo(
    () => [...new Map(assets.map((a) => [a.projectId, a.festivalName || `프로젝트 ${a.projectId}`])).entries()],
    [assets]
  );

  const shown = assets.filter(
    (a) => (type === "all" || a.typeCode === type) && (project === "all" || String(a.projectId) === project)
  );

  if (loading) return <p className="text-center text-gray-400 py-20">불러오는 중...</p>;
  if (error) return <p className="text-center text-red-400 py-20">{error}</p>;

  const selectClass = "bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2";

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-2">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">저장소</h1>
          <p className="text-gray-400 text-sm mt-1">내가 만든 모든 홍보물 {assets.length}개</p>
        </div>
        <div className="flex gap-3">
          <select className={selectClass} value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">전체 프로젝트</option>
            {projects.map(([id, name]) => (
              <option key={id} value={String(id)}>
                {name}
              </option>
            ))}
          </select>
          <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">전체 종류</option>
            {types.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-center text-gray-400 py-24">
          {assets.length === 0 ? (
            <>
              <p className="mb-4">아직 생성된 홍보물이 없습니다.</p>
              <button
                onClick={() => navigate("/select")}
                className="px-6 py-2.5 rounded-full bg-yellow-300 text-black font-semibold hover:bg-yellow-400 transition"
              >
                홍보물 만들러 가기
              </button>
            </>
          ) : (
            "조건에 맞는 홍보물이 없습니다."
          )}
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((a) => (
            <div key={a.assetId} className="bg-[#1b1c25] rounded-2xl overflow-hidden flex flex-col">
              <button
                type="button"
                onClick={() => setPreview(a)}
                className="aspect-[4/3] bg-gray-900 flex items-center justify-center relative"
              >
                {isVideo(a) ? (
                  <>
                    <video
                      src={a.imageUrl}
                      className="w-full h-full object-contain"
                      muted
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        e.target.currentTime = 0.1;
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-3xl bg-black/20">▶</span>
                  </>
                ) : (
                  <img src={a.imageUrl} alt={a.typeLabel} className="w-full h-full object-contain" loading="lazy" />
                )}
              </button>
              <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-semibold">{a.typeLabel || a.typeCode}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/mypage/project/${a.projectId}`)}
                    className="text-xs text-gray-400 hover:text-yellow-300 text-left truncate max-w-full"
                  >
                    {a.festivalName || `프로젝트 ${a.projectId}`} · {formatDate(a.createdAt)}
                  </button>
                </div>
                <a
                  href={a.imageUrl}
                  download
                  className="mt-3 text-center text-sm py-1.5 rounded-lg border border-gray-500 hover:border-purple-400 hover:bg-purple-600/20 transition"
                >
                  ⬇ 다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 미리보기 */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-6 text-white text-3xl"
            onClick={() => setPreview(null)}
            aria-label="닫기"
          >
            ×
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-5xl max-h-full">
            {isVideo(preview) ? (
              <video src={preview.imageUrl} controls autoPlay className="max-h-[85vh] max-w-full rounded-lg" />
            ) : (
              <img src={preview.imageUrl} alt={preview.typeLabel} className="max-h-[85vh] max-w-full rounded-lg" />
            )}
            <p className="text-center text-gray-300 mt-3">{preview.typeLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrivePage;
