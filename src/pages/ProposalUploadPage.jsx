import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";

const ProposalUploadPage = () => {
  const [festivalName, setFestivalName] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [theme, setTheme] = useState("");
  const [file, setFile] = useState(null);

  // ✅ 저장된 데이터 복원
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("festivalForm") || "{}");
    if (saved) {
      setFestivalName(saved.festivalName || "");
      setKeywords(saved.keywords || []);
      setTheme(saved.theme || "");
      setFile(saved.file || null);
    }
  }, []);

  // ✅ 데이터 변경 시마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(
      "festivalForm",
      JSON.stringify({ festivalName, keywords, theme, file })
    );
  }, [festivalName, keywords, theme, file]);

  // ✅ 키워드 추가
  const handleAddKeyword = () => {
    if (keywordInput.trim() === "" || keywords.length >= 5) return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  // ✅ 키워드 삭제
  const handleRemoveKeyword = (word) => {
    setKeywords(keywords.filter((k) => k !== word));
  };

  // ✅ 파일 업로드
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile({
        name: selected.name,
        size: (selected.size / (1024 * 1024)).toFixed(2) + " MB",
      });
    }
  };

  // ✅ 모든 필수값이 입력됐는지 확인
  const isFormValid =
    festivalName.trim() !== "" &&
    keywords.length > 0 &&
    theme.trim() !== "" &&
    file !== null;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-2 text-center">기획서 업로드</h2>
      <p className="text-gray-500 text-sm text-center mb-6">
        축제 정보와 기획서를 업로드해주세요
      </p>

      {/* 축제명 */}
      <label className="block mb-1 font-medium text-gray-700">축제명 *</label>
      <input
        type="text"
        placeholder="예: 제28회 보령머드축제"
        value={festivalName}
        onChange={(e) => setFestivalName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring focus:ring-blue-200"
      />

      {/* 키워드 */}
      <label className="block mb-1 font-medium text-gray-700">
        키워드 (최대 5개) *
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="보령, 머드, 축제"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleAddKeyword}
          disabled={keywords.length >= 5}
          className={`px-4 py-2 rounded-md border ${
            keywords.length >= 5
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          추가
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {keywords.map((word, idx) => (
          <span
            key={idx}
            className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {word}
            <button
              onClick={() => handleRemoveKeyword(word)}
              className="ml-1 font-bold text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* 축제 테마 */}
      <label className="block mb-1 font-medium text-gray-700">축제 테마 *</label>
      <textarea
        placeholder="지구촌 최대의 여름축제로 국적, 언어, 연령의 구분없이 모두가 하나가되어 즐기는 체험형 축제입니다."
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        rows="3"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring focus:ring-blue-200"
      ></textarea>

      {/* 기획서 업로드 */}
      <label className="block mb-1 font-medium text-gray-700">
        기획서 업로드 *
      </label>
      <div
        className={`border-2 rounded-lg p-6 text-center mb-6 ${
          file ? "border-green-300 bg-green-50" : "border-dashed border-gray-300"
        }`}
      >
        {file ? (
          <div>
            <div className="text-green-700 font-medium">{file.name}</div>
            <div className="text-sm text-gray-600 mb-3">{file.size}</div>
            <button
              onClick={() => setFile(null)}
              className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              다시 선택
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-5">
              파일을 드래그하거나 업로드하세요
            </p>
            <label className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100 cursor-pointer">
              파일 선택
              <input
                type="file"
                accept=".pdf,.doc,.docx,.hwp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs mt-5 text-gray-400 mt-2">
              PDF, Word, HWP 파일 지원 (최대 10MB)
            </p>
          </>
        )}
      </div>

      {/* 분석 시작하기 */}
      <button
        className={`w-full py-3 rounded-lg font-semibold transition ${
          isFormValid
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isFormValid}
        onClick={() => alert("✅ 입력값이 저장되었습니다.")}
      >
        분석 시작하기
      </button>
    </div>
  );
};
export default ProposalUploadPage