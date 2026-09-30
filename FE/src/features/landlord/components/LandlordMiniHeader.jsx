import styles from './LandlordMiniHeader.module.css';

const LandlordMiniHeader = ({ search, onSearchChange }) => {
  return (
    <div className={styles.header}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          value={search}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Tìm theo tiêu đề bài viết hoặc ID (#P001)..."
          className={styles.searchInput}
        />
      </div>
    </div>
  );
};

export default LandlordMiniHeader;
