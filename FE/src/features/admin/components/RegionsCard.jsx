import { AdminIcon } from './adminIconMap';
import { DashboardCard } from './DashboardCard';
import styles from './AdminDashboard.module.css';

export const RegionsCard = ({ regions, searchValue, onSearchChange, onRefresh, onRegionClick }) => {
  const action = (
    <button type="button" className={styles.buttonSmall} onClick={onRefresh}>
      <AdminIcon name="refresh" size={13} />
      Làm mới
    </button>
  );

  return (
    <DashboardCard title="Khu vực" icon="map-pin" action={action}>
      <label className={styles.searchField}>
        <AdminIcon name="search" size={14} />
        <input
          type="search"
          placeholder="Tìm tỉnh / thành phố..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <div className={styles.regionList}>
        {regions.length > 0 ? (
          regions.map((region) => (
            <button key={region.id} type="button" className={styles.regionItem} onClick={() => onRegionClick && onRegionClick(region.name)}>
              <span className={styles.regionIcon}>
                <AdminIcon name={region.icon} size={17} />
              </span>
              <span className={styles.regionInfo}>
                <span className={styles.regionName}>{region.name}</span>
              </span>
              <span className={styles.regionCount}>{region.count} phòng trọ</span>
              <span className={styles.regionArrow}>
                <AdminIcon name="chevron" size={13} />
              </span>
            </button>
          ))
        ) : (
          <div className={styles.emptyState}>Không tìm thấy khu vực phù hợp.</div>
        )}
      </div>
    </DashboardCard>
  );
};
