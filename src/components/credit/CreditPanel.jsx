import React, { useEffect, useState } from "react";
import api from "../../utils/api/BaseAPI";

// 백엔드 CreditService.COSTS 의 키 → 화면 이름
const COST_LABEL = {
  "analyze-proposal": "기획서 분석",
  trend: "트렌드 분석 (1회)",
  "poster-images": "포스터 생성 (4장)",
  "mascot-images": "마스코트 생성 (4장)",
  regenerate: "포스터 다시 만들기",
  "derivative-basic": "로고·표지판·굿즈 (1종)",
  "derivative-banner": "현수막·버스·지하철 광고 (1종)",
  "derivative-premium": "리플렛·카드뉴스 (1종)",
  "derivative-video": "홍보 영상 (1편)",
  "ai-render": "에디터 AI 색상 추천",
  report: "리포트 (종류별 처음 한 번)",
  "live-poster": "라이브 포스터",
};

const REASON_LABEL = {
  SIGNUP_BONUS: "가입 기념",
  ADMIN_GRANT: "관리자 지급",
  USE: "사용",
  REFUND: "환불",
};

/** 마이프로필의 크레딧: 남은 크레딧, 기능별 차감량, 최근 내역 */
export default function CreditPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/credits/me")
      .then((res) => setData(res.data))
      .catch(() => setError("크레딧 정보를 불러오지 못했습니다."));
  }, []);

  if (error) return <p className="mb-8 text-red-400 text-sm">{error}</p>;
  if (!data || data.demo) return null;

  return (
    <section className="bg-[#1b1c25] rounded-2xl p-6 mb-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold">크레딧</h2>
        <p className="text-2xl font-bold text-yellow-300">
          {data.unlimited ? "무제한 (관리자)" : `${data.balance.toLocaleString()} 크레딧`}
        </p>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        AI 생성을 시작할 때 차감되고, 생성에 실패하면 돌려드립니다. 이미 만든 결과를 다시 쓰는 경우에는 차감하지 않습니다.
        가입하면 {data.signupBonus.toLocaleString()} 크레딧(홍보물 전체를 한 번 만들 수 있는 양)을 드립니다.
      </p>

      <h3 className="text-sm font-semibold text-gray-300 mb-2">기능별 차감</h3>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-6">
        {Object.entries(data.costs).map(([key, cost]) => (
          <div key={key} className="flex justify-between border-b border-gray-700/60 py-1.5">
            <span className="text-gray-300">{COST_LABEL[key] || key}</span>
            <span className="text-gray-100 font-semibold">{cost}</span>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-gray-300 mb-2">최근 내역</h3>
      {data.history.length === 0 ? (
        <p className="text-sm text-gray-500">아직 내역이 없습니다.</p>
      ) : (
        <ul className="text-sm divide-y divide-gray-700/60">
          {data.history.map((h, i) => (
            <li key={i} className="flex items-center justify-between py-2 gap-3">
              <span className="text-gray-400 shrink-0 w-36">{String(h.createdAt).replace("T", " ").slice(0, 16)}</span>
              <span className="flex-1 text-gray-200 truncate">
                {REASON_LABEL[h.reason] || h.reason}
                {h.memo ? ` · ${h.memo}` : ""}
              </span>
              <span className={h.delta >= 0 ? "text-green-400 font-semibold" : "text-red-300 font-semibold"}>
                {h.delta >= 0 ? `+${h.delta}` : h.delta}
              </span>
              <span className="text-gray-500 w-16 text-right">{h.balance}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
