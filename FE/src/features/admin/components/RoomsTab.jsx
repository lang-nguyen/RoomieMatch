import { useMemo, useState, useEffect } from 'react';
import { useGetRoomsQuery, useUpdateRoomStatusMutation } from '../api/adminApi';
import { AdminIcon } from './adminIconMap';
import { formatNumber, normalizeText, paginate, toArray } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'available', label: 'Trống' },
  { value: 'rented', label: 'Đang thuê' },
  { value: 'archived', label: 'Tạm ngưng' },
];

const roomTypeOptions = [
  { value: '', label: 'Tất cả loại phòng' },
  { value: 'phong_don', label: 'Phòng đơn' },
  { value: 'ghep', label: 'Ở ghép' },
  { value: 'can_ho', label: 'Căn hộ' },
];

export const RoomsTab = ({ initialArea, onInitialAreaHandled }) => {
  const [area, setArea] = useState(initialArea || '');
  const [roomType, setRoomType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingRoom, setViewingRoom] = useState(null);
  const { data: roomsResponse = [], isLoading, refetch } = useGetRoomsQuery({ area, roomType, status });
  const { data: allRoomsResponse = [] } = useGetRoomsQuery({});
  const [updateRoomStatus] = useUpdateRoomStatusMutation();

  useEffect(() => {
    if (initialArea) {
      setArea(initialArea);
      if (onInitialAreaHandled) onInitialAreaHandled();
    }
  }, [initialArea, onInitialAreaHandled]);
  const rooms = useMemo(() => toArray(roomsResponse), [roomsResponse]);
  const allRooms = useMemo(() => toArray(allRoomsResponse), [allRoomsResponse]);

  const filteredRooms = useMemo(() => {
    const keyword = normalizeText(search);
    if (!keyword) return rooms;

    return rooms.filter((room) =>
      [room.id, room.area, room.owner, room.roomTypeLabel, room.statusLabel].some((value) => normalizeText(value).includes(keyword))
    );
  }, [rooms, search]);
  const paged = paginate(filteredRooms, page, 6);

  const areas = useMemo(
    () => [...new Set(allRooms.map((room) => String(room.area || '').split(',').at(-1)?.trim()).filter(Boolean))],
    [allRooms]
  );

  const stats = useMemo(
    () => [
      { label: 'Tổng phòng', value: allRooms.reduce((sum, room) => sum + (room.totalRooms || 0), 0), icon: 'building' },
      { label: 'Đang trống', value: allRooms.filter((room) => room.status === 'available').length, icon: 'check' },
      { label: 'Đang thuê', value: allRooms.filter((room) => room.status === 'rented').length, icon: 'users' },
      { label: 'Tạm ngưng', value: allRooms.filter((room) => room.status === 'archived').length, icon: 'activity' },
    ],
    [allRooms]
  );

  const statusCounts = useMemo(
    () =>
      statusOptions.reduce((counts, option) => {
        counts[option.value || 'all'] = option.value ? allRooms.filter((room) => room.status === option.value).length : allRooms.length;
        return counts;
      }, {}),
    [allRooms]
  );

  const handleStatus = async (id, nextStatus) => {
    await updateRoomStatus({ id, status: nextStatus });
    refetch();
  };

  return (
    <div className={styles.featureStack}>
      <section className={styles.featureStatsGrid}>
        {stats.map((item) => (
          <article key={item.label} className={styles.featureStatCard}>
            <span className={styles.featureStatIcon}>
              <AdminIcon name={item.icon} size={18} />
            </span>
            <div>
              <p>{item.label}</p>
              <strong>{formatNumber(item.value)}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.featurePanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Quản lý phòng trọ</h2>
            <p>Lọc theo khu vực, loại phòng và trạng thái vận hành</p>
          </div>
        </div>

        <div className={`${styles.toolbar} ${styles.roomToolbar}`}>
          <label className={`${styles.controlWithIcon} ${styles.roomSearchControl}`}>
            <AdminIcon name="search" size={15} />
            <input
              type="search"
              placeholder="Tìm khu vực, chủ phòng hoặc mã phòng..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <select
            value={status}
            aria-label="Lọc trạng thái"
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label} ({formatNumber(statusCounts[option.value || 'all'] || 0)})
              </option>
            ))}
          </select>

          <select
            value={area}
            aria-label="Lọc khu vực"
            onChange={(event) => {
              setArea(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả khu vực</option>
            {areas.map((areaName) => (
              <option key={areaName} value={areaName}>
                {areaName}
              </option>
            ))}
          </select>

          <select
            value={roomType}
            aria-label="Lọc loại phòng"
            onChange={(event) => {
              setRoomType(event.target.value);
              setPage(1);
            }}
          >
            {roomTypeOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableScroller}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Phòng trọ</th>
                <th>Khu vực</th>
                <th style={{ width: '200px' }}>Chủ phòng</th>
                <th>Trạng thái</th>
                <th>Sức chứa</th>
                <th>Loại phòng</th>
                <th>Tổng phòng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7">Đang tải phòng trọ...</td>
                </tr>
              ) : (
                paged.items.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <strong>{room.name || room.title || 'Phòng chưa có tên'}</strong>
                      <div className={styles.subText}>{room.id}</div>
                    </td>
                    <td>
                      <strong>{String(room.area || '').split(',').pop().trim()}</strong>
                    </td>
                    <td>{room.owner}</td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.dataBadge} ${styles.statusFilterBadge} ${
                          room.status === 'available'
                            ? styles.badgeSuccess
                            : room.status === 'archived'
                                ? styles.badgeDanger
                                : styles.badgeInfo
                        }`}
                        title="Lọc theo trạng thái này"
                        onClick={() => {
                          setStatus(room.status);
                          setPage(1);
                        }}
                      >
                        {room.statusLabel}
                      </button>
                    </td>
                    <td>{room.capacity} người</td>
                    <td>{room.roomTypeLabel}</td>
                    <td>
                      <span className={styles.metricInline} style={{ borderBottom: 'none' }}>{room.totalRooms} phòng</span>
                      <div className={styles.scoreBar} title="Quy mô cụm phòng">
                        <span style={{ width: `${Math.min(100, room.totalRooms * 14)}%` }} />
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.actionButton} title="Xem chi tiết" onClick={() => setViewingRoom(room)}>
                          <AdminIcon name="eye" size={14} />
                        </button>
                        {room.status === 'archived' ? (
                          <button type="button" className={styles.actionButton} title="Cho hiển thị" onClick={() => handleStatus(room.id, 'available')}>
                            <AdminIcon name="check" size={14} />
                          </button>
                        ) : (
                          <button type="button" className={styles.actionButton} title="Tạm ngưng" onClick={() => handleStatus(room.id, 'archived')}>
                            <AdminIcon name="x-circle" size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationWrap}>
          <span>
            Trang {paged.page}/{paged.totalPages}
          </span>
          <div>
            <button type="button" disabled={paged.page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Trước
            </button>
            <button
              type="button"
              disabled={paged.page === paged.totalPages}
              onClick={() => setPage((value) => Math.min(paged.totalPages, value + 1))}
            >
              Sau
            </button>
          </div>
        </div>
      </section>

      {viewingRoom && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setViewingRoom(null)}>
          <section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Chi tiết phòng trọ</h2>
                <p>Mã phòng: {viewingRoom.id}</p>
              </div>
              <button type="button" className={styles.actionButton} onClick={() => setViewingRoom(null)}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <article className={styles.formWide}>
                <span>Tên phòng</span>
                <strong>{viewingRoom.name || viewingRoom.title || 'Phòng chưa có tên'}</strong>
              </article>
              <article>
                <span>Chủ phòng</span>
                <strong>{viewingRoom.owner}</strong>
              </article>
              <article>
                <span>Khu vực</span>
                <strong>{viewingRoom.area}</strong>
              </article>
              <article>
                <span>Loại phòng</span>
                <strong>{viewingRoom.roomTypeLabel}</strong>
              </article>
              <article>
                <span>Sức chứa</span>
                <strong>{viewingRoom.capacity} người</strong>
              </article>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
