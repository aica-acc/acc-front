import React, { useRef } from 'react';
import html2canvas from 'html2canvas'; // 일반 html2canvas 사용 권장 (안정성)
import jsPDF from 'jspdf';

const SnsView = ({ data, images }) => {
    const instagramRef = useRef(null);
    const xRef = useRef(null);
    const facebookRef = useRef(null);

    // 1. 데이터 로딩 방어
    if (!data) return <div className="p-10 text-center text-slate-500">SNS 데이터를 불러오는 중입니다...</div>;

    // 2. 이미지 분류 (DB 데이터 연동)
    // [포스터]
    const posterList = images?.filter(img => img.assetType === 'poster') || [];
    const mainPoster = posterList.find(img => img.isMain === 1) || posterList[0];
    const posterUrl = mainPoster ? mainPoster.fileUrl : null;

    // [마스코트]
    const mascotList = images?.filter(img => img.assetType === 'mascot') || [];
    const mainMascot = mascotList.find(img => img.isMain === 1) || mascotList[0];
    const mascotUrl = mainMascot ? mainMascot.fileUrl : null;

    // 이미지 경로 처리 함수
    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return url.startsWith('/') ? url : `/${url}`;
    };

    const finalPosterUrl = getFullUrl(posterUrl);
    const finalMascotUrl = getFullUrl(mascotUrl);

    // PDF 저장 함수
    const handleDownloadPdf = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.width;
        
        const sections = [
            { ref: instagramRef, name: 'Instagram' },
            { ref: xRef, name: 'X (Twitter)' },
            { ref: facebookRef, name: 'Facebook' }
        ];
        
        try {
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                if (!section.ref.current) continue;
                
                const canvas = await html2canvas(section.ref.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                if (i > 0) pdf.addPage();
                
                const imgData = canvas.toDataURL('image/png');
                const ratio = pdfWidth / canvas.width;
                const imgHeight = canvas.height * ratio;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            }
            
            pdf.save('SNS_홍보물_모음.pdf');
        } catch (err) {
            console.error("PDF 저장 실패:", err);
            alert("PDF 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-12">
            {/* 상단 헤더 및 PDF 저장 버튼 */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">📱 SNS 홍보 콘텐츠</h2>
                <button 
                    onClick={handleDownloadPdf}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-500 transition shadow-sm flex items-center gap-2"
                >
                    <span>⬇️</span> PDF로 저장하기
                </button>
            </div>

            <div className="space-y-12">
                {/* 1. Instagram Section */}
                <section ref={instagramRef} style={{ backgroundColor: '#ffffff', padding: '20px' }}>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📷</span> Instagram Feed
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.instagram?.map((item, idx) => {
                            // ✅ 인스타그램 이미지 배치 로직
                            let displayImage = null;
                            if (idx === 0) displayImage = finalPosterUrl || item.image; // 첫번째: 포스터
                            else if (idx === 1) displayImage = finalMascotUrl || finalPosterUrl || item.image; // 두번째: 마스코트
                            else displayImage = item.image; // 그 외: AI 생성 이미지

                            return (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                        {displayImage ? (
                                            <img 
                                                src={displayImage} 
                                                alt="insta" 
                                                className="w-full h-full object-cover" 
                                                crossOrigin="anonymous"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        ) : (
                                            <span className="text-xs">이미지 없음</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="font-semibold text-sm mb-2 whitespace-pre-wrap">{item.caption}</p>
                                        <p className="text-xs text-slate-500 mb-3">{item.description}</p>
                                        <div className="text-[10px] text-slate-400 mb-2">
                                            <p>📍 {item.location}</p>
                                            <p>📅 {item.date}</p>
                                        </div>
                                        <div className="text-xs text-blue-500 font-medium flex flex-wrap gap-1">
                                            {item.hashtags?.map((tag, i) => <span key={i}>{tag}</span>)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <hr className="border-t border-slate-200" />

                {/* 2. X (Twitter) Section */}
                <section ref={xRef} style={{ backgroundColor: '#ffffff', padding: '20px' }}>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">🐦</span> X (Twitter)
                    </h3>
                    <div className="flex flex-col gap-4">
                        {data.x?.map((item) => {
                            // ✅ 트위터: 마스코트 우선 배치
                            const displayImage = finalMascotUrl || finalPosterUrl || item.image;

                            return (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="font-bold text-sm mb-2">{item.author}</div>
                                    <p className="text-sm text-slate-800 mb-3 leading-snug whitespace-pre-wrap">{item.text}</p>
                                    
                                    <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                                        {displayImage ? (
                                            <img 
                                                src={displayImage} 
                                                alt="x post" 
                                                className="w-full h-full object-cover" 
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <span>이미지 영역</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <hr className="border-t border-slate-200" />

                {/* 3. Facebook Section */}
                <section ref={facebookRef} style={{ backgroundColor: '#ffffff', padding: '20px' }}>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📘</span> Facebook
                    </h3>
                    <div className="flex flex-col gap-6">
                        {data.facebook?.map((item) => {
                            // ✅ 페이스북: 포스터 우선 배치
                            const displayImage = finalPosterUrl || item.image;

                            return (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-900">
                                        {item.title}
                                    </div>
                                    <div className="w-full h-64 bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                                        {displayImage ? (
                                            <img 
                                                src={displayImage} 
                                                alt="facebook" 
                                                className="w-full h-full object-cover" 
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <span>이미지 없음</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{item.content}</p>
                                        <a href={item.link} className="text-blue-600 text-sm hover:underline font-medium">Learn More</a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SnsView;