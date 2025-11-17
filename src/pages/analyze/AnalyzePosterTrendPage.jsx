import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api/BaseAPI'; 
import AnalyzeButton from '../../components/buttons/AnalyzeButton';

const AnalyzePosterTrendPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 1단계 AI 분석 결과 받기
  const analysisResult = location.state || {};
  const strategyText = analysisResult.strategy_report?.strategy_text;

  // 2. 아카이브 데이터 상태 관리
  const [archivePosters, setArchivePosters] = useState([]);
  const [filters, setFilters] = useState({ year: '', theme: '' });
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // ✅ 백엔드 주소 (이미지용)
  const BACKEND_URL = "http://localhost:8081"; 

  // 3. API 호출
  const fetchArchive = async () => {
    setIsLoadingArchive(true);
    try {
      const response = await api.get('/api/poster/archive', {
        params: { year: filters.year, theme: filters.theme }
      });
      console.log("✅ 아카이브 데이터:", response.data);
      // 파트너님 말씀대로 "4~5개"만 보여준다면 여기서 자를 수도 있습니다.
      // (일단 전체 다 보여주고, 필요하면 .slice(0, 5) 추가 가능)
      setArchivePosters(response.data); 
    } catch (error) {
      console.error("❌ 아카이브 불러오기 실패:", error);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  useEffect(() => { fetchArchive(); }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const goToNextStep = () => {
    navigate('/create-poster-prompt', { state: { analysisResult } });
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* 섹션 1: AI 트렌드 분석 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          AI 포스터 트렌드 분석
        </h2>
        <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', lineHeight: '1.8', fontSize: '16px' }}>
          {strategyText ? <p style={{ whiteSpace: 'pre-line' }}>{strategyText}</p> : <p style={{ color: '#999' }}>내용 없음</p>}
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

        {/* 💡 (30년 경력자 수정) 박스형 리스트 (세로 나열) */}
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
                  minHeight: '350px' // 박스 최소 높이 확보
                }}>
                  {/* 🖼️ 왼쪽: 이미지 (고정 너비) */}
                  <div style={{ width: '350px', flexShrink: 0, backgroundColor: '#f0f0f0', position: 'relative' }}>
                    <img 
                      src={`${BACKEND_URL}${item.imageUrl}`} 
                      alt={item.festivalName} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">이미지 없음</div>';
                      }}
                    />
                  </div>

                  {/* 📝 오른쪽: 상세 정보 (나머지 영역) */}
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

                    {/* 상세 설명 (항목별) */}
                    <div style={{ display: 'grid', gap: '15px', alignContent: 'start' }}>
                      {/* 1. 심미성 */}
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#4c6ef5', marginBottom: '4px' }}>🎨 디자인 분석 (심미성)</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555', margin: 0 }}>
                          {item.aestheticDescription || "설명 없음"}
                        </p>
                      </div>

                      {/* 2. 테마 전달력 */}
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#20c997', marginBottom: '4px' }}>💡 테마 전달력</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555', margin: 0 }}>
                          {item.thematicDescription || "설명 없음"}
                        </p>
                      </div>

                      {/* 3. 독창성 (필요 시 주석 해제) */}
                      {/* <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fab005', marginBottom: '4px' }}>✨ 독창성</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#555', margin: 0 }}>
                          {item.creativityDescription || "설명 없음"}
                        </p>
                      </div> 
                      */}
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