import { useNavigate } from "react-router-dom";

// ✅ 뒤로가기용 커스텀 훅
export const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  

  return goBack;
};