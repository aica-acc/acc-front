import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import AnalyzeButton from '../../components/buttons/AnalyzeButton';


const AnalyzePosterTrendPage = () => {

  // navigate -> 다음페이지로 고 , location -> 이전페이지 데이터가 무엇인가??
  const navigate = useNavigate();
  const location = useLocation();

  // 데이터 추출
const analysisResult = location.state || JSON.parse(sessionStorage.getItem("proposalData")) || {};


  // 비정상 접근 차단(useEffect)
  useEffect(() => {
    // analysisResult => 데이터 없으면 -> 새로고침, 주소창 직접입력
    if(!analysisResult || Object.keys(analysisResult).length === 0) {
      console.warn("분석 결과가 없습니다. 업로드 페이지로 이동합니다.");
      // 분석 결과가 없기에 1단계 분석을 다시하도록 '업로드 페이지'로 돌려보내기 위한 코드
      navigate('/upload', {replace: true})
    }
  }, [analysisResult, navigate]);

  // 랜더링 오류 방지 -> 데이터 없으면 null 아무것도 하지 않기
  if(!analysisResult|| Object.keys(analysisResult).length === 0) return null;

  // 데이터 가공 -> 결과 100% 나왔을때
  const strategyText = analysisResult.strategy_report?.strategy_text;
  const trendData = analysisResult.trend_analysis || [];

  // 화면
  return (
    <div>
      {/* 1. 설명 글부분 */}
      <section>
        <h2>AI 포스터 트렌드 분석</h2>
        <p>{strategyText}</p>
      </section>

      <hr />
      
      {/* 2. 포스터 홍보물 사진과 설명(트렌드 상세설명) */}
      <section>
        <h2>핵심 포스터 트렌드</h2>

        {/*trendData 데이커 1개라도 있을시 (>0) */}
        {trendData.length > 0 ? (
          //map 배열 각항목 <div) 변환
          trendData.map((trend, index) => (
          // key=:index -> 항목 구별하기위한 필수 값
            <div key={index}>
              <h3>{trend.keyword}</h3>
              {trend.related_image_url && <img src={trend.related_image_url} />}
              <p>{trend.description}</p>
            </div>
          ))
        ): (
          // 데이터가 없으면 없다고 매시지 보여주기
          <p>상세 트렌드 데이터가 없습니다.</p>
        )}
      </section>
      {/* 3. 다음 단계 버튼 컴포넌트 사용 */}
      <AnalyzeButton label="시안(프롬포트) 생성하러 가기" />

    </div>
  );
};

export default AnalyzePosterTrendPage