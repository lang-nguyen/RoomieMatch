import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/slice';

const normalizeRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase().replace(/^role[_-]?/, '');

  if (normalized.includes('admin') || normalized.includes('quản trị') || normalized.includes('quan tri')) {
    return 'admin';
  }

  if (normalized.includes('landlord') || normalized.includes('chủ trọ') || normalized.includes('chu tro')) {
    return 'landlord';
  }

  if (normalized.includes('tenant') || normalized.includes('khách thuê') || normalized.includes('khach thue')) {
    return 'tenant';
  }

  return normalized;
};

/**
 * Route guard component.
 * - Chưa đăng nhập → redirect về /login (lưu lại URL gốc trong state)
 * - Đã đăng nhập nhưng role không hợp lệ → redirect về /unauthorized
 * - Đủ điều kiện → render <Outlet />
 *
 * @param {string[]} allowedRoles - Mảng account_type được phép truy cập.
 *   Nếu để trống, chỉ cần đăng nhập là đủ.
 */
const RequireAuth = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (!isAuthenticated) {
    // Chưa đăng nhập → về login, giữ lại redirect path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(user?.account_type || user?.accountType || user?.role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (allowedRoles.length > 0 && !userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    // Đã đăng nhập nhưng không đúng role
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
