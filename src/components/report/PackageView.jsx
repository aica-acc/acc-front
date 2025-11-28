import React from 'react';

const PackageView = ({ data }) => {
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
                    {data.files.map((file, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                            <span className="text-lg">{file.icon}</span>
                            <div>
                                <span className="font-bold text-slate-900">{file.name}</span>
                                <span className="mx-2 text-slate-400">|</span>
                                <span className="text-slate-600">{file.desc}</span>
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
                    {data.preview.map((item, idx) => (
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
        </div>
    );
};

export default PackageView;