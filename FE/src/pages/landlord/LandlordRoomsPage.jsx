import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Info, Plus, Search } from 'lucide-react';
import { useLandlordRooms } from '../../features/landlord/hooks/useLandlordRooms';
import { useGetPublicCategoriesQuery } from '../../features/landlord/api/landlordApi';
import LandlordRoomCard from '../../features/landlord/components/LandlordRoomCard';
import LandlordPageHeader from '../../features/landlord/components/LandlordPageHeader';
import ConfirmModal from '../../shared/components/ConfirmModal';
import styles from './LandlordRoomsPage.module.css';
import sharedStyles from './LandlordPageShared.module.css';

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'available', label: 'Trống' },
  { value: 'rented', label: 'Đã thuê' },
  { value: 'negotiating', label: 'Đang thương lượng' },
];

const getArea = (room) =>
  room.district || room.city || String(room.full_address || room.address || '').split(',').at(-2)?.trim() || '';

const getRoomType = (room) => room.room_type || room.roomType || '';

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonThumb} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} style={{ width: '60%' }} />
      <div className={styles.skeletonLine} style={{ width: '40%' }} />
    </div>
  </div>
);

const LandlordRoomsPage = () => {
  const navigate = useNavigate();
  const [roomToDelete, setRoomToDelete] = useState(null);
  const { data: categories } = useGetPublicCategoriesQuery();
  const {
    rooms,
    total,
    totalPages,
    currentPage,
    filters,
    isLoading,
    isFetching,
    handleSearchChange,
    handleStatusChange,
    handleFilterChange,
    handlePageChange,
    handleDelete,
  } = useLandlordRooms();
  const [searchParams] = useSearchParams();
  const isSelectForPostMode = searchParams.get('mode') === 'select-for-post';

  const areas = useMemo(() => [...new Set(rooms.map(getArea).filter(Boolean))], [rooms]);

  const roomTypes = useMemo(() => {
    const apiTypes = categories?.room_types?.map((item) => item.name) || [];
    const dataTypes = rooms.map(getRoomType).filter(Boolean);
    return [...new Set([...apiTypes, ...dataTypes])];
  }, [categories, rooms]);

  const statusCountByValue = useMemo(
    () =>
      STATUS_FILTERS.reduce((accumulator, option) => {
        accumulator[option.value || 'all'] = option.value
          ? rooms.filter((room) => room.status === option.value).length
          : rooms.length;
        return accumulator;
      }, {}),
    [rooms],
  );

  const visibleRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesArea = !filters.area || getArea(room) === filters.area;
        const matchesType = !filters.roomType || getRoomType(room) === filters.roomType;
        return matchesArea && matchesType;
      }),
    [filters.area, filters.roomType, rooms],
  );

  const handleTogglePost = (room) => {
    navigate(`/landlord/posts/create?roomId=${room.id}`);
  };

  return (
    <div className={`${sharedStyles.page} ${styles.page}`}>
      <div className={styles.stickyTools}>
        <LandlordPageHeader
          icon={Home}
          title="Danh sách trọ"
          subtitle={`Quản lý phòng trọ, trạng thái thuê và thông tin hiển thị - ${total} phòng`}
          actions={(
            <button className={styles.addBtn} onClick={() => navigate('/landlord/rooms/add')}>
              <Plus size={16} />
              Thêm trọ mới
            </button>
          )}
        />

        <section className={styles.filterPanel}>
          <div className={styles.roomToolbar}>
            <label className={styles.searchControl}>
              <Search size={16} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Tìm khu vực, tên trọ hoặc mã phòng..."
                value={filters.search}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </label>

            <select value={filters.status} aria-label="Lọc trạng thái" onChange={(event) => handleStatusChange(event.target.value)}>
              {STATUS_FILTERS.map((item) => (
                <option key={item.value || 'all'} value={item.value}>
                  {item.label} ({statusCountByValue[item.value || 'all'] || 0})
                </option>
              ))}
            </select>

            <select value={filters.area} aria-label="Lọc khu vực" onChange={(event) => handleFilterChange({ area: event.target.value })}>
              <option value="">Tất cả khu vực</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select value={filters.roomType} aria-label="Lọc loại phòng" onChange={(event) => handleFilterChange({ roomType: event.target.value })}>
              <option value="">Tất cả loại phòng</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      {isSelectForPostMode && (
        <div className={styles.infoNotice}>
          <Info size={18} />
          <span>Chọn biểu tượng ghim bài trên phòng trọ bạn muốn dùng để đăng bài.</span>
        </div>
      )}

      <div className={`${styles.grid} ${isFetching ? styles.gridFetching : ''}`}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
        ) : visibleRooms.length ? (
          visibleRooms.map((room) => (
            <LandlordRoomCard
              key={room.id}
              room={room}
              onView={(item) => navigate(`/landlord/rooms/${item.id}`)}
              onEdit={(item) => navigate(`/landlord/rooms/${item.id}/edit`)}
              onDelete={(item) => setRoomToDelete(item)}
              onTogglePost={handleTogglePost}
            />
          ))
        ) : (
          <div className={styles.emptyState}>Không tìm thấy phòng trọ phù hợp.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>
            Trước
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.pageBtnActive : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Sau
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(roomToDelete)}
        title="Xác nhận xóa phòng trọ"
        message={roomToDelete ? `Bạn có chắc muốn xóa phòng "${roomToDelete.name || roomToDelete.title}"?` : ''}
        confirmText="Xóa phòng"
        cancelText="Hủy"
        onCancel={() => setRoomToDelete(null)}
        onClose={() => setRoomToDelete(null)}
        onConfirm={async () => {
          await handleDelete(roomToDelete.id);
          setRoomToDelete(null);
        }}
      />
    </div>
  );
};

export default LandlordRoomsPage;
