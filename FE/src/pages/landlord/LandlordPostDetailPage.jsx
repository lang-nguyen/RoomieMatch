import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Snowflake,
  Sparkles,
  Users,
  Wifi,
  Wind,
  Zap,
} from 'lucide-react';
import { useGetLandlordPostDetailQuery } from '../../features/landlord/api/landlordApi';
import PostStatusBadge from '../../features/landlord/components/PostStatusBadge';
import sharedStyles from './LandlordPageShared.module.css';
import styles from './LandlordPostDetailPage.module.css';

const fallbackImage = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80';

const formatDate = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString('vi-VN');
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const requestStatusLabel = {
  pending: 'Chờ xử lý',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy',
};

const getAmenityIcon = (label = '') => {
  const normalized = label.toLowerCase();
  if (normalized.includes('wifi')) return Wifi;
  if (normalized.includes('máy lạnh') || normalized.includes('điều hòa')) return Snowflake;
  if (normalized.includes('xe')) return Car;
  if (normalized.includes('giường')) return BedDouble;
  if (normalized.includes('wc') || normalized.includes('vệ sinh') || normalized.includes('tắm')) return Bath;
  if (normalized.includes('điện')) return Zap;
  if (normalized.includes('thoáng') || normalized.includes('cửa sổ')) return Wind;
  return Sparkles;
};

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className={styles.metricCard}>
    <span><Icon size={17} /></span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  </div>
);

const LandlordPostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useGetLandlordPostDetailQuery({ id: postId });

  if (isLoading) {
    return <div className={sharedStyles.page}>Đang tải thông tin bài đăng...</div>;
  }

  if (isError || !post) {
    return (
      <div className={sharedStyles.page}>
        <div className={styles.emptyState}>
          <h3>Không tìm thấy bài đăng</h3>
          <button onClick={() => navigate('/landlord/posts')} className={styles.backBtn}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const room = post.room || {};
  const images = post.images?.length ? post.images.map((img) => img.image_url || img).filter(Boolean) : [fallbackImage];
  const amenities = post.amenities || room.amenities || [];
  const address = room.full_address || room.address || 'Chưa cập nhật địa chỉ';
  const title = post.title || room.title || 'Chi tiết bài đăng';

  return (
    <div className={`${sharedStyles.page} ${styles.pageDetail}`}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/landlord/posts')}>
          <ChevronLeft size={16} /> Quay lại
        </button>
        <div className={styles.topActions}>
          <PostStatusBadge status={post.status} subText={post.is_vip ? `Còn ${post.boost_days_left || 0} ngày` : ''} />
        </div>
      </div>

      <section className={styles.hero}>
        <div>
          <div className={styles.breadcrumb}>
            <span>Quản lý bài đăng</span>
            <ArrowLeft size={12} />
            <span>Chi tiết</span>
          </div>
          <h1>{title}</h1>
          <p><MapPin size={16} /> {address}</p>
        </div>
        <div className={styles.heroStats}>
          <MetricCard icon={Eye} label="Lượt xem" value={post.views || 0} />
          <MetricCard icon={Heart} label="Lượt lưu" value={post.likes || 0} />
          <MetricCard icon={MessageCircle} label="Bình luận" value={post.comments || 0} />
        </div>
      </section>

      <div className={styles.contentWrapper}>
        <main className={styles.mainContent}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={images[0]} alt={title} />
            </div>
            <div className={styles.sideImages}>
              {images.slice(1, 5).map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${title} ${index + 2}`} />
              ))}
              {images.length === 1 && <div className={styles.placeholderImage}>Chưa có ảnh khác</div>}
            </div>
          </div>

          <section className={styles.panel}>
            <h2>Tổng quan phòng</h2>
            <div className={styles.highlightGrid}>
              <MetricCard icon={Home} label="Loại phòng" value={room.room_type || 'Phòng trọ'} />
              <MetricCard icon={Sparkles} label="Diện tích" value={`${room.area || 0} m²`} />
              <MetricCard icon={Users} label="Tối đa" value={`${room.max_people || 1} người`} />
              <MetricCard icon={CheckCircle2} label="Hiện tại" value={`${room.current_people || 0} người`} />
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Mô tả bài đăng</h2>
            <p className={styles.description}>{post.description || room.description || 'Chưa có mô tả cho bài đăng này.'}</p>
          </section>

          <section className={styles.panel}>
            <h2>Tiện ích</h2>
            {amenities.length ? (
              <div className={styles.amenityGrid}>
                {amenities.map((amenity) => {
                  const label = typeof amenity === 'string' ? amenity : amenity.name || amenity.label;
                  const Icon = getAmenityIcon(label);
                  return (
                    <div key={label} className={styles.amenityItem}>
                      <Icon size={16} />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.description}>Chưa có tiện ích được cập nhật.</p>
            )}
          </section>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3>Chi phí</h3>
            <div className={styles.costList}>
              <div><span>Giá phòng</span><strong>{formatMoney(room.price)}</strong></div>
              <div><span>Tiền điện</span><strong>{formatMoney(room.electricity_price)}</strong></div>
              <div><span>Tiền nước</span><strong>{formatMoney(room.water_price)}</strong></div>
              <div><span>Wifi</span><strong>{room.internet_price ? formatMoney(room.internet_price) : 'Miễn phí'}</strong></div>
              <div><span>Gửi xe</span><strong>{room.parking_price ? formatMoney(room.parking_price) : 'Miễn phí'}</strong></div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h3>Thông tin bài đăng</h3>
            <div className={styles.costList}>
              <div><span>Mã phòng</span><strong>{room.room_code || room.code || `#${room.id || post.id}`}</strong></div>
              <div><span>Ngày đăng</span><strong>{formatDate(post.created_at || post.publishedAt)}</strong></div>
              <div><span>Cập nhật</span><strong>{formatDate(post.updated_at)}</strong></div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <h3>Yêu cầu thuê ({post.rental_requests?.length || 0})</h3>
            <div className={styles.requestList}>
              {post.rental_requests?.length > 0 ? (
                post.rental_requests.map((req) => (
                  <div key={req.id} className={styles.requestItem}>
                    <strong>{req.tenant_name}</strong>
                    <span className={`${styles.reqStatus} ${styles[req.status] || ''}`}>{requestStatusLabel[req.status] || req.status}</span>
                    <p>{formatDate(req.start_date)}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>Chưa có yêu cầu thuê nào.</p>
              )}
            </div>
            <button className={styles.viewAllBtn} onClick={() => navigate('/landlord/rental-requests')}>
              Quản lý yêu cầu thuê
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LandlordPostDetailPage;
