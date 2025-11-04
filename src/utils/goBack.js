import { useNavigate } from "react-router-dom";

// ✅ 뒤로가기용 커스텀 훅
export const goBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // 브라우저 히스토리에서 한 단계 이전으로 이동
  };

  return goBack;
};