import React from 'react';
import { useNavigate } from 'react-router-dom';

const TempEditorEntry = () => {
    const navigate = useNavigate();

    const handleComplete = () => {
        // 실제로는 여기서 API로 데이터를 저장하고 넘어갑니다.
        alert("편집이 완료되었습니다! 결과 페이지로 이동합니다.");
        navigate('/report/result');
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-100 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">🚧 에디터 페이지 (임시 진입점)</h1>
            <p className="text-slate-600">이곳에서 포스터와 홍보물을 편집한다고 가정합니다.</p>
            
            <button 
                onClick={handleComplete}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
            >
                편집 완료 & 결과 보기 👉
            </button>
        </div>
    );
};

export default TempEditorEntry;