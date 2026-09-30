import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { baseApi } from '../../../shared/api/baseApi';
import { logout } from '../../auth/slice';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminTopbar } from '../components/AdminTopbar';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { StatCard } from '../components/StatCard';
import { NotificationsCard } from '../components/NotificationsCard';
import { AnalyticsTab } from '../components/AnalyticsTab';
import { UsersTab } from '../components/UsersTab';
import { PostsTab } from '../components/PostsTab';
import { RoomsTab } from '../components/RoomsTab';
import { PackagesTab } from '../components/PackagesTab';
import { RoleFeaturesTab } from '../components/RoleFeaturesTab';
import { CategoriesTab } from '../components/CategoriesTab';
import { OrdersTab } from '../components/OrdersTab';
import { RegionsCard } from '../components/RegionsCard';
import { useGetLandlordVerificationsQuery } from '../api/adminApi';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import styles from '../components/AdminDashboard.module.css';

const pageHeaders = {
  dashboard: {
    title: 'Tổng quan',
    highlight: 'quan',
    subtitle: 'Chào mừng trở lại, quản trị viên. Hệ thống đang hoạt động bình thường',
  },
  analytics: {
    title: 'Báo cáo',
    highlight: 'cáo',
    subtitle: 'Theo dõi tăng trưởng, doanh thu, bài đăng và tình trạng khiếu nại',
  },
  users: {
    title: 'Người dùng',
    highlight: 'dùng',
    subtitle: 'Quản lý tài khoản, vai trò và trạng thái hoạt động trên RoomieMatch',
  },
  posts: {
    title: 'Bài đăng',
    highlight: 'đăng',
    subtitle: 'Kiểm duyệt nội dung, theo dõi chỉ số và đánh dấu bài nổi bật',
  },
  rooms: {
    title: 'Phòng trọ',
    highlight: 'trọ',
    subtitle: 'Theo dõi trạng thái phòng, khu vực, chủ phòng và loại hình cho thuê',
  },
  packages: {
    title: 'Gói dịch vụ',
    highlight: 'vụ',
    subtitle: 'Thiết lập gói trả phí, quyền lợi và trạng thái kinh doanh',
  },
  'role-features': {
    title: 'Tính năng gói',
    highlight: 'năng',
    subtitle: 'Quản lý các định mức và chức năng dành riêng cho từng nhóm khách',
  },
  categories: {
    title: 'Danh mục',
    highlight: 'mục',
    subtitle: 'Quản lý danh mục khu vực, loại phòng và tiện ích tìm kiếm',
  },
  orders: {
    title: 'Đơn hàng',
    highlight: 'hàng',
    subtitle: 'Theo dõi giao dịch, doanh thu và trạng thái thanh toán',
  },
};

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isVerificationMenuOpen, setIsVerificationMenuOpen] = useState(false);
  const [verificationFocusId, setVerificationFocusId] = useState(null);
  const [roomsFocusArea, setRoomsFocusArea] = useState('');
  const {
    navSections,
    activeNavId,
    setActiveNavId,
    dashboard,
    regions,
    regionSearch,
    setRegionSearch,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    isLoading,
    isError,
    refetch,
  } = useAdminDashboard();
  const { data: pendingVerifications = [] } = useGetLandlordVerificationsQuery({ status: 'pending' });

  const handleNavChange = (itemId) => {
    setActiveNavId(itemId);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleCancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate('/login', { replace: true });
  };

  const renderDashboardHome = () => (
    <>
      <section className={styles.statsGrid}>
        {dashboard.stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} onNavigate={(id) => {
            const targetId = ['landlords', 'tenants'].includes(id) ? 'users' : id;
            if (pageHeaders[targetId]) handleNavChange(targetId);
            else if (id === 'revenue') handleNavChange('analytics');
          }} />
        ))}
      </section>

      <section className={styles.bottomGrid}>
        <div className={styles.leftCol}>
          <RegionsCard
            regions={regions}
            searchValue={regionSearch}
            onSearchChange={setRegionSearch}
            onRefresh={refetch}
            onRegionClick={(regionName) => {
              setRoomsFocusArea(regionName);
              handleNavChange('rooms');
            }}
          />
        </div>
        <div className={styles.rightCol}>
          <NotificationsCard
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllNotificationsRead}
          />
        </div>
      </section>
    </>
  );

  const renderActiveView = () => {
    switch (activeNavId) {
      case 'analytics':
        return <AnalyticsTab />;
      case 'users':
        return (
          <UsersTab
            verificationFocusId={verificationFocusId}
            onVerificationFocusHandled={() => setVerificationFocusId(null)}
          />
        );
      case 'posts':
        return <PostsTab />;
      case 'rooms':
        return (
          <RoomsTab
            initialArea={roomsFocusArea}
            onInitialAreaHandled={() => setRoomsFocusArea('')}
          />
        );
      case 'packages':
        return <PackagesTab />;
      case 'role-features':
        return <RoleFeaturesTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'orders':
        return <OrdersTab />;
      case 'dashboard':
        return renderDashboardHome();
      default:
        return (
          <div className={styles.emptyState}>
            Tính năng này đang được chuẩn bị. Vui lòng chọn một mục quản trị khác ở thanh bên.
          </div>
        );
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminSidebar
        navSections={navSections}
        activeNavId={activeNavId}
        onNavChange={handleNavChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        <AdminTopbar
          currentUser={dashboard.currentUser}
          hasUnreadNotifications={unreadCount > 0 || pendingVerifications.length > 0}
          pendingVerifications={pendingVerifications}
          isVerificationMenuOpen={isVerificationMenuOpen}
          onToggleVerificationMenu={() => setIsVerificationMenuOpen((value) => !value)}
          onOpenVerification={(item) => {
            setActiveNavId('users');
            setVerificationFocusId(item.id);
            setIsVerificationMenuOpen(false);
          }}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <div className={styles.content}>
          <AdminPageHeader header={pageHeaders[activeNavId] || dashboard.pageHeader} />

          {isError && (
            <div className={styles.emptyState}>
              Không tải được dữ liệu bảng điều khiển.{' '}
              <button type="button" className={styles.linkButton} onClick={refetch}>
                Thử lại
              </button>
            </div>
          )}

          {isLoading ? <div className={styles.loadingState}>Đang tải dữ liệu quản trị...</div> : renderActiveView()}
        </div>
      </main>

      {isLogoutConfirmOpen && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={handleCancelLogout}>
          <section className={styles.logoutConfirmCard} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className={styles.logoutConfirmClose} aria-label="Đóng hộp thoại" onClick={handleCancelLogout}>
              <span>×</span>
            </button>
            <h2>Đăng xuất?</h2>
            <p>Bạn sẽ cần đăng nhập lại để tiếp tục quản trị hệ thống.</p>
            <div className={styles.logoutConfirmActions}>
              <button type="button" className={styles.buttonSmall} onClick={handleCancelLogout}>
                Huỷ
              </button>
              <button type="button" className={`${styles.buttonSmall} ${styles.buttonPrimary}`} onClick={handleConfirmLogout}>
                Xác nhận
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;



