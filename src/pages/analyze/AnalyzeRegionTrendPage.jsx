import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/loding/LoadingSpinner';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnalyzeButton from '../../components/buttons/AnalyzeButton';

const AnalyzeRegionTrendPage = () => {
  const location = useLocation();
  
  const { regionTrend } = location.state || {};

  const [regionData, setRegionData] = useState(null);
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('family');
  
  // [신규] 키워드 상세 보기 모달 상태
  const [selectedKeyword, setSelectedKeyword] = useState(null);

  useEffect(() => {
    // state → sessionStorage fallback
    let data = regionTrend;

    if (!data) {
      const saved = sessionStorage.getItem('regionTrendData');
      if (saved) data = JSON.parse(saved);
    }

    if (data) {
      setRegionData(data);
    } else {
      setError("지역 트렌드 분석 데이터가 없습니다.");
    }
  }, [regionTrend]);

  // ----------------------------------------------------------------------
  // [워드클라우드] "밀집 대형 (Compact Layout)" 좌표 시스템
  // ----------------------------------------------------------------------
  const COMPACT_LAYOUT = [
    { x: 0, y: 0 },         // 1위 (중앙)
    { x: 90, y: -40 },      // 2위
    { x: -90, y: -40 },     // 3위
    { x: 90, y: 40 },       // 4위
    { x: -90, y: 40 },      // 5위
    { x: 0, y: -80 },       // 6위
    { x: 0, y: 80 },        // 7위
    { x: 160, y: 0 },       // 8위
    { x: -160, y: 0 },      // 9위
    { x: 140, y: -90 },     // 10위
    { x: -140, y: -90 },    // 11위
    { x: 140, y: 90 },      // 12위
    { x: -140, y: 90 },     // 13위
    { x: 60, y: -130 },     // 14위
    { x: -60, y: -130 },    // 15위
    { x: 60, y: 130 },      // 16위
    { x: -60, y: 130 },     // 17위
    { x: 210, y: -50 },     // 18위
    { x: -210, y: -50 },    // 19위
    { x: 210, y: 50 },      // 20위
  ];

  const wordCloudItems = useMemo(() => {
    if (!regionData?.word_cloud) return [];

    // 1. 점수 순 정렬
    const sortedData = [...regionData.word_cloud].sort((a, b) => (b.score || 0) - (a.score || 0));

    // 2. 상위 20개 매핑
    return sortedData.slice(0, 20).map((item, idx) => {
      const pos = COMPACT_LAYOUT[idx] || COMPACT_LAYOUT[COMPACT_LAYOUT.length - 1]; 
      
      // 폰트 사이즈 및 스타일 결정 (중앙일수록 크고 진하게) - 흰색 배경에 맞게 조정
      let fontSize = '14px';
      let fontWeight = '500';
      let zIndex = 1;
      let color = '#6b7280';

      if (idx === 0) { // 1위
        fontSize = '38px'; fontWeight = '900'; zIndex = 100; color = '#2db400'; 
      } else if (idx < 7) { // 2~7위 (핵심 그룹)
        fontSize = '22px'; fontWeight = '800'; zIndex = 50; color = '#1f2937';
      } else if (idx < 13) { // 중위권
        fontSize = '16px'; fontWeight = '600'; zIndex = 10; color = '#4b5563';
      } else { // 하위권
        fontSize = '13px'; fontWeight = '500'; zIndex = 1; color = '#9ca3af';
      }

      return {
        ...item,
        style: {
          position: "absolute",
          left: `calc(50% + ${pos.x}px)`,
          top: `calc(50% + ${pos.y}px)`,
          transform: "translate(-50%, -50%)",
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
          zIndex: zIndex,
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          whiteSpace: "nowrap",
          letterSpacing: "-0.5px", 
          textShadow: idx === 0 ? "0 4px 15px rgba(45,180,0,0.3)" : "none"
        }
      };
    });
  }, [regionData]);

  // ----------------------------------------------------------------------
  // [헬퍼 함수들]
  // ----------------------------------------------------------------------
  const getRankedKeywords = () => {
    if (!regionData?.word_cloud) return [];
    return [...regionData.word_cloud].sort((a, b) => b.score - a.score).slice(0, 10);
  };

  const getCurrentTabData = () => {
    if (!regionData) return [];
    if (activeTab === 'family') return regionData.family || [];
    if (activeTab === 'couple') return regionData.couple || [];
    if (activeTab === 'healing') return regionData.healing || [];
    return [];
  };

  const openSearch = (keyword, type) => {
    if (!regionData) return;
    const query = `${regionData.host} ${keyword}`;
    let url = '';
    if (type === 'youtube') url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    if (type === 'naver') url = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const getImageUrl = (index) => {
    return `https://picsum.photos/seed/${index + activeTab + regionData?.host}/600/400`;
  };

  // 하단 그래프 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(31, 41, 55, 0.95)', padding: '15px', border: '1px solid #374151', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', minWidth: '180px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#9CA3AF', fontWeight: '600' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
              <span style={{ color: entry.color, display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{width:'10px', height:'10px', borderRadius:'50%', background: entry.color}}></span> <span style={{color: '#E5E7EB'}}>{entry.name}</span>
              </span>
              <span style={{ fontWeight: 'bold', color: '#F3F4F6', fontSize:'15px' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const generateMiniTrend = (score) => {
    // 모달용 미니 그래프 데이터 생성 (데이터가 없을 경우 대비용)
    return Array.from({ length: 7 }, (_, i) => ({
      day: `D-${7-i}`,
      value: 20 + Math.random() * 30 + (score * i)
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
      </style>

      {/* 1. 감성 헤더 */}
      <div style={{ 
        position: 'relative', height: '300px', 
        background: 'linear-gradient(135deg, rgb(55, 55, 65) 0%, rgb(30, 30, 48) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        color: 'white', textAlign: 'center', padding: '0 20px',
        marginBottom: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.1, borderRadius: '16px' }}></div>
        
        <div style={{ zIndex: 1, maxWidth: '800px' }} className="animate-fade-in">
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', backdropFilter: 'blur(4px)' }}>
            Project Analysis
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '20px 0 10px', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {regionData ? `${regionData.host} 트렌드 리포트` : "지역 트렌드 분석"}
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, fontWeight: '300', color: '#D1D5DB' }}>
            데이터 인사이트로 발견한 <strong style={{fontWeight:'700'}}>{regionData?.host}</strong>의 숨겨진 매력과 핫플레이스
          </p>
        </div>
      </div>

      <div className="px-5 pb-12">
        {loading ? (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '20px', color: '#9CA3AF' }}>지역 데이터를 깊이 있게 분석 중입니다...</p>
          </div>
        ) : error ? (
          <div style={{...styles.errorBox, background: '#1F2937', color: '#EF4444'}}><h3>분석 실패</h3><p>{error}</p></div>
        ) : (
          regionData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }} className="animate-fade-in">
              
              {/* 2. 네이버 스타일 워드클라우드 & 순위표 */}
              <div className="grid grid-cols-[2fr_1fr] gap-8">
                
                {/* (좌) 워드클라우드 - 밀집 대형 적용 */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
                  <div style={{ marginBottom: '15px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 className="text-xl font-extrabold text-gray-100 mb-5">☁️ 연관 키워드 맵</h3>
                    <span className="text-xs text-gray-400">* 클릭하여 상세 분석 보기</span>
                  </div>
                  
                  {/* Container */}
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: "400px",
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb"
                  }}>
                    {wordCloudItems.length > 0 ? (
                      wordCloudItems.map((item, idx) => (
                        <span
                          key={idx}
                          style={item.style}
                          onClick={() => setSelectedKeyword(item)}
                          onMouseEnter={(e) => {
                            if (idx !== 0) e.target.style.transform = "translate(-50%, -50%) scale(1.15)";
                            e.target.style.zIndex = "200";
                            e.target.style.color = "#3b82f6";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translate(-50%, -50%) scale(1)";
                            e.target.style.zIndex = item.style.zIndex;
                            e.target.style.color = item.style.color;
                          }}
                        >
                          {item.keyword}
                        </span>
                      ))
                    ) : (
                      <div style={{ display:'flex', height:'100%', justifyContent:'center', alignItems:'center', color:'#9CA3AF' }}>
                        키워드 데이터를 불러오는 중...
                      </div>
                    )}
                  </div>
                </div>

                {/* (우) 인기 순위 TOP 10 */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-extrabold text-gray-100 mb-5">🔥 실시간 인기 TOP 10</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {getRankedKeywords().map((item, idx) => (
                      <li key={idx} style={{ 
                        display: 'flex', alignItems: 'center', padding: '12px 0',
                        borderBottom: idx === 9 ? 'none' : '1px solid #374151', cursor:'pointer'
                      }}
                      onClick={() => setSelectedKeyword(item)}
                      >
                        <span style={{ 
                          width: '24px', height: '24px', borderRadius: '6px', 
                          background: idx < 3 ? '#3b82f6' : '#374151', 
                          color: idx < 3 ? 'white' : '#9CA3AF', 
                          display: 'flex', justifyContent: 'center', alignItems: 'center', 
                          fontSize: '12px', fontWeight: '800', marginRight: '12px'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: idx < 3 ? '700' : '500', color: '#E5E7EB' }}>
                          {item.keyword}
                        </span>
                        {idx < 3 && <span style={{marginLeft:'auto', fontSize:'10px', color:'#ef4444'}}>▲</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. 테마별 추천 */}
              <div>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#F3F4F6', marginBottom: '10px' }}>
                    테마별 지역 선호도 트렌드
                  </h3>
                  <div style={{ display: 'inline-flex', background: '#374151', padding: '4px', borderRadius: '50px' }}>
                    {['family', 'couple', 'healing'].map((tab) => {
                      const isActive = activeTab === tab;
                      return (
                        <button 
                          key={tab} 
                          onClick={() => setActiveTab(tab)}
                          style={{
                            padding: '10px 30px', borderRadius: '50px', fontSize: '16px', fontWeight: '700',
                            background: isActive ? '#1F2937' : 'transparent',
                            color: isActive ? '#60A5FA' : '#9CA3AF',
                            boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                            border: 'none', cursor: 'pointer', transition: 'all 0.3s ease'
                          }}
                        >
                          {tab === 'family' ? '👨‍👩‍👧‍👦 가족' : tab === 'couple' ? '💑 연인' : '🌿 힐링'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  {getCurrentTabData().map((item, idx) => (
                    <div key={idx} style={{...styles.wideCard, background: '#1F2937', border: '1px solid #374151'}}>
                      <div style={{ width: '40%', minWidth: '150px', overflow: 'hidden' }}>
                        <img 
                          src={getImageUrl(idx)} 
                          alt={item.keyword}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                          className="card-img"
                        />
                      </div>
                      <div style={{ width: '60%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                            <span style={{fontSize:'11px', fontWeight:'800', color:'white', background:'#3b82f6', padding:'3px 8px', borderRadius:'4px'}}>추천 {idx+1}</span>
                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#F3F4F6', margin: 0 }}>{item.keyword}</h4>
                          </div>
                          <p style={{ fontSize: '14px', color: '#D1D5DB', lineHeight: '1.6', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.description}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                          <button onClick={() => openSearch(item.keyword, 'naver')} style={{...styles.btnAction, background: '#374151', border: '1px solid #4B5563', color: '#D1D5DB'}}>
                            <span style={{ color: '#03C75A' }}>N</span> 검색
                          </button>
                          <button onClick={() => openSearch(item.keyword, 'youtube')} style={{...styles.btnAction, background: '#374151', border: '1px solid #4B5563', color: '#D1D5DB'}}>
                            <span style={{ color: '#FF0000' }}>▶</span> 영상
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. [맨 아래] 검색량 폭발력 인사이트 카드 */}
              {regionData.growth_stats && (
                <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 animate-fade-in">
                  <div style={{ 
                    display: 'flex', gap: '20px', 
                  }}>
                    {/* 1. 축제 성장률 */}
                    <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #374151' }}>
                      <p style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px' }}>
                        작년 시즌 검색 폭발력 🚀
                      </p>
                      <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#60A5FA', margin: 0 }}>
                        +{regionData.growth_stats.festival_growth}%
                      </h2>
                      <p style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
                        평소 대비 관심도 급증
                      </p>
                    </div>

                    {/* 2. 지역 동반 성장률 */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '600', marginBottom: '8px' }}>
                        지역 유입 효과 🏡
                      </p>
                      <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#818CF8', margin: 0 }}>
                        +{regionData.growth_stats.region_growth}%
                      </h2>
                      <p style={{ fontSize: '13px', color: '#D1D5DB', marginTop: '4px' }}>
                        축제 기간 지역 검색 증가
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. [맨 아래] 비교 분석 그래프 */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 animate-fade-in">
                
                <div className="mb-5 pl-4 border-l-4 border-blue-400">
                  <h3 className="text-2xl font-extrabold text-gray-100">
                    📉 축제 vs 지역 관심도 비교
                  </h3>
                  <p className="text-base text-gray-300 mt-2">
                    <strong className="text-blue-400">{regionData.host} 여행 수요(좌측)</strong> 대비 <strong className="text-pink-400">우리 축제(우측)</strong>의 관심도 흐름을 비교합니다.
                  </p>
                </div>

                {/* [수정] Recharts 에러 방지를 위한 minWidth 추가 */}
                <div style={{ width: '100%', height: '500px', minHeight: '300px', minWidth: '0' }}>
                  {regionData.region_trend && regionData.region_trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={regionData.region_trend} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRegion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFestival" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                        <XAxis 
                          dataKey="period" 
                          tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                          tickMargin={10} 
                          tickFormatter={(str) => str ? str.substring(5, 10).replace('-', '.') : ""} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          stroke="#60A5FA"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke="#F472B6"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        <Area yAxisId="left" type="monotone" dataKey="region" name="지역 여행" stroke="#60A5FA" strokeWidth={2} fillOpacity={1} fill="url(#colorRegion)" animationDuration={1500} />
                        <Area yAxisId="right" type="monotone" dataKey="festival" name="우리 축제" stroke="#F472B6" strokeWidth={3} fillOpacity={1} fill="url(#colorFestival)" animationDuration={1500} />
                        <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{display:'flex', height:'100%', justifyContent:'center', alignItems:'center', color:'#9CA3AF'}}>
                       데이터 분석 중입니다...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* ✨ [모달] 키워드 상세 */}
      {selectedKeyword && (
        <div style={styles.modalOverlay} onClick={() => setSelectedKeyword(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{textAlign:'center', marginBottom:'20px'}}>
              <h3 style={{fontSize:'24px', fontWeight:'bold', color:'#60A5FA'}}>{selectedKeyword.keyword}</h3>
              <p style={{color:'#D1D5DB', marginTop:'5px'}}>{selectedKeyword.description}</p>
            </div>
            
            <div style={{height:'200px', width: '100%', background:'#111827', borderRadius:'12px', marginBottom:'20px', border: '1px solid #374151'}}>
                {/* 상세 트렌드 데이터가 있으면 사용, 없으면 fallback */}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedKeyword.trend_data || generateMiniTrend(selectedKeyword.score)}>
                      <defs>
                        <linearGradient id="colorMini" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMini)" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px' }}>
              <button onClick={() => openSearch(selectedKeyword.keyword, 'naver')} style={{...styles.btnAction, background:'#03C75A', color:'white', border:'none'}}>네이버 검색</button>
              <button onClick={() => openSearch(selectedKeyword.keyword, 'youtube')} style={{...styles.btnAction, background:'#FF0000', color:'white', border:'none'}}>유튜브 영상</button>
            </div>
            <button onClick={() => setSelectedKeyword(null)} style={{position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'20px', cursor:'pointer', color: '#9CA3AF'}}>✕</button>
          </div>
        </div>
      )}

      <div className="pt-4">
        <AnalyzeButton />    
      </div>
    </div>
  );
};

// 스타일
const styles = {
  errorBox: { padding: '60px', textAlign: 'center', background: '#1F2937', borderRadius: '16px', color: '#EF4444' },
  retryButton: { marginTop: '20px', padding: '10px 24px', background: '#EF4444', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' },
  cardBox: { background: '#1F2937', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)', border: '1px solid #374151' },
  sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#F3F4F6', marginBottom: '20px' },
  hoverTooltip: { position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', width: '160px', background: '#1F2937', padding: '12px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid #374151', zIndex: 100, textAlign: 'center', color: '#E5E7EB' },
  wideCard: { display: 'flex', background: '#1F2937', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid #374151', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default', ':hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' } },
  btnAction: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'all 0.2s' },
  sectionBox: { background: '#1F2937', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid #374151' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, animation: 'fadeIn 0.3s' },
  modalContent: { background: '#1F2937', width: '500px', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid #374151', position: 'relative', animation: 'slideUp 0.3s' }
};

export default AnalyzeRegionTrendPage;