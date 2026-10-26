import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getRole, isLoggedIn } from "../../utils/auth";

/**
 * 로그인한 사용자만 하위 라우트를 볼 수 있게 한다.
 * roles 를 주면 해당 권한만 허용한다 (예: <RequireAuth roles={["ADMIN"]} />).
 */
const RequireAuth = ({ roles }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(getRole())) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
