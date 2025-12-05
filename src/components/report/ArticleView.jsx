import React, { useState } from 'react';
import PressReleaseModal from './PressReleaseModal';

// ✅ images prop을 받아서 각 위치에 뿌려줍니다.
const ArticleView = ({ data, images }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. 데이터 로딩 방어
    if (!data) return <div className="p-10 text-center text-slate-500">데이터를 불러오는 중입니다...</div>;

    // 2. 이미지 분류 (DB의 assetType 기준)
    
    // [포스터] -> 우측 사이드바 상단
    const posterList = images?.filter(img => img.assetType === 'poster') || [];
    const mainPoster = posterList.find(img => img.isMain === 1) || posterList[0];
    const posterUrl = mainPoster ? mainPoster.fileUrl : null;

    // [마스코트] -> 우측 사이드바 하단
    const mascotList = images?.filter(img => img.assetType === 'mascot') || [];
    const mainMascot = mascotList.find(img => img.isMain === 1) || mascotList[0];
    const mascotUrl = mainMascot ? mainMascot.fileUrl : null;

    // [리플렛] -> 기사 본문 하단 (설명용)
    const leafletList = images?.filter(img => img.assetType === 'leaflet') || [];

    // [현수막/배너] -> 최하단 (다운로드용)
    const bannerList = images?.filter(img => img.assetType === 'banner') || [];

    // 이미지 경로 처리 함수
    const getFullUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('http')) return url;
        return url.startsWith('/') ? url : `/${url}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-12 font-sans text-slate-700">
            
            {/* ==========================
                [왼쪽] 메인 기사 영역 
               ========================== */}
            <div className="article-main">
                <header className="mb-8 pb-6 border-b-2 border-slate-900 flex justify-between items-end">
                    <div className="flex-1">
                        <h1 className="font-serif text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-3">
                            {data.title}
                        </h1>
                        <p className="font-sans text-lg text-slate-500 font-normal">
                            {data.subtitle}
                        </p>
                    </div>
                    {/* 보도자료 보기 버튼 */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-800 text-white text-sm px-4 py-2 rounded hover:bg-slate-700 transition flex items-center gap-2 shrink-0 h-fit ml-4"
                    >
                        <span>📄</span> 보도자료 보기
                    </button>
                </header>

                {/* 요약 박스 */}
                <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-blue-900 p-6 mb-8 rounded-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        📌 뉴스 요약
                    </h3>
                    <ul className="space-y-2">
                        {data.summary?.map((item, idx) => (
                            <li key={idx} className="relative pl-5 text-sm text-slate-700 leading-relaxed">
                                <span className="absolute left-0 text-blue-900 font-bold">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 메인 이미지 (기사 상단에는 포스터 또는 AI 이미지를 큼지막하게) */}
                <figure className="mb-8">
                    <div className="w-full h-[400px] bg-slate-200 flex items-center justify-center text-slate-500 text-sm rounded-sm overflow-hidden">
                        <img 
                            src={getFullUrl(posterUrl) || data.mainImage?.url} 
                            alt="Main Context" 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                    <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                        ▲ {data.mainImage?.caption || '축제 현장 전경'}
                    </figcaption>
                </figure>

                {/* 본문 1 & 2 */}
                <div className="font-sans text-base leading-loose text-slate-700 mb-8 space-y-5" dangerouslySetInnerHTML={{ __html: data.body }} />
                
                <div className="my-8 p-8 bg-white border-y-2 border-sky-500 text-center">
                    <p className="font-serif text-xl font-bold text-blue-900 italic leading-relaxed">
                        {data.highlight}
                    </p>
                </div>

                <div className="font-sans text-base leading-loose text-slate-700 mb-8 space-y-5" dangerouslySetInnerHTML={{ __html: data.body2 }} />

                {/* ✅ [리플렛] 본문 바로 아래 배치 */}
                {leafletList.length > 0 && (
                    <div className="mt-12 mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-red-500 pl-3 flex items-center gap-2">
                            📖 행사 리플렛
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {leafletList.map((leaflet, idx) => (
                                <div key={idx} className="bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition">
                                    <img 
                                        src={getFullUrl(leaflet.fileUrl)} 
                                        alt={`Leaflet ${idx}`} 
                                        className="w-full h-auto block"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ✅ [현수막] 최하단 다운로드 버튼 */}
                {bannerList.length > 0 && (
                    <div className="mt-10 p-6 bg-slate-100 rounded border border-slate-300">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            📂 홍보물 다운로드 (현수막/배너)
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {bannerList.map((banner, idx) => (
                                <a key={idx} href={getFullUrl(banner.fileUrl)} download target="_blank" rel="noreferrer"
                                   className="flex items-center justify-between bg-white p-3 rounded shadow-sm hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🚌</span>
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-700">거리 현수막 시안 {idx + 1}</p>
                                            <p className="text-xs text-slate-400">JPG/PNG 고화질 이미지</p>
                                        </div>
                                    </div>
                                    <span className="text-blue-600 text-xs font-bold border border-blue-600 px-2 py-1 rounded">다운로드</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* 행사 개요 */}
                <div className="bg-slate-100 p-6 rounded text-sm mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        📄 행사 안내
                    </h3>
                    <div className="grid gap-3">
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">행사명</span>
                            <span className="text-slate-900 font-medium">{data.info?.name}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">일시</span>
                            <span className="text-slate-900">{data.info?.date}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">장소</span>
                            <span className="text-slate-900">{data.info?.location}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">문의처</span>
                            <span className="text-slate-900">{data.info?.contact}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==========================
                [오른쪽] 사이드바 영역 
               ========================== */}
            <aside className="article-sidebar flex flex-col gap-10">
                
                {/* 1. 포스터 (상단) */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b-2 border-blue-900 pb-2 mb-4">
                        🎨 공식 포스터
                    </h3>
                    <div className="w-full bg-slate-200 flex items-center justify-center rounded-sm overflow-hidden shadow-md">
                        {posterUrl ? (
                            <img src={getFullUrl(posterUrl)} alt="Main Poster" className="w-full h-auto object-cover" />
                        ) : (
                            <div className="p-10 text-slate-400 text-xs">등록된 포스터 없음</div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        ▲ {data.info?.name} 공식 포스터
                    </p>
                </div>

                {/* 2. 마스코트 (하단 - 있으면 표시) */}
                {mascotUrl && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b-2 border-green-700 pb-2 mb-4">
                            🧸 공식 마스코트
                        </h3>
                        <div className="w-full aspect-square bg-white border border-slate-200 flex items-center justify-center rounded-full overflow-hidden shadow-sm p-4">
                            <img 
                                src={getFullUrl(mascotUrl)} 
                                alt="Mascot" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            ▲ 축제 공식 캐릭터
                        </p>
                    </div>
                )}


            </aside>

            {/* 보도자료 모달 */}
            {isModalOpen && (
                <PressReleaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={data}
                />
            )}
        </div>
    );
};

export default ArticleView;