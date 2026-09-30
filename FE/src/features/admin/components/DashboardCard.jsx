import { AdminIcon } from './adminIconMap';
import styles from './AdminDashboard.module.css';

export const DashboardCard = ({ title, icon, action, children }) => (
  <section className={styles.card}>
    <div className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>
        <span className={styles.cardTitleIcon}>
          <AdminIcon name={icon} size={14} />
        </span>
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);
