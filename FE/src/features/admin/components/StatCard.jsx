import { AdminIcon } from './adminIconMap';
import { useCountUp } from '../hooks/useCountUp';
import styles from './AdminDashboard.module.css';

const formatValue = (value, format) => {
  if (format === 'currency') {
    return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
  }

  return new Intl.NumberFormat('vi-VN').format(value);
};

export const StatCard = ({ stat, onNavigate }) => {
  const animatedValue = useCountUp(stat.value);
  const trendClass = stat.trend === 'down' ? styles.trendDown : styles.trendUp;

  return (
    <article className={`${styles.statCard} ${stat.isPrimary ? styles.statCardPrimary : ''}`}>
      <div className={styles.statTop}>
        <div className={styles.statIconWrap}>
          <AdminIcon name={stat.icon} size={18} />
        </div>
        <span className={`${styles.statTrend} ${trendClass}`}>
          {stat.trend === 'down' ? '↓' : '↑'} {stat.trendLabel}
        </span>
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
      <div className={styles.statValue}>{formatValue(animatedValue, stat.format)}</div>
      <div className={styles.statChange}>{stat.changeLabel}</div>
      {stat.linkLabel && (
        <button type="button" className={styles.statLink} onClick={() => onNavigate?.(stat.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {stat.linkLabel} <span>→</span>
        </button>
      )}
    </article>
  );
};
