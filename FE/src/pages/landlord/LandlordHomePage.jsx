import { Archive, Eye, FileText, Home } from 'lucide-react';
import LandlordProfileForm from '../../features/landlord/components/LandlordProfileForm';
import { useGetLandlordStatsQuery } from '../../features/landlord/api/landlordApi';
import pageStyles from './LandlordPageShared.module.css';
import styles from './LandlordHomePage.module.css';

const formatNumber = (value = 0) => Number(value || 0).toLocaleString('vi-VN');

const StatCard = ({ icon: Icon, label, value }) => (
  <article className={styles.statCard}>
    <span className={styles.statIcon}><Icon size={18} /></span>
    <div>
      <p>{label}</p>
      <strong>{formatNumber(value)}</strong>
    </div>
  </article>
);

const LandlordHomePage = () => {
  const { data } = useGetLandlordStatsQuery({ range: '30d' });
  const totalRooms = data?.total_rooms ?? data?.roomStatus?.reduce((sum, item) => sum + Number(item.value || 0), 0) ?? 0;
  const totalPosts = data?.total_posts ?? data?.postPerformance?.length ?? 0;
  const totalViews = data?.total_views ?? data?.weeklyInteractions?.reduce((sum, item) => sum + Number(item.views || 0), 0) ?? 0;
  const totalSaved = data?.total_saved ?? data?.roomDetails?.reduce((sum, room) => sum + Number(room.favorite_count || 0), 0) ?? 0;

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <section className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1>Trang chủ</h1>
            <p>Tổng quan phòng trọ và bài đăng chủ trọ</p>
          </div>
        </div>
        <div className={styles.statsGrid}>
          <StatCard icon={FileText} label="Tổng bài đăng" value={totalPosts} />
          <StatCard icon={Home} label="Tổng số phòng" value={totalRooms} />
          <StatCard icon={Eye} label="Tổng lượt xem" value={totalViews} />
          <StatCard icon={Archive} label="Tổng lượt lưu trữ" value={totalSaved} />
        </div>
      </section>

      <LandlordProfileForm />
    </div>
  );
};

export default LandlordHomePage;
