import React, { useState } from 'react';
import PressReleaseModal from './PressReleaseModal';

const PackageView = ({ data, articleData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🛠️ 1. 데이터가 없을 때 방어 (흰 화면 방지)
    if (!data) return <div className="p-10 text-center text-slate-500">패키지 정보를 불러오는 중입니다...</div>;

    const handleFileClick = (file) => {
        if (file.name === '보도자료.pdf') {
            setIsModalOpen(true);
        } else {
            // 기본 동작 (다운로드 등)
            alert(`${file.name} 다운로드를 시작합니다.`);
        }
    };

    return (
        <div className="font-sans text-slate-800">
            <h1 className="text-2xl font-bold mb-6 border-b-2 border-slate-800 pb-4">
                📦 [홍보 ZIP 패키지 구성]
            </h1>

            <p className="mb-8 text-slate-600">
                다음은 다운로드 가능한 홍보 패키지의 파일 목록과 프리뷰입니다.
            </p>

            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                    📂 파일 리스트
                </h2>
                <ul className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3">
                    {/* 🛠️ 2. files 데이터가 있을 때만 map 실행 (?. 사용) */}
                    {data.files?.map((file, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                            <span className="text-lg">{file.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-bold text-slate-900 ${file.name === '보도자료.pdf' ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                                        onClick={() => handleFileClick(file)}
                                    >
                                        {file.name}
                                    </span>
                                    {file.name === '보도자료.pdf' && (
                                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">미리보기</span>
                                    )}
                                </div>
                                <div className="flex items-center text-slate-600 mt-1">
                                    <span>{file.desc}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                    🔍 주요 파일 프리뷰
                </h2>
                <div className="space-y-6">
                    {/* 🛠️ 3. preview 데이터 안전하게 접근 */}
                    {data.preview?.map((item, idx) => (
                        <div key={idx} className="bg-white border-l-4 border-blue-900 p-4 shadow-sm">
                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded italic">
                                "{item.desc}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12 text-center">
                <button className="bg-blue-900 text-white px-8 py-3 rounded font-bold hover:bg-blue-800 transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto">
                    <span>⬇️</span> 전체 패키지 다운로드 (.zip)
                </button>
            </div>

            {/* 보도자료 모달 - articleData가 없을 경우도 대비 */}
            {isModalOpen && (
                <PressReleaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={articleData || { title: "데이터 없음", body: "보도자료 데이터를 불러오지 못했습니다." }}
                />
            )}
        </div>
    );
};

export default PackageView;