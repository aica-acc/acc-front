import React from "react";
import { useNavigate } from "react-router-dom";

const TestPage = () => {
  const navigate = useNavigate();

  const handleGoToLoading = () => {
    // ⭐ 포스터 테스트 데이터
    const postersPayload = [
      {
        posterImageUrl:
          "C:\\final_project\\ACC\\acc-ai\\app\\data\\test.png",
        title: "제 17회 담양 산타 축제",
        festivalStartDate: "2025-12-24",
        festivalEndDate: "2025-12-25",
        location: "담양 메타랜드 일원",
        types: ["road_banner", "bus_shelter", "subway_light"],
      },
    ];

    const pNo = 3; // 테스트용 pNo

    // ⭐ EditorLoadingPage로 이동 + state 전달
    navigate("/testlodingpage", {
      state: {
        pNo,
        postersPayload,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4">Editor Build TestPage</h1>

        <p className="text-gray-600 mb-4">
          아래 버튼을 누르면 postersPayload + pNo를
          <code className="ml-1 px-1 py-0.5 bg-gray-200 rounded text-xs">
            EditorLoadingPage
          </code>
          로 전달합니다.
        </p>

        <button
          onClick={handleGoToLoading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
        >
          Editor Build 실행하러 가기
        </button>
      </div>
    </div>
  );
};

export default TestPage;
