import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Eye,
  Flame,
  Grid2X2,
  Heart,
  List,
  MessageCircle,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useBoostLandlordPostMutation,
  useCancelPostBoostMutation,
  useDeleteLandlordPostMutation,
  useGetLandlordPostsQuery,
} from '../../features/landlord/api/landlordApi';
import LandlordPageHeader from '../../features/landlord/components/LandlordPageHeader';
import PostStatusBadge from '../../features/landlord/components/PostStatusBadge';
import ConfirmModal from '../../shared/components/ConfirmModal';
import styles from './LandlordPostsPage.module.css';

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả', countKey: 'total' },
  { value: 'pending', label: 'Chờ duyệt', countKey: 'pending' },
  { value: 'approved', label: 'Đã duyệt', countKey: 'approved' },
  { value: 'boosted', label: 'Đang nổi bật', countKey: 'boosted' },
  { value: 'rejected', label: 'Từ chối', countKey: 'rejected' },
  { value: 'closed', label: 'Đã đóng', countKey: 'closed' },
];

const TIME_FILTERS = [
  { value: '', label: 'Tất cả ngày đăng' },
  { value: '7d', label: '7 ngày gần đây' },
  { value: '30d', label: '30 ngày gần đây' },
  { value: '90d', label: '3 tháng gần đây' },
];

const formatCompact = (value = 0) => {
  const numeric = Number(value) || 0;
  if (numeric >= 1000) return `${(numeric / 1000).toFixed(1)}k`;
  return String(numeric);
};

const getPostDate = (post) => new Date(post.publishedAt || post.created_at || post.updated_at || 0);

const formatDate = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed);
};

const isWithinTimeFilter = (post, filter) => {
  if (!filter) return true;
  const postDate = getPostDate(post);
  if (Number.isNaN(postDate.getTime())) return false;
  const dayCount = Number(filter.replace('d', ''));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dayCount);
  return postDate >= cutoff;
};

const PostThumbnail = ({ post }) => (
  <div className={styles.thumb}>
    {post.thumbnail ? <img src={post.thumbnail} alt="" /> : <List size={13} />}
  </div>
);

const StatIcon = ({ icon: Icon, value }) => (
  <span className={styles.statIconOnly}>
    <Icon size={15} />
    <strong>{formatCompact(value)}</strong>
  </span>
);

const BoostConfirmModal = ({ post, onCancel, onConfirm, isLoading }) => {
  if (!post) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.boostModal} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onCancel} aria-label="Đóng">
          <X size={18} />
        </button>
        <div className={styles.boostIcon}><Flame size={28} /></div>
        <h3>Xác nhận đẩy nổi bật</h3>
        <p>Bài đăng <strong>{post.title}</strong> sẽ được ưu tiên hiển thị theo gói đang sử dụng.</p>
        <div className={styles.boostNote}>
          Chỉ bài đã được duyệt mới có thể đẩy nổi bật.
        </div>
        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelModalBtn} onClick={onCancel}>Hủy</button>
          <button type="button" className={styles.confirmBoostBtn} onClick={onConfirm} disabled={isLoading}>
            <Flame size={15} />
            {isLoading ? 'Đang xử lý...' : 'Đẩy nổi bật'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, onBoost, onCancelBoost, onView, onDelete }) => (
  <article className={styles.postCard}>
    <div className={styles.postCardThumb}>
      {post.thumbnail ? <img src={post.thumbnail} alt={post.title} /> : <List size={18} />}
      <div className={styles.cardStatus}>
        <PostStatusBadge
          status={post.status}
          subText={post.status === 'boosted' ? `Còn ${post.boostDaysLeft || post.boost_days_left || 0} ngày` : ''}
        />
      </div>
    </div>
    <div className={styles.postCardBody}>
      <div className={styles.postCardHead}>
        <div>
          <strong>{post.title}</strong>
          <span>{post.room_code || post.code}</span>
        </div>
      </div>
      <div className={styles.postCardStats} aria-label="Chỉ số bài đăng">
        <StatIcon icon={Eye} value={post.views} />
        <StatIcon icon={Heart} value={post.likes} />
        <StatIcon icon={MessageCircle} value={post.comments} />
      </div>
      <div className={styles.postCardFooter}>
        <small><CalendarDays size={13} /> {formatDate(post.publishedAt || post.created_at)}</small>
        <div className={styles.actions}>
          {post.status !== 'boosted' ? (
            <button title="Đẩy nổi bật" onClick={() => onBoost(post)}><Flame size={13} /></button>
          ) : (
            <button title="Hủy nổi bật" className={styles.dangerIcon} onClick={() => onCancelBoost(post)}><X size={13} /></button>
          )}
          <button title="Xem" onClick={() => onView(post)}><Eye size={13} /></button>
          <button title="Xóa" onClick={() => onDelete(post)}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  </article>
);

const LandlordPostsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [boostTarget, setBoostTarget] = useState(null);
  const [cancelBoostTarget, setCancelBoostTarget] = useState(null);
  const [toast, setToast] = useState('');

  const { data, isLoading, isFetching, isError, refetch } = useGetLandlordPostsQuery({
    page,
    pageSize: 8,
    search,
    status,
  });
  const [deletePost] = useDeleteLandlordPostMutation();
  const [boostPost, boostState] = useBoostLandlordPostMutation();
  const [cancelBoost] = useCancelPostBoostMutation();

  const posts = useMemo(() => {
    const items = [...(data?.items ?? [])].filter((post) => isWithinTimeFilter(post, timeFilter));
    items.sort((first, second) => {
      const firstDate = getPostDate(first).getTime();
      const secondDate = getPostDate(second).getTime();
      return sortOrder === 'newest' ? secondDate - firstDate : firstDate - secondDate;
    });
    return items;
  }, [data?.items, sortOrder, timeFilter]);
  const counts = data?.counts ?? {};
  const totalPages = data?.total_pages ?? 1;
  const allSelected = posts.length > 0 && posts.every((post) => selectedIds.includes(post.id));

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? posts.map((post) => post.id) : []);
  };

  const handleSelectPost = (postId, checked) => {
    setSelectedIds((current) => (checked ? [...new Set([...current, postId])] : current.filter((id) => id !== postId)));
  };

  const handleOpenBoost = (post) => {
    if (post.status !== 'approved') {
      setToast('Chỉ bài đã được duyệt mới có thể đẩy nổi bật');
      return;
    }
    setBoostTarget(post);
  };

  return (
    <div className={styles.page}>
      {toast && <div className={styles.topToast}>{toast}</div>}

      <LandlordPageHeader
        icon={List}
        title="Quản lý bài đăng"
        subtitle="Quản lý trạng thái, lượt xem và thao tác đẩy nổi bật trên bài đăng"
        actions={(
          <>
            <button className={styles.primaryBtn} onClick={() => navigate('/landlord/rooms?mode=select-for-post')}>
              <Plus size={15} />
              Thêm bài đăng
            </button>
            <button className={styles.lightBtn} onClick={refetch}>
              <RefreshCcw size={13} />
              Làm mới
            </button>
          </>
        )}
      />

      <section className={styles.searchPanel}>
        <label className={styles.searchControl}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Tìm theo tiêu đề bài viết hoặc ID (#P001)..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
      </section>

      <div className={styles.filters}>
        {STATUS_FILTERS.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`${styles.filterChip} ${status === item.value ? styles.filterActive : ''}`}
            onClick={() => {
              setStatus(item.value);
              setPage(1);
            }}
          >
            {item.label}
            <span>{counts[item.countKey] ?? 0}</span>
          </button>
        ))}
        <div className={styles.viewTools}>
          <select value={timeFilter} aria-label="Lọc ngày đăng" onChange={(event) => setTimeFilter(event.target.value)}>
            {TIME_FILTERS.map((item) => <option key={item.value || 'all'} value={item.value}>{item.label}</option>)}
          </select>
          <button
            type="button"
            className={viewMode === 'grid' ? styles.squareActive : ''}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            title="Xem dạng thẻ"
          >
            <Grid2X2 size={14} />
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? styles.squareActive : ''}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            title="Xem dạng bảng"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            className={sortOrder === 'oldest' ? styles.sortActive : ''}
            onClick={() => setSortOrder((value) => (value === 'newest' ? 'oldest' : 'newest'))}
          >
            <SlidersHorizontal size={14} />
            {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className={`${styles.tableWrap} ${isFetching ? styles.fetching : ''}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="Chọn tất cả bài đăng" checked={allSelected} onChange={(event) => handleSelectAll(event.target.checked)} />
                </th>
                <th>Bài viết</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Chỉ số</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className={styles.empty}>Đang tải danh sách bài đăng...</td></tr>
              ) : isError ? (
                <tr><td colSpan="6" className={styles.empty}>Không tải được danh sách bài đăng.</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="6" className={styles.empty}>Không có bài đăng phù hợp.</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Chọn bài ${post.title}`}
                      checked={selectedIds.includes(post.id)}
                      onChange={(event) => handleSelectPost(post.id, event.target.checked)}
                    />
                  </td>
                  <td>
                    <div className={styles.postCell}>
                      <PostThumbnail post={post} />
                      <div>
                        <strong>{post.title}</strong>
                        <span>{post.room_code || post.code}</span>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(post.publishedAt || post.created_at)}</td>
                  <td>
                    <PostStatusBadge
                      status={post.status}
                      subText={post.status === 'boosted' ? `Còn ${post.boostDaysLeft || post.boost_days_left || 0} ngày` : ''}
                    />
                  </td>
                  <td>
                    <div className={styles.inlineStats}>
                      <StatIcon icon={Eye} value={post.views} />
                      <StatIcon icon={Heart} value={post.likes} />
                      <StatIcon icon={MessageCircle} value={post.comments} />
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {post.status !== 'boosted' ? (
                        <button type="button" title="Đẩy nổi bật" onClick={() => handleOpenBoost(post)}><Flame size={13} /></button>
                      ) : (
                        <button type="button" title="Hủy nổi bật" className={styles.dangerIcon} onClick={() => setCancelBoostTarget(post)}><X size={13} /></button>
                      )}
                      <button type="button" title="Xem" onClick={() => navigate(`/landlord/posts/${post.id}`)}><Eye size={13} /></button>
                      <button type="button" title="Xóa" onClick={() => setDeleteTarget(post)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`${styles.cardGrid} ${isFetching ? styles.fetching : ''}`}>
          {isLoading ? (
            <div className={styles.empty}>Đang tải danh sách bài đăng...</div>
          ) : isError ? (
            <div className={styles.empty}>Không tải được danh sách bài đăng.</div>
          ) : posts.length === 0 ? (
            <div className={styles.empty}>Không có bài đăng phù hợp.</div>
          ) : posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onBoost={handleOpenBoost}
              onCancelBoost={setCancelBoostTarget}
              onView={(item) => navigate(`/landlord/posts/${item.id}`)}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <div className={styles.pagination}>
        <span>Hiển thị {posts.length} / {data?.total ?? 0} bài</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>‹</button>
          <button className={styles.pageActive}>{page}</button>
          <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>›</button>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa bài đăng"
        message={deleteTarget ? `Bạn có chắc muốn xóa bài đăng "${deleteTarget.title}"?` : ''}
        confirmText="Xóa bài"
        cancelText="Hủy"
        onCancel={() => setDeleteTarget(null)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deletePost({ id: deleteTarget.id }).unwrap();
          setDeleteTarget(null);
          refetch();
        }}
      />

      <BoostConfirmModal
        post={boostTarget}
        isLoading={boostState.isLoading}
        onCancel={() => setBoostTarget(null)}
        onConfirm={async () => {
          try {
            await boostPost({ id: boostTarget.id }).unwrap();
            setBoostTarget(null);
            setToast('Bài đăng đã được đẩy nổi bật');
            refetch();
          } catch (error) {
            setBoostTarget(null);
            setToast(error?.data?.detail || 'Không thể đẩy nổi bật bài đăng. Vui lòng kiểm tra gói đang sử dụng.');
          }
        }}
      />

      <ConfirmModal
        isOpen={Boolean(cancelBoostTarget)}
        title="Xác nhận hủy nổi bật"
        message={cancelBoostTarget ? `Bạn có chắc muốn hủy nổi bật bài đăng "${cancelBoostTarget.title}"?` : ''}
        confirmText="Hủy nổi bật"
        cancelText="Quay lại"
        onCancel={() => setCancelBoostTarget(null)}
        onClose={() => setCancelBoostTarget(null)}
        onConfirm={async () => {
          await cancelBoost({ id: cancelBoostTarget.id }).unwrap();
          setCancelBoostTarget(null);
          refetch();
        }}
      />
    </div>
  );
};

export default LandlordPostsPage;
