// (변경된 부분 중심으로 정리한 완성 코드)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api/BaseAPI";

const ProposalUploadPage = () => {
  const [festivalName, setFestivalName] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [theme, setTheme] = useState("");
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  // 저장된 데이터 복원
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("festivalForm") || "{}");
    if (saved) {
      setFestivalName(saved.festivalName || "");
      setKeywords(saved.keywords || []);
      setTheme(saved.theme || "");
      setFile(saved.file || null);
    }
  }, []);

  // 변경 시 저장
  useEffect(() => {
    localStorage.setItem(
      "festivalForm",
      JSON.stringify({ festivalName, keywords, theme, file })
    );
  }, [festivalName, keywords, theme, file]);

  // 키워드 추가
  const handleAddKeyword = () => {
    if (keywordInput.trim() === "" || keywords.length >= 5) return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  // 키워드 삭제
  const handleRemoveKeyword = (word) => {
    setKeywords(keywords.filter((k) => k !== word));
  };

  // 파일 업로드
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  // 🔥 POST는 제거하고 로딩 페이지로 이동만 함
  const handleAnalyze = () => {
    if (!file || !theme || keywords.length === 0 || !festivalName) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    // sessionStorage 초기화
    // localStorage.removeItem("festivalForm");

    // loading 페이지로 form 데이터 전달                       
    navigate("/proposalloading", {
      state: {
        file,
        theme,
        keywords,
        festivalName,
      },
    });
  };

  const isFormValid =
    festivalName.trim() !== "" &&
    keywords.length > 0 &&
    theme.trim() !== "" &&
    file !== null;

  return (
    <div className="max-w-4xl mx-auto mt-32 bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg" style={{ marginTop: '128px' }}>
      <h2 className="text-3xl font-semibold mb-3 text-center text-white">기획서 업로드</h2>
      <p className="text-gray-400 text-base text-center mb-8">
        축제 정보와 기획서를 업로드해주세요
      </p>

      {/* 축제명 */}
      <label className="block mb-2 text-base font-medium text-gray-300">축제명 *</label>
      <input
        type="text"
        placeholder="예: 제28회 보령머드축제"
        value={festivalName}
        onChange={(e) => setFestivalName(e.target.value)}
        className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 mb-5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* 키워드 */}
      <label className="block mb-2 text-base font-medium text-gray-300">
        키워드 (최대 5개) *
      </label>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="보령, 머드, 축제"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          className="flex-1 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAddKeyword}
          disabled={keywords.length >= 5}
          className={`px-5 py-3 text-base rounded-md border transition ${
            keywords.length >= 5
              ? "bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed"
              : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
          }`}
        >
          추가
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {keywords.map((word, idx) => (
          <span
            key={idx}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-base flex items-center gap-2"
          >
            {word}
            <button
              onClick={() => handleRemoveKeyword(word)}
              className="ml-1 font-bold text-white hover:text-gray-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* 테마 */}
      <label className="block mb-2 text-base font-medium text-gray-300">축제 테마 *</label>
      <textarea
        placeholder="지구촌 최대의 여름축제로..."
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        rows="4"
        className="w-full border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 mb-5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
      ></textarea>

      {/* 파일 업로드 */}
      <label className="block mb-2 text-base font-medium text-gray-300">
        기획서 업로드 *
      </label>
      <div
        className={`border-2 rounded-lg p-8 text-center mb-6 ${
          file ? "border-indigo-500 bg-indigo-500/10" : "border-dashed border-gray-600 bg-gray-700/50"
        }`}
      >
        {file ? (
          <div>
            <div className="text-indigo-400 font-medium text-lg">{file.name}</div>
            <div className="text-base text-gray-400 mb-4">
              {`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
            </div>
            <button
              onClick={() => setFile(null)}
              className="px-4 py-2 text-base border border-gray-600 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition"
            >
              다시 선택
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6 text-base">
              파일을 드래그하거나 업로드하세요
            </p>
            <label className="px-5 py-2.5 text-base border border-gray-600 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 cursor-pointer transition">
              파일 선택
              <input
                type="file"
                accept=".pdf,.doc,.docx,.hwp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-sm mt-5 text-gray-500 mt-3">
              PDF, Word, HWP 파일 지원 (최대 10MB)
            </p>
          </>
        )}
      </div>

      {/* 분석 시작하기 */}
      <button
        className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
          isFormValid
            ? "bg-yellow-300 hover:bg-yellow-400 text-black"
            : "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
        }`}
        disabled={!isFormValid}
        onClick={handleAnalyze}
      >
        분석 시작하기
      </button>
    </div>
  );
};

export default ProposalUploadPage;
