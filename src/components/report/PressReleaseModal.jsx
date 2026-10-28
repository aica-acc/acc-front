import React from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { X, Download, Printer } from 'lucide-react'; // 아이콘이 없다면 빼셔도 됩니다.

const PressReleaseModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const today = new Date();
    const formattedDate = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;

    // PDF 다운로드 기능
    const handleDownloadPDF = async () => {
        const element = document.getElementById('print-content'); // 캡처 대상
        if (!element) return;

        try {
            // 캡처 옵션 설정
            const canvas = await html2canvas(element, {
                scale: 2, // 해상도 2배 (선명하게)
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 너비 (mm)
            const pageHeight = 297; // A4 높이 (mm)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            const doc = new jsPDF('p', 'mm', 'a4');
            
            // 첫 페이지
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // 내용이 길면 다음 페이지 추가
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // 파일 저장 (즉시 다운로드)
            const fileName = data.title ? `${data.title}_보도자료.pdf` : '보도자료.pdf';
            doc.save(fileName);

        } catch (error) {
            console.error("PDF 변환 에러:", error);
            alert("다운로드 중 문제가 발생했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            
            {/* 1. 상단 툴바 (버튼 영역) - 여기가 핵심입니다! */}
            <div className="w-full h-16 bg-white/10 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-6 shadow-lg z-50">
                <div className="text-white font-bold text-lg flex items-center gap-2">
                    📄 보도자료 미리보기
                </div>
                
                <div className="flex items-center gap-3">
                    {/* 다운로드 버튼 */}
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-medium shadow-md text-sm"
                    >
                        <Download size={18} />
                        PDF 다운로드
                    </button>

                    {/* 닫기 버튼 */}
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                    >
                        <X size={18} />
                        닫기
                    </button>
                </div>
            </div>

            {/* 2. 스크롤 가능한 문서 영역 */}
            <div className="flex-1 w-full overflow-y-auto p-8 bg-gray-100/50 flex justify-center cursor-default" onClick={onClose}>
                <div 
                    className="relative bg-white shadow-2xl animate-slideUp"
                    style={{ width: '210mm', minHeight: '297mm' }} // A4 고정 크기
                    onClick={(e) => e.stopPropagation()} // 문서 클릭 시 닫힘 방지
                >
                    {/* 실제 인쇄/PDF 캡처 대상 (ID: print-content) */}
                    <div id="print-content" className="p-[25mm] flex flex-col min-h-[297mm] font-serif text-slate-900 bg-white">
                        
                        {/* --- 문서 내용 시작 --- */}
                        
                        {/* 헤더 */}
                        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">🇰🇷</span>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500">Ministry of Culture, Sports and Tourism</span>
                                    <span className="text-xl font-bold text-slate-800 tracking-tight">문화체육관광부</span>
                                </div>
                            </div>
                            <h1 className="text-5xl font-black tracking-[0.2em] text-slate-900 scale-x-90 origin-right">보 도 자 료</h1>
                        </div>
                        
                        {/* 배포 정보 */}
                        <div className="flex justify-end text-sm mb-10 text-slate-600 font-sans border-b border-slate-200 pb-2">
                            <span className="font-bold mr-2 text-slate-900">배포일시</span>
                            <span>{formattedDate} (즉시 보도 가능)</span>
                        </div>

                        {/* 제목 */}
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold leading-snug break-keep mb-4 text-slate-900">
                                {data.title}
                            </h2>
                            {data.subtitle && (
                                <div className="inline-block border-t border-slate-400 pt-3 px-8">
                                    <p className="text-xl text-slate-700 font-medium">
                                        - {data.subtitle} -
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 본문 컨테이너 */}
                        <div className="flex-1 space-y-8 font-sans text-[11pt] leading-[1.8] text-justify text-slate-800">
                            
                            {/* 요약문 */}
                            {data.summary && (
                                <p className="font-bold text-slate-900 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {data.summary[0]}
                                </p>
                            )}

                            {/* 메인 이미지 */}
                            {data.mainImage?.url && (
                                <figure className="my-8 text-center">
                                    <img 
                                        src={data.mainImage.url} 
                                        alt="자료 사진" 
                                        className="max-h-[350px] mx-auto border border-slate-200 shadow-sm"
                                        crossOrigin="anonymous" 
                                    />
                                    <figcaption className="text-xs text-slate-500 mt-2 font-medium">
                                        ▲ {data.mainImage.caption || '관련 자료 사진'}
                                    </figcaption>
                                </figure>
                            )}

                            {/* HTML 본문 */}
                            <div dangerouslySetInnerHTML={{ __html: data.body }} />
                            <div dangerouslySetInnerHTML={{ __html: data.body2 }} />
                        </div>

                        {/* 하단 문의처 (기획서에 적힌 연락처가 있을 때만) */}
                        {data.info?.contact && (
                            <div className="mt-16 pt-6 border-t-2 border-slate-500 font-sans page-break-inside-avoid">
                                <table className="w-full text-sm border-collapse border border-slate-300">
                                    <tbody>
                                        <tr>
                                            <td className="w-24 bg-slate-100 font-bold text-center p-3 border border-slate-300">문의처</td>
                                            <td className="p-3 border border-slate-300">{data.info.contact}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="mt-3 text-center text-xs text-slate-400">
                                    이 자료에 대하여 더욱 자세한 내용을 원하시면 위 문의처로 연락주시기 바랍니다.
                                </div>
                            </div>
                        )}
                        
                        {/* --- 문서 내용 끝 --- */}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PressReleaseModal;