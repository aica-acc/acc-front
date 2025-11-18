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

const PAGE_SIZE = 5;

function normalizeToMonday(period) {
  const d = new Date(period);
  const day = d.getDay(); // 0=Sunday
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

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
      const saved = sessionStorage.getItem("trendData");
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

    const map = new Map();

    google.forEach((item) => {
      const key = item?.period;
      if (!key) return;
      if (!map.has(key)) map.set(key, { period: key });
      map.get(key).google = item.ratio ?? 0;
    });

    naverWeekly.forEach((item) => {
      const key = normalizeToMonday(item.period);
      if (!key) return;
      if (!map.has(key)) map.set(key, { period: key });
      map.get(key).naver = item.ratio ?? 0;
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(a.period) - new Date(b.period)
    );

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

      {/* ------------------------------
          1. Searching Graph
      --------------------------------*/}
      <section className="mt-4">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Searching Graph
        </h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {chartData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">
              검색량 데이터가 없습니다.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} minTickGap={20} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="google"
                    name="Google Trend"
                    stroke="#4285F4"
                    strokeWidth={2}
                    dot={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="naver"
                    name="Naver Datalab"
                    stroke="#03C75A"
                    strokeWidth={2}
                    dot={true}
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
      <section>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Related & Rising Keyword
        </h2>

        <div className="space-y-12">
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
              <div key={groupKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold mb-4">{groupKey}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LEFT - TOP */}
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-700">관련 주제 (Top)</h4>
                    <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-10 py-2 text-center text-gray-400">#</th>
                          <th className="py-2 text-left text-gray-400">키워드</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPaged.length > 0 ? (
                          topPaged.map((item, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="py-2 text-center text-gray-500">
                                {currentPage * PAGE_SIZE + idx + 1}
                              </td>
                              <td className="py-2 px-2 text-gray-800">{item}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-gray-400 text-xs">
                              데이터 없음
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* RIGHT - RISING */}
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-700">급상승 검색어 (Rising)</h4>
                    <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-10 py-2 text-center text-gray-400">#</th>
                          <th className="py-2 text-left text-gray-400">키워드</th>
                        </tr>
                      </thead>
                      <tbody>
                        {risingPaged.length > 0 ? (
                          risingPaged.map((item, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="py-2 text-center text-gray-500">
                                {currentPage * PAGE_SIZE + idx + 1}
                              </td>
                              <td className="py-2 px-2 text-gray-800">{item}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-gray-400 text-xs">
                              데이터 없음
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    disabled={currentPage === 0}
                    onClick={() =>
                      setKeywordPage((prev) => ({ ...prev, [groupKey]: Math.max(0, currentPage - 1) }))
                    }
                    className="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    이전
                  </button>

                  <span className="text-xs text-gray-500">
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
                    className="px-3 py-1.5 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
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
      <section className="pb-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          YouTube Trend Report
        </h2>

        {/* TOP 1 */}
        {mainYoutube && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 mb-8">
            <div className="md:w-2/5">
              <img
                src={mainYoutube.image}
                alt={mainYoutube.trend}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="md:w-3/5 flex flex-col gap-3">
              <div className="text-xs font-semibold text-green-600">TOP 1</div>
              <h3 className="text-xl font-semibold">{mainYoutube.trend}</h3>
              <p className="text-sm text-gray-500">{mainYoutube.subtitle}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{mainYoutube.analysis}</p>

              {mainYoutube.recommendations?.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  {mainYoutube.recommendations.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}

              {mainYoutube.sources?.length > 0 && (
                <ul className="text-xs text-blue-600 underline space-y-1 mt-2 break-all">
                  {mainYoutube.sources.map((src, idx) => (
                    <li key={idx}>
                      <a href={src} target="_blank" rel="noreferrer">
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
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3"
            >
              <img
                src={item.image}
                alt={item.trend}
                className="w-full h-40 object-cover rounded-xl"
              />
              <div className="text-xs font-semibold text-gray-500">
                TOP {idx + 2}
              </div>
              <h4 className="text-base font-semibold">{item.trend}</h4>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
              <p className="text-xs text-gray-700 line-clamp-4">{item.analysis}</p>
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
