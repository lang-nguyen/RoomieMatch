import styles from './PackageUsageBar.module.css';

const PackageUsageBar = ({ label, valueText, percent = 0, tone = 'orange' }) => {
  const width = Math.max(0, Math.min(100, percent));

  return (
    <div className={styles.row}>
      <div className={styles.meta}>
        <span>{label}</span>
        <strong>{valueText}</strong>
      </div>
      <div className={styles.track}>
        <span className={`${styles.fill} ${styles[tone]}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

export default PackageUsageBar;
