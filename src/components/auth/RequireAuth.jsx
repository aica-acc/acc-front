import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * 로그인한 사용자만 하위 라우트를 볼 수 있게 한다.
 * roles 를 주면 해당 권한만 허용한다 (예: <RequireAuth roles={["ADMIN"]} />).
 */
const RequireAuth = ({ roles }) => {
  const location = useLocation();
  // 스토어를 구독하므로 다른 곳에서 로그아웃하면 이 화면도 즉시 로그인 화면으로 보낸다
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.member?.role);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
