import RoomCard from '../../homepage/components/RoomCard';
import RoomPagination from './RoomPagination';

const RoomList = ({
  rooms,
  totalRooms,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}) => {
  return (
    <section className="room-list">
      <div className="room-list-header">
        <div>
          <h2 className="room-section-title">Danh sách phòng</h2>
          <p className="room-section-subtitle">Kết quả phù hợp với tìm kiếm của bạn</p>
        </div>
        <div className="room-list-count">{totalRooms} phòng</div>
      </div>

      {isLoading ? (
        <div className="room-list-state">Đang tải danh sách phòng...</div>
      ) : rooms.length === 0 ? (
        <div className="room-list-state">Không tìm thấy phòng phù hợp.</div>
      ) : (
        <div className="rooms-grid room-page-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <RoomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
};

export default RoomList;
