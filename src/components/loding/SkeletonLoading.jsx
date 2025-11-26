import React, { useEffect, useState } from "react";

export default function SkeletonImage() {
  const [dots, setDots] = useState(3);  // ... 점 개수

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === 0 ? 3 : prev - 1));
    }, 500); // 애니메이션 속도 조절 가능

    return () => clearInterval(interval);
  }, []);

  const loadingText = `이미지를 불러오는 중${".".repeat(dots)}`;

  return (
    <div className="w-full h-[700px] bg-gray-200 rounded-xl overflow-hidden relative animate-pulse">
      
      {/* 살짝 어두운 레이어 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-200 opacity-70" />

      {/* 중앙 로딩 영역 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
        {/* 네모 아이콘 */}
        <div className="w-16 h-16 bg-gray-300 rounded-md mb-5 animate-bounce" />

        {/* 텍스트 애니메이션 */}
        <p className="text-sm font-medium transition-all duration-300">
          {loadingText}
        </p>
      </div>
    </div>
  );
}
