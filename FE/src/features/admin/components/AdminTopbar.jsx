import { AdminIcon } from './adminIconMap';
import styles from './AdminDashboard.module.css';

export const AdminTopbar = ({
  currentUser,
  hasUnreadNotifications,
  pendingVerifications = [],
  isVerificationMenuOpen,
  onToggleVerificationMenu,
  onOpenVerification,
  onOpenMenu,
  onLogout,
}) => (
  <header className={styles.topbar}>
    <button
      className={`${styles.iconButton} ${styles.mobileMenuButton}`}
      type="button"
      aria-label="Mở menu admin"
      onClick={onOpenMenu}
    >
      <AdminIcon name="menu" size={17} />
    </button>

    <div className={styles.searchWrap}>
      <span className={styles.searchIcon}>
        <AdminIcon name="search" size={15} />
      </span>
      <input type="search" placeholder="Tìm kiếm..." />
    </div>

    <div className={styles.topbarActions}>
      <div className={styles.topbarMenuWrap}>
        <button className={styles.iconButton} type="button" aria-label="Thông báo" onClick={onToggleVerificationMenu}>
          <AdminIcon name="bell" size={17} />
          {hasUnreadNotifications && <span className={styles.notifDot} />}
        </button>

        {isVerificationMenuOpen && (
          <section className={styles.topbarDropdown}>
            <div className={styles.topbarDropdownHead}>
              <div>
                <strong>Yêu cầu duyệt</strong>
                <span>{pendingVerifications.length} hồ sơ CCCD đang chờ</span>
              </div>
              <span className={`${styles.dataBadge} ${styles.badgeWarning}`}>Chờ duyệt</span>
            </div>

            {pendingVerifications.length ? (
              <div className={styles.topbarDropdownList}>
                {pendingVerifications.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.topbarDropdownItem}
                    onClick={() => onOpenVerification(item)}
                  >
                    <span className={styles.topbarDropdownAvatar}>
                      {(item.legal_name || item.username || 'LD').slice(0, 2).toUpperCase()}
                    </span>
                    <span className={styles.topbarDropdownContent}>
                      <strong>{item.legal_name || item.username || 'Chủ trọ'}</strong>
                      <span>
                        {item.identity_number || 'Chưa có số CCCD'} · {item.email || 'Chưa có email'}
                      </span>
                    </span>
                    <span className={styles.topbarDropdownBadge}>Duyệt</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.topbarDropdownEmpty}>Hiện chưa có hồ sơ xác minh nào cần xử lý.</div>
            )}
          </section>
        )}
      </div>

      <button className={styles.userChip} type="button">
        <span className={styles.userAvatar}>{currentUser?.initials || 'AD'}</span>
        <span className={styles.userName}>{currentUser?.name || 'Quản trị viên'}</span>
      </button>

      <button className={`${styles.iconButton} ${styles.topbarLogoutButton}`} type="button" aria-label="Đăng xuất" title="Đăng xuất" onClick={onLogout}>
        <AdminIcon name="logout" size={17} />
      </button>
    </div>
  </header>
);
