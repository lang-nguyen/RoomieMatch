import { DashboardCard } from './DashboardCard';
import styles from './AdminDashboard.module.css';

const avatarClassByTone = {
  orange: styles.avatarOrange,
  green: styles.avatarGreen,
  rose: styles.avatarRose,
  purple: styles.avatarPurple,
};

export const NotificationsCard = ({ notifications, unreadCount, onMarkAllRead }) => {
  const action = (
    <button type="button" className={styles.linkButton} onClick={onMarkAllRead}>
      Đã đọc tất cả
    </button>
  );

  return (
    <DashboardCard
      title={
        <>
          Thông báo
          {unreadCount > 0 && <span className={`${styles.navBadge} ${styles.navBadgeDanger}`}>{unreadCount}</span>}
        </>
      }
      icon="bell"
      action={action}
    >
      <div className={styles.notifList}>
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`${styles.notifItem} ${notification.unread ? styles.notifUnread : ''}`}
          >
            <span className={`${styles.notifAvatar} ${avatarClassByTone[notification.tone] || styles.avatarOrange}`}>
              {notification.initials}
            </span>
            <div className={styles.notifContent}>
              <div className={styles.notifText}>
                <strong>{notification.author}</strong> {notification.message}
              </div>
              <div className={styles.notifTime}>{notification.time}</div>
            </div>
            {notification.unread && <span className={styles.notifDotUnread} />}
          </article>
        ))}
      </div>
    </DashboardCard>
  );
};
