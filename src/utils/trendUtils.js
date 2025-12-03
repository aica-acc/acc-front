/**
 * 트렌드 분석 유틸 함수들
 */

/**
 * 네이버 주간 데이터의 날짜를 구글 트렌드와 정렬하기 위해 변환
 * 네이버 데이터를 구글 기준에 맞추기 위해 날짜를 조정
 * 네이버 데이터는 구글보다 하루 앞서있거나 뒤에 있을 수 있으므로 구글 기준으로 맞춤
 * @param {string} period - 네이버 데이터의 날짜 문자열 (YYYY-MM-DD 형식)
 * @param {boolean} alignToGoogle - 구글 기준에 맞추기 위해 하루 빼기 (기본값: true)
 * @returns {string} - 정렬된 날짜 문자열 (YYYY-MM-DD 형식)
 */
export function normalizeNaverDate(period, alignToGoogle = true) {
  if (!period) return null;
  
  try {
    const date = new Date(period);
    if (isNaN(date.getTime())) return period; // 유효하지 않은 날짜면 원본 반환
    
    // 네이버 데이터를 구글 기준에 맞추기 위해 하루 빼기 (네이버가 하루 앞서있을 수 있음)
    if (alignToGoogle) {
      date.setDate(date.getDate() - 1);
    }
    
    // YYYY-MM-DD 형식으로 반환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return period; // 오류 시 원본 반환
  }
}

/**
 * 주간 데이터를 월요일 기준으로 정규화
 * @param {string} period - 날짜 문자열 (YYYY-MM-DD 형식)
 * @returns {string} - 해당 주의 월요일 날짜 (YYYY-MM-DD 형식)
 */
export function normalizeToMonday(period) {
  if (!period) return null;
  
  try {
    const d = new Date(period);
    if (isNaN(d.getTime())) return period;
    
    const day = d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const diff = (day === 0 ? -6 : 1 - day); // 일요일이면 -6일, 월요일이면 0일, 화요일이면 -1일, ...
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(monday.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${dayOfMonth}`;
  } catch (error) {
    console.error('월요일 정규화 오류:', error);
    return period;
  }
}

/**
 * 구글과 네이버 트렌드 데이터를 병합하고 날짜 정렬
 * @param {Array} googleTrend - 구글 트렌드 데이터 배열
 * @param {Array} naverData - 네이버 데이터 배열 (주간 또는 일간)
 * @param {boolean} useNaverDateNormalization - 네이버 날짜 정규화 사용 여부 (기본값: true)
 * @param {boolean} useMondayNormalization - 월요일 정규화 사용 여부 (기본값: false, 주간 데이터일 때만 사용)
 * @returns {Array} - 병합된 트렌드 데이터 배열
 */
export function mergeTrendData(googleTrend = [], naverData = [], useNaverDateNormalization = true, useMondayNormalization = false) {
  const map = new Map();

  // 구글 데이터 추가
  googleTrend.forEach((item) => {
    const key = item?.period;
    if (!key) return;
    if (!map.has(key)) map.set(key, { period: key });
    map.get(key).google = item.ratio ?? 0;
  });

  // 네이버 데이터 추가
  naverData.forEach((item) => {
    if (!item?.period) return;
    
    let key = item.period;
    
    // 월요일 정규화가 필요한 경우 (주간 데이터)
    if (useMondayNormalization) {
      key = normalizeToMonday(key);
    }
    
    // 네이버 날짜 정규화 (하루 밀림 보정)
    if (useNaverDateNormalization) {
      key = normalizeNaverDate(key);
    }
    
    if (!key) return;
    if (!map.has(key)) map.set(key, { period: key });
    map.get(key).naver = item.ratio ?? 0;
  });

  // 날짜순으로 정렬
  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(a.period) - new Date(b.period)
  );

  return merged;
}

