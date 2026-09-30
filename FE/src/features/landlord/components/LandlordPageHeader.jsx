import styles from './LandlordPageHeader.module.css';

const LandlordPageHeader = ({ eyebrow, title, subtitle, icon: Icon, actions }) => {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1>
          {Icon ? <Icon size={20} /> : null}
          {title}
        </h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
};

export default LandlordPageHeader;
