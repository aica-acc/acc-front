// import React from 'react'

// const AnalyzeBannerTrendPage = () => {
//   return (
//     <div className='flex justify-center'>AnalyzeBannerTrendPage</div>
//   )
// }

// export default AnalyzeBannerTrendPage



// src/pages/analyze/AnalyzeBannerTrendPage.jsx

// ####################### 임 시 코 드 ##################################
// src/pages/analyze/AnalyzeBannerTrendPage.jsx

import React, { useEffect, useState } from "react";

// acc-ai(이미지 서버) 기본 주소
// - .env 에 REACT_APP_ACCAI_BASE_URL 를 넣어두면 그 값을 사용
// - 없으면 개발용으로 http://localhost:5000 사용
const ACCAI_BASE_URL = "http://localhost:5000";

/**
 * 상대 경로/절대 경로를 받아서
 * 실제 <img src=...> 에 넣을 수 있는 완전한 URL로 변환
 */
function resolveImageUrl(rawUrl) {
  if (!rawUrl) return null;

  // 1) 이미 http(s)로 시작하면 그대로 사용
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  // 2) "/"로 시작하면 그대로 base 뒤에 붙이기
  if (rawUrl.startsWith("/")) {
    return `${ACCAI_BASE_URL}${rawUrl}`;
  }

  // 3) 나머지는 "static/xxx.jpg" 같은 형태라고 보고, 중간에 "/" 하나 넣어줌
  return `${ACCAI_BASE_URL}/${rawUrl}`;
}

const AnalyzeBannerTrendPage = () => {
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    // ProposalLoadingPage 에서 저장한 배너 트렌드 결과 가져오기
    const stored = sessionStorage.getItem("bannerTrendData");
    if (!stored) return;

    try {
      setTrend(JSON.parse(stored));
    } catch (e) {
      console.error("bannerTrendData 파싱 실패:", e);
    }
  }, []);

  // 저장된 데이터가 없을 때 (직접 URL로 접근했거나 새로고침한 경우)
  if (!trend) {
    return (
      <div className="flex flex-col items-center mt-16 text-gray-600">
        <h2 className="text-xl font-semibold mb-2">현수막 트렌드 분석 결과</h2>
        <p>저장된 트렌드 분석 결과가 없습니다.</p>
        <p className="text-sm mt-2">
          기획서 업로드 페이지에서 분석을 다시 진행해 주세요.
        </p>
      </div>
    );
  }

  const relatedFestivals = trend.related_festivals ?? [];
  const latestFestivals = trend.latest_festivals ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        현수막 트렌드 분석 결과
      </h1>

      {/* 1. 유사 테마 축제 현수막 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">1. 유사 테마 축제 현수막</h2>

        {relatedFestivals.length === 0 ? (
          <p className="text-sm text-gray-500">유사 테마 축제 정보가 없습니다.</p>
        ) : (
          // ✅ 2x2(최대 4개) 카드 레이아웃
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedFestivals.slice(0, 4).map((fest, idx) => {
              const resolvedUrl = resolveImageUrl(fest.banner_image_url);

              return (
                <div
                  key={`${fest.festival_id ?? idx}-related`}
                  className="border rounded-lg p-3 shadow-sm bg-white"
                >
                  {/* 축제명 (유사도 뱃지 제거) */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">
                      {fest.festival_name || "이름 없는 축제"}
                    </h3>
                  </div>

                  {/* 위: 현수막 이미지 */}
                  {resolvedUrl && (
                    <div className="mb-2">
                      <img
                        src={resolvedUrl}
                        alt={fest.festival_name || "축제 현수막 이미지"}
                        className="w-full h-50 object-cover rounded border border-black-300 mb-5"
                      />
                    </div>
                  )}

                  {/* 아래: 이미지 설명 */}
                  {fest.banner_image_description && (
                    <p className="text-xs text-gray-700 mb-2 whitespace-pre-line">
                      {fest.banner_image_description}
                    </p>
                  )}

                  {/* 기간 / 지역 */}
                  <div className="text-[11px] text-gray-500 space-y-1">
                    {(fest.start_date || fest.end_date) && (
                      <div>
                        기간: {fest.start_date || "?"} ~ {fest.end_date || "?"}
                      </div>
                    )}
                    {fest.region && <div>지역: {fest.region}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. 최근 축제 현수막 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">2. 최근 축제 현수막</h2>

        {latestFestivals.length === 0 ? (
          <p className="text-sm text-gray-500">최근 축제 정보가 없습니다.</p>
        ) : (
          // ✅ 2x2(최대 4개) 카드 레이아웃
          <div className="grid gap-4 sm:grid-cols-2">
            {latestFestivals.slice(0, 4).map((fest, idx) => {
              const resolvedUrl = resolveImageUrl(fest.banner_image_url);

              return (
                <div
                  key={`${fest.festival_id ?? idx}-latest`}
                  className="border rounded-lg p-3 shadow-sm bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">
                      {fest.festival_name || "이름 없는 축제"}
                    </h3>
                  </div>

                  {/* 위: 이미지 */}
                  {resolvedUrl && (
                    <div className="mb-2">
                      <img
                        src={resolvedUrl}
                        alt={fest.festival_name || "축제 현수막 이미지"}
                        className="w-full h-50 object-cover rounded border border-black-300 mb-5"
                      />
                    </div>
                  )}

                  {/* 아래: 설명 */}
                  {fest.banner_image_description && (
                    <p className="text-xs text-gray-700 mb-2 whitespace-pre-line">
                      {fest.banner_image_description}
                    </p>
                  )}

                  <div className="text-[11px] text-gray-500 space-y-1">
                    {(fest.start_date || fest.end_date) && (
                      <div>
                        기간: {fest.start_date || "?"} ~ {fest.end_date || "?"}
                      </div>
                    )}
                    {fest.region && <div>지역: {fest.region}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyzeBannerTrendPage;

