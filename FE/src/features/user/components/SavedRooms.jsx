import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import RoomCard from '../../../shared/components/RoomCard';
import { useGetSavedRoomsQuery } from '../api/userApi';
import styles from './SavedRooms.module.css';

const SavedRooms = () => {
  const { data, isLoading, isError } = useGetSavedRoomsQuery();
  const rooms = data?.items || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredRooms = useMemo(() => {
    let result = [...rooms];
    if (searchTerm) {
      result = result.filter(room => (room.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    const getTimestamp = (r) => new Date(r.created_at || r.createdAt || r.saved_at || 0).getTime();
    
    if (sortOrder === 'newest') {
      result.sort((a, b) => getTimestamp(b) - getTimestamp(a));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => getTimestamp(a) - getTimestamp(b));
    }
    return result;
  }, [rooms, searchTerm, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Danh sách phòng đã lưu</h1>
      </div>

      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className={styles.filterSelect} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {isLoading ? (
        <div>Đang tải danh sách phòng...</div>
      ) : isError ? (
        <div>Đã có lỗi xảy ra khi tải dữ liệu.</div>
      ) : (
        <div className={styles.roomsList}>
          {filteredRooms.map(room => {
            const FALLBACK_IMAGE = room.thumbnail || room.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
            return (
              <RoomCard
                key={room.post_id || room.id}
                room={{
                  ...room,
                  image: FALLBACK_IMAGE
                }}
              />
            );
          })}
          {filteredRooms.length === 0 && <div>Không tìm thấy phòng nào phù hợp.</div>}
        </div>
      )}
    </div>
  );
};

export default SavedRooms;
