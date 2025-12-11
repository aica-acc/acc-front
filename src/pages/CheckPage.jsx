import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepHeader from '../layout/StepHeader';

const CheckPage = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);

  useEffect(() => {
    // sessionStorage에서 types 가져오기
    const typesStr = sessionStorage.getItem("types");
    if (typesStr) {
      try {
        const parsedTypes = JSON.parse(typesStr);
        setTypes(Array.isArray(parsedTypes) ? parsedTypes : []);
      } catch (e) {
        console.error("types 파싱 오류:", e);
        setTypes([]);
      }
    }
  }, []);

  const promotionCount = types.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "rgb(37, 37, 47)" }}>
      <StepHeader />
      
      <div className="pt-28 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          {/* 성공 아이콘 */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* 메인 메시지 */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">
              홍보물 생성이 완료되었습니다!
            </h1>
            <p className="text-xl text-gray-300">
              총 {promotionCount}개의 홍보물이 성공적으로 생성되었습니다
            </p>
          </div>

          {/* 마이페이지 버튼 */}
          <div className="flex justify-center mb-16">
            <button
              onClick={() => navigate("/mypage/project")}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-colors"
            >
              마이페이지에서 확인하기
            </button>
          </div>

          {/* 생성된 홍보물 요약 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              생성된 홍보물 요약
            </h2>
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center max-w-md w-full">
                <p className="text-white font-semibold text-lg">
                  총 {promotionCount}개의 홍보물이 완료되었습니다
                </p>
              </div>
            </div>
          </div>

          {/* 다음 단계 */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              다음 단계
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 leading-relaxed">
                  마이페이지에서 생성된 홍보물을 확인하고 다운로드하세요
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 leading-relaxed">
                  필요시 홍보물을 추가로 수정하거나 재생성할 수 있습니다
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 leading-relaxed">
                  다른 프로젝트를 시작하여 새로운 홍보물을 만들어보세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPage;
