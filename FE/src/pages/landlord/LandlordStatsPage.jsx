import { useState } from 'react';
import { Archive, CalendarDays, Eye, FileText, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetLandlordStatsQuery } from '../../features/landlord/api/landlordApi';
import { BarChart, DonutChart, WeeklyLineChart } from '../../features/landlord/components/StatsCharts';
import LandlordPageHeader from '../../features/landlord/components/LandlordPageHeader';
import styles from './LandlordStatsPage.module.css';

const ICONS = { file: FileText, home: Home, eye: Eye, archive: Archive };
const STATUS_LABELS = { rented: 'Đã thuê', available: 'Trống', negotiating: 'Đang thương lượng' };
const RANGE_OPTIONS = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '3m', label: '3 tháng' },
];

const formatMoney = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;
const formatNumber = (value = 0) => Number(value || 0).toLocaleString('vi-VN');
const getTodayInputValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const StatCard = ({ item }) => {
  const Icon = ICONS[item.icon] || FileText;
  return (
    <article className={styles.statCard}>
      <div className={styles.cardTop}>
        <span className={styles.cardIcon}><Icon size={18} /></span>
        <em className={styles[item.tone]}>{item.change}</em>
      </div>
      <strong>{formatNumber(item.value)}</strong>
      <span>{item.label}</span>
    </article>
  );
};

const LandlordStatsPage = () => {
  const [range, setRange] = useState('30d');
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetLandlordStatsQuery({ range, date: selectedDate });

  if (isLoading) return <div className={styles.loading}>Đang tải thống kê...</div>;
  if (isError || !data) {
    return <div className={styles.loading}>Không tải được thống kê. <button onClick={refetch}>Thử lại</button></div>;
  }

  const totalRooms = data.total_rooms ?? data.roomStatus.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const totalPosts = data.total_posts ?? data.summary?.find((item) => item.id === 'posts')?.value ?? data.postPerformance?.length ?? 0;
  const totalViews = data.total_views ?? data.summary?.find((item) => item.id === 'views')?.value ?? data.weeklyInteractions?.reduce((sum, item) => sum + Number(item.views || 0), 0) ?? 0;
  const totalSaved = data.total_saved ?? data.total_favorites ?? data.roomDetails?.reduce((sum, room) => sum + Number(room.favorite_count || 0), 0) ?? 0;
  const summary = [
    { id: 'posts', label: 'Tổng bài đăng', value: totalPosts, icon: 'file', change: '+0%', tone: 'orange' },
    { id: 'rooms', label: 'Tổng số phòng', value: totalRooms, icon: 'home', change: '+0%', tone: 'muted' },
    { id: 'views', label: 'Tổng lượt xem', value: totalViews, icon: 'eye', change: '+0%', tone: 'green' },
    { id: 'saved', label: 'Tổng lượt lưu trữ', value: totalSaved, icon: 'archive', change: '+0%', tone: 'orange' },
  ];
  const maxRoomFavorites = Math.max(...data.roomDetails.map((room) => room.favorite_count || 0), 1);

  const handleRangeChange = (value) => {
    setRange(value);
  };

  const handleDateChange = (value) => {
    setSelectedDate(value);
  };

  return (
    <div className={styles.page}>
      <LandlordPageHeader
        icon={Eye}
        title="Thống kê"
        subtitle="Tổng quan bài đăng, lượt lưu và hoạt động phòng trọ của bạn"
        actions={(
          <div className={styles.headerActions}>
            {RANGE_OPTIONS.map((item) => (
              <button
                key={item.value}
                className={range === item.value && !selectedDate ? styles.activeRange : ''}
                onClick={() => handleRangeChange(item.value)}
              >
                {item.label}
              </button>
            ))}
            <label className={`${styles.dateFilter} ${selectedDate ? styles.dateFilterActive : ''}`}>
              <CalendarDays size={15} />
              <input
                type="date"
                value={selectedDate}
                aria-label="Lọc thống kê theo ngày cụ thể"
                onChange={(event) => handleDateChange(event.target.value)}
              />
            </label>
            <button className={styles.newPost} onClick={() => navigate('/landlord/posts')}>
              <Plus size={15} /> Đăng bài mới
            </button>
          </div>
        )}
      />

      <div className={styles.statsGrid}>{summary.map((item) => <StatCard key={item.id} item={item} />)}</div>

      <div className={styles.chartGrid}>
        <section className={`${styles.panel} ${styles.linePanel}`}>
          <h2>Lượt tương tác theo tuần</h2>
          <p>Hoạt động trong khoảng thời gian đã chọn</p>
          <div className={styles.legend}><span>Lượt xem</span><span>Lượt liên hệ</span></div>
          <WeeklyLineChart data={data.weeklyInteractions} />
        </section>

        <section className={styles.panel}>
          <h2>Tình trạng phòng</h2>
          <p>{formatNumber(totalRooms)} phòng tổng cộng</p>
          <div className={styles.legend}>
            {data.roomStatus.map((item) => <span key={item.label} style={{ '--dot': item.color }}>{STATUS_LABELS[item.label] || item.label} ({formatNumber(item.value)})</span>)}
          </div>
          <DonutChart data={data.roomStatus} total={totalRooms} />
        </section>
      </div>

      <section className={styles.panel}>
        <h2>Hiệu suất bài đăng</h2>
        <p>So sánh lượt xem và lượt lưu theo từng bài đăng</p>
        {data.postPerformance.length ? <BarChart data={data.postPerformance} /> : <div className={styles.loading}>Chưa có bài đăng để thống kê.</div>}
      </section>

      <section className={`${styles.panel} ${styles.roomPanel}`}>
        <div className={styles.roomHead}>
          <div>
            <h2>Chi tiết phòng</h2>
            <p>Hiển thị {formatNumber(data.roomDetails.length)} / {formatNumber(totalRooms)} phòng</p>
          </div>
          <button onClick={() => navigate('/landlord/rooms')}>Xem tất cả</button>
        </div>
        <div className={styles.roomTableWrap}>
          <table>
            <thead>
              <tr><th>Phòng</th><th>Bài đăng</th><th>Giá thuê</th><th>Lượt lưu</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {data.roomDetails.length === 0 ? (
                <tr><td colSpan="5" className={styles.loading}>Chưa có phòng trọ nào.</td></tr>
              ) : data.roomDetails.map((room) => (
                <tr key={room.id}>
                  <td className={styles.roomCode}>{room.room_code || room.id}</td>
                  <td>{room.post || room.title || 'Chưa có tiêu đề'}</td>
                  <td className={styles.price}>{formatMoney(room.price)}</td>
                  <td><div className={styles.viewsCell}><span style={{ width: `${Math.max(8, ((room.favorite_count || 0) / maxRoomFavorites) * 100)}%` }} /><em>{formatNumber(room.favorite_count)}</em></div></td>
                  <td><span className={`${styles.status} ${styles[room.status] || ''}`}>{STATUS_LABELS[room.status] || room.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LandlordStatsPage;
