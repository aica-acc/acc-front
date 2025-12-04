import React, { useState, useEffect } from 'react';
import api from '../../utils/api/BaseAPI';
import Header from '../../layout/Header';

// 컴포넌트 import
import ArticleView from '../../components/report/ArticleView';
import NoticeView from '../../components/report/NoticeView';
import SnsView from '../../components/report/SnsView';
import PackageView from '../../components/report/PackageView';

const MyReportPage = () => {
    const [activeTab, setActiveTab] = useState('article');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. 페이지 진입 시 한 번에 모두 요청 (All-in-One)
    useEffect(() => {
        const fetchAllReports = async () => {
            setLoading(true);
            const pNo = sessionStorage.getItem("editorPNo") || 18;

            // 백엔드의 4개 엔드포인트에 맞춰 매핑
            const reportTypes = {
                'article': 'article', // /api/report/article
                'notice': 'notice',   // /api/report/notice
                'sns': 'sns',         // /api/report/sns
                'package': 'package'  // /api/report/package
            };

            try {
                console.log(`🚀 [전체 생성 시작] 프로젝트 번호: ${pNo}`);

                // 2. Promise.all로 4개 API를 동시에 요청
                const promises = Object.entries(reportTypes).map(async ([key, endpoint]) => {
                    try {
                        // 🔥 중요: 백엔드 DTO에 맞춘 변수명 (projectNo)
                        const response = await api.post(`/api/report/${endpoint}`, {
                            projectNo: parseInt(pNo),
                            // m_no는 BaseAPI가 자동으로 넣어주거나, 필요 시 여기서 추가 가능
                            // m_no: "M000001" 
                        });

                        if (response.data.status === 'success') {
                            // JSON 문자열 파싱
                            return { key, content: JSON.parse(response.data.content) };
                        }
                        return { key, content: null };
                    } catch (err) {
                        console.error(`❌ ${key} 생성 실패:`, err);
                        return { key, content: null };
                    }
                });

                // 3. 결과 합치기
                const results = await Promise.all(promises);
                const finalData = {};
                results.forEach(result => {
                    if (result.content) {
                        finalData[result.key] = result.content;
                    }
                });

                console.log("✅ [전체 생성 완료]", finalData);
                setData(finalData);

            } catch (error) {
                console.error("❌ 치명적 오류:", error);
                alert("데이터를 불러오는 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllReports();
    }, []);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        document.getElementById('content-area')?.scrollTo(0, 0);
    };

    // 로딩 화면
    if (loading) {
        return (
            <div className="min-h-screen bg-[#111118] text-white">
                <Header />
                <div className="w-full h-screen flex items-center justify-center pt-24">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-bold text-gray-200 mb-2">홍보 패키지를 통합 생성 중입니다...</h2>
                        <p className="text-gray-400 text-sm">
                            AI가 기사, 공고문, SNS, 미디어킷을 모두 작성하고 있습니다.<br />
                            잠시만 기다려 주세요. (약 15~30초 소요)
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111118] text-white">
            <Header />
            <div className="flex h-screen pt-24 overflow-hidden">
                {/* Sidebar - 다크모드 스타일 */}
                <aside 
                    className="w-[260px] min-w-[260px] flex flex-col p-6 h-full z-10"
                    style={{ 
                        backgroundColor: "rgb(37, 37, 47)"
                    }}
                >
                    <div className="mb-8 pb-4 border-b" style={{ borderColor: "rgb(55, 55, 65)" }}>
                        <h2 className="font-serif text-lg font-bold text-gray-200 tracking-tight">
                            축제 홍보 패키지
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">생성 결과 리포트</p>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {[
                            { id: 'article', icon: '📰', label: '기사형 홍보문' },
                            { id: 'notice', icon: '📢', label: '공식 공고문' },
                            { id: 'sns', icon: '📱', label: 'SNS 홍보 UI 세트' },
                            { id: 'package', icon: '📦', label: '홍보 ZIP 패키지' },
                        ].map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => handleTabChange(menu.id)}
                                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium text-left transition-all duration-200
                                    ${activeTab === menu.id
                                        ? 'bg-gray-700 text-white shadow-sm'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <span className="mr-3 opacity-80 text-base">{menu.icon}</span>
                                {menu.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 h-full overflow-y-auto p-8 flex flex-col">
                    <div id="content-area" className="max-w-[1100px] mx-auto bg-white p-12 rounded-sm shadow-sm border border-slate-200 flex-1 w-full text-slate-700">
                        {/* 데이터 렌더링 */}
                        {activeTab === 'article' && data?.article && <ArticleView data={data.article} />}
                        {activeTab === 'notice' && data?.notice && <NoticeView data={data.notice} />}
                        {activeTab === 'sns' && data?.sns && <SnsView data={data.sns} />}
                        {activeTab === 'package' && data?.package && <PackageView data={data.package} articleData={data.article} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MyReportPage;