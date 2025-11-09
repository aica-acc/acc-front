import React, { useState } from "react";

const AnalyzeProposalListPage = () => {
  const [formData, setFormData] = useState({
    title: "담양 크리스마스 판타 축제",
    period: "2025년 12월 20일 ~ 12월 25일",
    location: "전남 담양군 담양읍 메타세쿼이아 랜드",
    host: "담양군청",
    organizer: "담양문화재단",
    target: "가족 단위 방문객 (주 타깃: 30~40대 부모와 자녀)",
    website: "https://danyang-festival.com",
    direction: "광주에서 자동차로 30분, 담양 IC에서 10분",
    visual: "판타 캐릭터, 크리스마스 트리, 메타세쿼이아, 활강/눈썰매/축제 컬러",
    program: "크리스마스 판타 퍼포먼스, 메타세쿼이아 일루미네이션, 담양 축제를 맛봄",
    event: "크리스마스 커플 콘서트, 포토타임 이벤트",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("✅ 현재 입력값:", formData);
    alert("입력값이 콘솔에 출력되었습니다 (추후 DB 저장 예정)");
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">기획서 정보 입력</h2>

      <div className="space-y-5">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {(() => {
                switch (key) {
                  case "title": return "축제 제목";
                  case "period": return "축제 기간";
                  case "location": return "장소";
                  case "host": return "주최기관";
                  case "organizer": return "주관기관";
                  case "target": return "타겟";
                  case "website": return "웹사이트 주소";
                  case "direction": return "오시는 길";
                  case "visual": return "시각요소";
                  case "program": return "프로그래밍";
                  case "event": return "이벤트";
                  default: return key;
                }
              })()}
            </label>
            <input
              type="text"
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default AnalyzeProposalListPage;
