import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AnalyzeButton from "../../components/buttons/AnalyzeButton";
import { mergeTrendData } from "../../utils/trendUtils";

import projectSession from "../../utils/projectSession";
const PAGE_SIZE = 5;

const AnalyzeProposalThemePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [trendData, setTrendData] = useState(null);
  const [chartData, setChartData] = useState([]);

  // 관련 키워드 그룹별 페이지 상태 저장
  const [keywordPage, setKeywordPage] = useState({});

  // ------------------------------------------
  // 1) 데이터 로드 useEffect
  // ------------------------------------------
  useEffect(() => {
    // state → sessionStorage fallback
    let data = state?.trend;

    if (!data) {
      const saved = projectSession.getItem("trendData");
      if (saved) data = JSON.parse(saved);
    }

    if (!data) {
      alert("트렌드 분석 데이터가 없습니다.");
      navigate("/upload");
      return;
    }

    setTrendData(data);

    // 1) 구글 + 네이버 검색량 합쳐서 차트 데이터 생성
    const google = data.google_trend || [];

    const naverRaw = data.naver_datalab;
    let naverWeekly = [];
    
    if (Array.isArray(naverRaw)) {
      naverWeekly = naverRaw;
    } else if (naverRaw) {
      naverWeekly =
        naverRaw.naver_weekly ||
        naverRaw["naver_weekly "] ||
        [];
    }

    // 유틸 함수를 사용하여 네이버 날짜 정렬 문제 해결 (하루 밀림 보정 + 월요일 정규화)
    const merged = mergeTrendData(google, naverWeekly, true, true);

    setChartData(merged);

    // 관련 키워드 그룹별 pagination 초기화
    const groups = Object.keys(data.related_keywords || {});
    const initPage = {};
    groups.forEach((g) => (initPage[g] = 0));
    setKeywordPage(initPage);
  }, [state, navigate]);

  // ------------------------------------------
  // 2) 디버그 로그 출력 useEffect
  // ------------------------------------------
  useEffect(() => {
    if (!trendData) return;

    console.log("🔥 google_trend >>>", trendData.google_trend);
    console.log("🔥 naver_datalab >>>", trendData.naver_datalab);
    console.log("🔥 chartData >>>", chartData);
  }, [trendData, chartData]);

  // ------------------------------------------
  // 데이터 없으면 null 반환
  // ------------------------------------------
  if (!trendData) return null;

  // YouTube Trend
  const youtubeTrend = trendData.youtube_trend || [];
  const MAX_YOUTUBE = 5;
  const yt = youtubeTrend.slice(0, MAX_YOUTUBE);

  const mainYoutube = yt[0];
  const otherYoutube = yt.slice(1);

  // Related Keywords Group
  const keywordGroups = trendData.related_keywords || {};


  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        `}
      </style>

      {/* 헤더 섹션 */}
      <div style={{ 
        position: 'relative', height: '300px', 
        background: 'linear-gradient(135deg, rgb(55, 55, 65) 0%, rgb(30, 30, 48) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        color: 'white', textAlign: 'center', padding: '0 20px',
        marginBottom: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.1, borderRadius: '16px' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: '800px' }} className="animate-fade-in">
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', backdropFilter: 'blur(4px)' }}>
            Project Analysis
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '20px 0 10px', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            키워드 트렌드 분석
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, fontWeight: '300', color: '#D1D5DB' }}>
            데이터 인사이트로 발견하는 키워드 트렌드들
          </p>
        </div>
      </div>

      {/* ------------------------------
          1. Searching Graph
      --------------------------------*/}
      <section className="mt-4 animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Searching Graph
        </h2>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
          {chartData.length === 0 ? (
            <p className="text-center text-gray-400 text-base">
              검색량 데이터가 없습니다.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                    minTickGap={20}
                    stroke="#4B5563"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    stroke="#4B5563"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#D1D5DB' }}
                  />

                  <Line
                    type="monotone"
                    dataKey="google"
                    name="Google Trend"
                    stroke="#4285F4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="naver"
                    name="Naver Datalab"
                    stroke="#03C75A"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------
          2. Related & Rising Keyword (Group by Main Keyword)
      --------------------------------*/}
      <section className="animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Related & Rising Keyword
        </h2>

        <div className="space-y-8">
          {Object.keys(keywordGroups).map((groupKey, i) => {
            const group = keywordGroups[groupKey] || {};
            const top = group.top || [];
            const rising = group.rising || [];

            const totalPages = Math.max(
              Math.ceil(top.length / PAGE_SIZE),
              Math.ceil(rising.length / PAGE_SIZE)
            );

            const currentPage = keywordPage[groupKey] ?? 0;

            const topPaged = top.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
            const risingPaged = rising.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

            return (
              <div key={groupKey} className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-5 text-white">{groupKey}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LEFT - TOP */}
                  <div>
                    <h4 className="font-bold mb-3 text-base text-gray-300">관련 주제 (Top)</h4>
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-700/50">
                            <th className="w-12 py-2.5 text-center text-gray-300 font-semibold">#</th>
                            <th className="py-2.5 text-left px-3 text-gray-300 font-semibold">키워드</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPaged.length > 0 ? (
                            topPaged.map((item, idx) => (
                              <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                                <td className="py-2.5 text-center text-gray-400">
                                  {currentPage * PAGE_SIZE + idx + 1}
                                </td>
                                <td className="py-2.5 px-3 text-gray-200">{item}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="py-4 text-center text-gray-500 text-sm">
                                데이터 없음
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* RIGHT - RISING */}
                  <div>
                    <h4 className="font-bold mb-3 text-base text-gray-300">급상승 검색어 (Rising)</h4>
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-700/50">
                            <th className="w-12 py-2.5 text-center text-gray-300 font-semibold">#</th>
                            <th className="py-2.5 text-left px-3 text-gray-300 font-semibold">키워드</th>
                          </tr>
                        </thead>
                        <tbody>
                          {risingPaged.length > 0 ? (
                            risingPaged.map((item, idx) => (
                              <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                                <td className="py-2.5 text-center text-gray-400">
                                  {currentPage * PAGE_SIZE + idx + 1}
                                </td>
                                <td className="py-2.5 px-3 text-gray-200">{item}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="py-4 text-center text-gray-500 text-sm">
                                데이터 없음
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    disabled={currentPage === 0}
                    onClick={() =>
                      setKeywordPage((prev) => ({ ...prev, [groupKey]: Math.max(0, currentPage - 1) }))
                    }
                    className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    이전
                  </button>

                  <span className="text-sm text-gray-400 font-medium">
                    {currentPage + 1} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() =>
                      setKeywordPage((prev) => ({
                        ...prev,
                        [groupKey]: Math.min(totalPages - 1, currentPage + 1),
                      }))
                    }
                    className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    다음
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------
          3. YouTube Trend Report
      --------------------------------*/}
      <section className="pb-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          YouTube Trend Report
        </h2>

        {/* TOP 1 */}
        {mainYoutube && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-6 mb-8">
            <div className="md:w-2/5">
              <img
                src={mainYoutube.image}
                alt={mainYoutube.trend}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="md:w-3/5 flex flex-col gap-3">
              <div className="text-sm font-bold text-yellow-500">TOP 1</div>
              <h3 className="text-xl font-bold text-white">{mainYoutube.trend}</h3>
              <p className="text-base text-gray-400">{mainYoutube.subtitle}</p>
              <p className="text-base text-gray-300 leading-relaxed">{mainYoutube.analysis}</p>

              {mainYoutube.recommendations?.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-300 mt-2 space-y-1 ml-2">
                  {mainYoutube.recommendations.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}

              {mainYoutube.sources?.length > 0 && (
                <ul className="text-xs text-indigo-400 underline space-y-1 mt-2 break-all">
                  {mainYoutube.sources.map((src, idx) => (
                    <li key={idx}>
                      <a href={src} target="_blank" rel="noreferrer" className="hover:text-indigo-300 transition-colors">
                        {src}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* TOP 2~5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherYoutube.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors"
            >
              <img
                src={item.image}
                alt={item.trend}
                className="w-full h-40 object-cover rounded-xl"
              />
              <div className="text-sm font-bold text-yellow-500">
                TOP {idx + 2}
              </div>
              <h4 className="text-base font-bold text-white">{item.trend}</h4>
              <p className="text-sm text-gray-400">{item.subtitle}</p>
              <p className="text-sm text-gray-300 line-clamp-4">{item.analysis}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="pt-4">
      <AnalyzeButton/>    
      </div>
    </div>
  );
};

export default AnalyzeProposalThemePage;
