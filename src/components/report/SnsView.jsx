import React, { useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

const SnsView = ({ data }) => {
    const instagramRef = useRef(null);
    const xRef = useRef(null);
    const facebookRef = useRef(null);

    // 1. 데이터 로딩 방어 코드
    if (!data) return <div className="p-10 text-center text-slate-500">SNS 데이터를 불러오는 중입니다...</div>;

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
                {/* Instagram Section */}
                <section ref={instagramRef} style={{ backgroundColor: '#ffffff' }}>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📷</span> Instagram Feed
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.instagram?.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
                                    {item.image ? 
                                        <img src={item.image} alt="insta" className="w-full h-full object-cover" crossOrigin="anonymous"/> 
                                        : "Image Placeholder"
                                    }
                                </div>
                                <div className="p-4">
                                    <p className="font-semibold text-sm mb-2 whitespace-pre-wrap">{item.caption}</p>
                                    <p className="text-xs text-slate-500 mb-3">{item.description}</p>
                                    <div className="text-[10px] text-slate-400 mb-2">
                                        <p>📍 {item.location}</p>
                                        <p>📅 {item.date}</p>
                                    </div>
                                    <div className="text-xs text-blue-500 font-medium flex flex-wrap gap-1">
                                        {item.hashtags?.map((tag, idx) => <span key={idx}>{tag}</span>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-t border-slate-200" />

                {/* X (Twitter) Section */}
                <section ref={xRef} style={{ backgroundColor: '#ffffff' }}>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">🐦</span> X (Twitter)
                    </h3>
                    <div className="flex flex-col gap-4">
                        {data.x?.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="font-bold text-sm mb-2">{item.author}</div>
                                <p className="text-sm text-slate-800 mb-3 leading-snug whitespace-pre-wrap">{item.text}</p>
                                {item.image && (
                                    <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                                        <img src={item.image} alt="x post" className="w-full h-full object-cover" crossOrigin="anonymous"/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-t border-slate-200" />

                {/* Facebook Section */}
                <section ref={facebookRef} style={{ backgroundColor: '#ffffff' }}>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📘</span> Facebook
                    </h3>
                    <div className="flex flex-col gap-6">
                        {data.facebook?.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-900">
                                    {item.title}
                                </div>
                                <div className="w-full h-64 bg-slate-200 flex items-center justify-center text-slate-400">
                                    {item.image ? <img src={item.image} alt="facebook" className="w-full h-full object-cover" crossOrigin="anonymous"/> : "Image Placeholder"}
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{item.content}</p>
                                    <a href={item.link} className="text-blue-600 text-sm hover:underline font-medium">Learn More</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SnsView;