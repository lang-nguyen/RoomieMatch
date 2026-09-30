import { AdminIcon } from './adminIconMap';
import styles from './AdminDashboard.module.css';

export const AdminSidebar = ({ navSections, activeNavId, onNavChange, isOpen, onClose, onLogout }) => (
  <>
    {isOpen && <button className={styles.mobileOverlay} type="button" aria-label="Đóng menu" onClick={onClose} />}
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarLogo}>
        <div className={styles.logoMark}>
          <AdminIcon name="shield" size={18} />
        </div>
        <div className={styles.logoText}>
          Roomie<span>Quản trị</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {navSections.map((section) => (
          <div key={section.title}>
            <div className={styles.navSectionLabel}>{section.title}</div>
            {section.items.map((item) => {
              const isActive = item.id === activeNavId;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => onNavChange(item.id)}
                >
                  <span className={styles.navIcon}>
                    <AdminIcon name={item.icon} size={16} />
                  </span>
                  {item.label}
                  {item.badge && (
                    <span className={`${styles.navBadge} ${item.badgeTone === 'danger' ? styles.navBadgeDanger : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button type="button" className={`${styles.navItem} ${styles.logoutItem}`} onClick={onLogout}>
          <span className={styles.navIcon}>
            <AdminIcon name="logout" size={16} />
          </span>
          Đăng xuất
        </button>
      </div>
    </aside>
  </>
);
