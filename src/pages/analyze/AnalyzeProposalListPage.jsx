import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import projectSession from "../../utils/projectSession";
const AnalyzeProposalListPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 🔥 날짜 포맷 정리
  const normalizeDate = (value) => {
  if (!value) return "";

  // 숫자(timestamp)인 경우
  if (typeof value === "number") {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 문자열 형태 (예: "2024-11-30T00:00:00")
  if (typeof value === "string") {
    return value.split("T")[0].split(" ")[0];
  }

  return "";
};

  // 🔥 쉼표·배열 기반 → 줄바꿈 처리
  const safeArrayMultilineText = (val) => {
    if (!val || val.trim() === "[]") return "";
    const trimmed = val.trim();

    // ["a","b","c"] 형태
    if (trimmed.startsWith("[") && trimmed.includes('"')) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr)) return arr.join("\n");
      } catch (_) {}
    }

    // [a, b, c] 형태
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return trimmed.slice(1, -1).split(",").join("\n");
    }

    return val;
  };

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    let data = state?.proposal;

    // sessionStorage 복구
    if (!data) {
      const saved = projectSession.getItem("proposalData");
      if (saved) data = JSON.parse(saved);
    }

    if (!data) {
      alert("분석된 기획서 데이터가 없습니다.");
      navigate("/upload");
      return;
    }

    // formData 구성
    setFormData({
      title: data.title,
      festivalStartDate: normalizeDate(data.festivalStartDate),
      festivalEndDate: normalizeDate(data.festivalEndDate),
      location: data.location,
      host: data.host,
      organizer: data.organizer,
      target: data.target,
      contactInfo: data.contactInfo,
      directions: data.directions,

      visualKeywords: safeArrayMultilineText(data.visualKeywords),
      programName: safeArrayMultilineText(data.programName),
      eventName: safeArrayMultilineText(data.eventName),
    });
  }, [state, navigate]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 🔥 수정된 formData를 sessionStorage에 저장

    // 화면에 없는 값(pNo, projectNo 등)은 기존 proposalData 에서 보존하고 입력값만 덮어쓴다
    const prev = JSON.parse(projectSession.getItem("proposalData") || "{}");
    const updated = { ...prev, ...formData };
    projectSession.setItem("proposalData", JSON.stringify(updated));
    setFormData(updated);
    alert("저장이 완료되었습니다.");
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-gray-800 border border-gray-700 shadow-md rounded-xl p-8">
      <h2 className="text-3xl font-bold mb-6 text-white">기획서 정보</h2>

      <div className="space-y-5">
        {/* 축제 제목 */}
        <div>
          <label className="block text-base font-medium mb-2 text-gray-300">축제 제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 🔥 날짜 1줄 표시 */}
        <div>
          <label className="block text-base font-medium mb-2 text-gray-300">축제 기간</label>
          <div className="flex gap-4">
            <input
              type="date"
              name="festivalStartDate"
              value={formData.festivalStartDate || ""}
              onChange={handleChange}
              className="w-1/2 px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              name="festivalEndDate" 
              value={formData.festivalEndDate || ""}
              onChange={handleChange}
              className="w-1/2 px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 일반 입력 필드 + 줄바꿈 필드 분리 */}
        {[
          ["location", "장소"],
          ["host", "주최"],
          ["organizer", "주관"],
          ["target", "타깃"],
          ["contactInfo", "웹사이트"],
          ["directions", "오시는 길"],

          // 🔥 textarea 전환
          ["visualKeywords", "시각 요소"],
          ["programName", "프로그램"],
          ["eventName", "이벤트"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-base font-medium mb-2 text-gray-300">{label}</label>

            {["visualKeywords", "programName", "eventName"].includes(key) ? (
              <textarea
                name={key}
                value={formData[key]}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            ) : (
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-black font-semibold rounded-lg transition"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default AnalyzeProposalListPage;