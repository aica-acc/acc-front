import React from 'react';

const ArticleView = ({ data }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-12 font-sans text-slate-700">
            {/* 메인 기사 영역 */}
            <div className="article-main">
                <header className="mb-8 pb-6 border-b-2 border-slate-900">
                    <h1 className="font-serif text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-3">
                        {data.title}
                    </h1>
                    <p className="font-sans text-lg text-slate-500 font-normal">
                        {data.subtitle}
                    </p>
                </header>

                <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-blue-900 p-6 mb-8 rounded-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        📌 뉴스 요약
                    </h3>
                    <ul className="space-y-2">
                        {data.summary.map((item, idx) => (
                            <li key={idx} className="relative pl-5 text-sm text-slate-700 leading-relaxed">
                                <span className="absolute left-0 text-blue-900 font-bold">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <figure className="mb-8">
                    <div className="w-full h-[400px] bg-slate-200 flex items-center justify-center text-slate-500 text-sm rounded-sm overflow-hidden">
                        {data.mainImage.url && !data.mainImage.url.includes('/dummy/') ? (
                            <img src={data.mainImage.url} alt="Main" className="w-full h-full object-cover" />
                        ) : data.mainImage.url && data.mainImage.url.includes('/dummy/') ? (
                            <div className="flex flex-col items-center justify-center h-full w-full bg-slate-200 text-slate-500">
                                <span>Image: {data.mainImage.url}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-4xl mb-2">📷</span>
                                <span>이미지 영역</span>
                            </div>
                        )}
                    </div>
                    <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                        ▲ {data.mainImage.caption}
                    </figcaption>
                </figure>

                <div
                    className="font-sans text-base leading-loose text-slate-700 mb-8 space-y-5"
                    dangerouslySetInnerHTML={{ __html: data.body }}
                />

                <div className="my-8 p-8 bg-white border-y-2 border-sky-500 text-center">
                    <p className="font-serif text-xl font-bold text-blue-900 italic leading-relaxed">
                        {data.highlight}
                    </p>
                </div>

                <div
                    className="font-sans text-base leading-loose text-slate-700 mb-8 space-y-5"
                    dangerouslySetInnerHTML={{ __html: data.body2 }}
                />

                <div className="bg-slate-100 p-6 rounded text-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                        📄 행사 안내
                    </h3>
                    <div className="grid gap-3">
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">행사명</span>
                            <span className="text-slate-900 font-medium">{data.info.name}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">일시</span>
                            <span className="text-slate-900">{data.info.date}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">장소</span>
                            <span className="text-slate-900">{data.info.location}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">프로그램</span>
                            <span className="text-slate-900">{data.info.program}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="w-24 font-semibold text-slate-500 shrink-0">문의처</span>
                            <span className="text-slate-900">{data.info.contact}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 우측 사이드바 */}
            <aside className="article-sidebar flex flex-col gap-10">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b-2 border-blue-900 pb-2 mb-4">
                        🎨 포스터·비주얼
                    </h3>
                    {data.sidebar.posters.map((poster, idx) => (
                        <div key={idx} className="mb-6 last:mb-0">
                            <div className="w-full aspect-[2/3] bg-slate-200 flex items-center justify-center text-slate-400 text-xs rounded-sm mb-2 overflow-hidden">
                                {poster.image && !poster.image.includes('/dummy/') ? (
                                    <img src={poster.image} alt={poster.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-500">
                                        {poster.image ? `Poster: ${poster.image}` : "Poster Image"}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 text-center font-medium">{poster.title}</p>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default ArticleView;