import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  BarChart2,
  FileText,
  Home,
  List,
  LogOut,
  Package,
  Shield,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { logout } from '../../features/auth/slice';
import styles from './LandlordSidebar.module.css';

const OVERVIEW_ITEMS = [
  { id: 'home', label: 'Trang chủ', path: '/landlord', icon: Home, end: true },
  { id: 'packages', label: 'Mua gói', path: '/landlord/packages', icon: ShoppingBag },
  { id: 'rooms', label: 'Danh sách trọ', path: '/landlord/rooms', icon: List },
  { id: 'stats', label: 'Thống kê', path: '/landlord/stats', icon: BarChart2 },
  { id: 'package-mgmt', label: 'Quản lý gói', path: '/landlord/package-management', icon: Package },
  { id: 'posts', label: 'Quản lý bài đăng', path: '/landlord/posts', icon: FileText },
  { id: 'rental-requests', label: 'Xác nhận thuê', path: '/landlord/rental-requests', icon: UserCheck },
];

const LandlordSidebar = ({ promotedUsers = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <div className={styles.logoMark}>
          <Shield size={18} />
        </div>
        <div className={styles.logoText}>Roomie<span>Match</span></div>
      </div>

      <div className={styles.section}>
        <nav className={styles.nav}>
          {OVERVIEW_ITEMS.map(({ id, label, path, icon: Icon, end }) => (
            <NavLink
              key={id}
              to={path}
              end={end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <Icon size={16} className={styles.navIcon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {promotedUsers.length > 0 && (
        <div className={styles.section}>
          <div className={styles.promotedList}>
            {promotedUsers.map((user) => (
              <div key={user.id} className={styles.promotedItem}>
                <div className={styles.promotedAvatar}>
                  {user.display_name?.[0] ?? 'U'}
                </div>
                <div className={styles.promotedInfo}>
                  <div className={styles.promotedName}>{user.display_name}</div>
                  <div className={styles.promotedSub}>{user.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} className={styles.navIcon} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default LandlordSidebar;
