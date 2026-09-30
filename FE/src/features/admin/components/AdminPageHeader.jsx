import { AdminIcon } from './adminIconMap';
import styles from './AdminDashboard.module.css';

const formatDate = (date) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

export const AdminPageHeader = ({ header }) => {
  const titlePrefix = header.title.replace(header.highlight, '').trim();

  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>
          {titlePrefix} <span>{header.highlight}</span>
        </h1>
        <p className={styles.pageSubtitle}>{header.subtitle}</p>
      </div>
      <div className={styles.dateBadge}>
        <AdminIcon name="calendar" size={14} />
        {formatDate(new Date())}
      </div>
    </div>
  );
};
