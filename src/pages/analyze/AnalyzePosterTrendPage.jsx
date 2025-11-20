import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api/BaseAPI'; 
import AnalyzeButton from '../../components/buttons/AnalyzeButton';

const AnalyzePosterTrendPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 1단계 AI 분석 결과 받기 (기획서 분석 내용)
  const analysisResult = location.state || {};
  const strategyText = analysisResult.strategy_report?.strategy_text;

  // 2. 아카이브 데이터 상태 관리 (백엔드에서 가져올 포스터 리스트)
  const [archivePosters, setArchivePosters] = useState([]);
  const [filters, setFilters] = useState({ year: '', theme: '' });
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // ✅ (중요) 백엔드 주소 정의 (이미지 불러올 때 필수!)
  // 백엔드 포트가 8081인지 확인해주세요. (application.properties 참고)
  const BACKEND_URL = "http://localhost:8081"; 

  // 3. "진짜 API" 호출 함수 (DB에서 포스터 리스트 가져오기)
  const fetchArchive = async () => {
    setIsLoadingArchive(true);
    try {
      // 🚀 백엔드 호출: GET /api/poster/archive
      const response = await api.get('/api/poster/archive', {
        params: {
          year: filters.year,
          theme: filters.theme 
        }
      });
      console.log("✅ 아카이브 데이터 수신 성공:", response.data);
      setArchivePosters(response.data);
    } catch (error) {
      console.error("❌ 아카이브 불러오기 실패:", error);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  // 4. 화면이 뜨거나 필터가 바뀌면 API 재호출
  useEffect(() => {
    fetchArchive();
  }, [filters]);

  // 필터 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // 다음 단계 이동
  const goToNextStep = () => {
    navigate('/create-poster-prompt', { state: { analysisResult } });
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* 섹션 1: AI 트렌드 분석 (텍스트 리포트) */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          AI 포스터 트렌드 분석
        </h2>
        <div style={{ 
          padding: '30px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '12px', 
          lineHeight: '1.8', 
          fontSize: '16px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
        }}>
          {strategyText ? (
            <p style={{ whiteSpace: 'pre-line' }}>{strategyText}</p>
          ) : (
            <p style={{ color: '#999' }}>분석된 전략 텍스트가 없습니다.</p>
          )}
        </div>
      </section>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
      
      {/* 섹션 2: 관련 홍보물 아카이브 (박스형 리스트) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>관련 홍보물 아카이브</h2>
            <p style={{ color: '#666' }}>유사한 테마와 키워드를 가진 포스터 사례입니다.</p>
          </div>
          
          {/* 필터 UI */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <select name="year" onChange={handleFilterChange} value={filters.year} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
              <option value="">전체 연도</option>
              <option value="2025">2025년</option>
              <option value="2024">2024년</option>
            </select>
            <select name="theme" onChange={handleFilterChange} value={filters.theme} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
              <option value="">전체 테마</option>
              <option value="봄">봄 / 꽃</option>
              <option value="전통">전통 / 역사</option>
              <option value="야행">야행 / 밤</option>
              <option value="문화">문화 / 예술</option>
              <option value="축제">축제 일반</option>
            </select>
          </div>
        </div>

        {/* 박스형 리스트 (가로 배치: 이미지-왼쪽, 설명-오른쪽) */}
        {isLoadingArchive ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>데이터를 불러오는 중입니다...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {archivePosters.length > 0 ? (
              archivePosters.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  minHeight: '350px'
                }}>
                  {/* 🖼️ 왼쪽: 이미지 영역 (고정 너비) */}
                  <div style={{ width: '350px', flexShrink: 0, backgroundColor: '#f0f0f0', position: 'relative' }}>
                    <img 
                      // ✅ 백엔드 주소 붙여서 이미지 로딩
                      src={`${BACKEND_URL}${item.imageUrl}`} 
                      alt={item.festivalName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">이미지 없음</div>';
                      }}
                    />
                  </div>

                  {/* 📝 오른쪽: 상세 정보 영역 */}
                  <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* 제목 및 태그 */}
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        {item.festivalName}
                      </h3>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ backgroundColor: '#f1f3f5', color: '#495057', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
                          📅 {item.year}년
                        </span>
                        <span style={{ backgroundColor: '#f1f3f5', color: '#495057', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
                          📍 {item.region}
                        </span>
                      </div>
                    </div>

                    {/* 설명 (심미성 & 테마 전달력) */}
                    <div style={{ display: 'grid', gap: '15px', alignContent: 'start' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#4c6ef5', marginBottom: '4px' }}>🎨 디자인 분석</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555', margin: 0 }}>
                          {item.aestheticDescription || "설명 없음"}
                        </p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#20c997', marginBottom: '4px' }}>💡 테마 전달력</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555', margin: 0 }}>
                          {item.thematicDescription || "설명 없음"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f9f9f9', borderRadius: '12px', color: '#888' }}>
                조건에 맞는 홍보물이 없습니다. 필터를 변경해 보세요.
              </div>
            )}
          </div>
        )}
      </section>

      <div style={{ marginTop: '80px', textAlign: 'center' }}>
        <AnalyzeButton onClick={goToNextStep} text="분석 완료! 시안 생성하러 가기" />
      </div>
    </div>
  );
};

export default AnalyzePosterTrendPage;