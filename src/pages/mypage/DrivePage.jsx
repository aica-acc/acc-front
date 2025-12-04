import React from "react";

const DrivePage = () => {
  // 더미 데이터
  const total = 1000; // MB
  const used = 245; // MB
  const usedPercent = Math.round((used / total) * 10) / 10; // 24.5%

  const projects = [
    {
      id: 1,
      name: "겨울 불꽃 축제",
      date: "2025. 3. 15",
      size: "125 MB",
    },
    {
      id: 2,
      name: "부산 국제 음악 페스티벌",
      date: "2025. 2. 20",
      size: "98 MB",
    },
    {
      id: 3,
      name: "제주 푸드 페스타",
      date: "2025. 1. 10",
      size: "22 MB",
    },
  ];

  return (
    <div className="w-full h-full flex justify-center items-start px-6 py-10">
      <div className="w-full max-w-5xl space-y-8">
        {/* 제목 */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            저장 공간 관리
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            프로젝트별로 사용 중인 저장 공간을 확인할 수 있어요.
          </p>
        </div>

        {/* 전체 사용량 카드 */}
        <section className="bg-slate-900 border border-slate-700 rounded-2xl shadow-lg px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-200">
              사용 중인 저장 공간
            </span>
            <span className="text-xs text-slate-400">
              {used} MB / {total} MB
            </span>
          </div>

          {/* progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            약{" "}
            <span className="font-semibold text-indigo-400">
              {usedPercent}%
            </span>{" "}
            사용 중입니다.
          </p>
        </section>

        {/* 프로젝트별 사용량 리스트 */}
        <section className="bg-slate-900 border border-slate-700 rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              프로젝트 사용량
            </h2>
            <span className="text-xs text-slate-500">
              최근에 생성된 프로젝트 순
            </span>
          </div>

          <ul className="divide-y divide-slate-800">
            {projects.map((p) => (
              <li
                key={p.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-850/60 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {p.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{p.date}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{p.size}</span>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DrivePage;
