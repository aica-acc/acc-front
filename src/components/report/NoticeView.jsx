import React from 'react';

const NoticeView = ({ data }) => {
    return (
        <div className="border-t-2 border-slate-800 font-sans">
            <div className="bg-[#f3f3f3] p-6 border-b border-gray-300 text-center">
                <h2 className="text-xl font-bold text-gray-800 m-0">{data.title}</h2>
            </div>
            
            <div className="flex flex-wrap justify-end gap-6 p-4 border-b border-gray-300 bg-white text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">고시공고번호 :</span>
                    <span>{data.meta.no}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">등록일 :</span>
                    <span>{data.meta.date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">담당부서 :</span>
                    <span>{data.meta.dept}</span>
                </div>
            </div>

            <div className="p-8 min-h-[300px] text-base leading-relaxed text-gray-800 border-b border-gray-300 whitespace-pre-line">
                <div dangerouslySetInnerHTML={{ __html: data.body }} />
            </div>

            <div className="flex flex-col md:flex-row items-start p-4 border-b border-gray-300 bg-white gap-4">
                <div className="font-bold text-gray-800 w-24 pt-1 shrink-0">첨부 파일</div>
                <div className="flex-1 flex flex-col gap-2">
                    {data.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <span>💾</span>
                            <span className="text-gray-800 hover:underline cursor-pointer">{file.name}</span>
                            <button className="bg-white border border-gray-300 px-2 py-[2px] text-xs text-gray-600 rounded hover:bg-gray-50">
                                바로보기
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 text-right">
                <button className="bg-white border border-gray-300 px-6 py-2 text-sm text-gray-800 rounded hover:bg-gray-100 transition-colors">
                    목록
                </button>
            </div>
        </div>
    );
};

export default NoticeView;