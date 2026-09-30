const RoomDetailInfo = ({ room }) => {
  return (
    <div className="room-detail-info">
      <div className="room-detail-price">
        {new Intl.NumberFormat('vi-VN').format(room.price)} đ/tháng
      </div>
      <h1 className="room-detail-title">{room.title}</h1>
      <p className="room-detail-location">
        {room.ward}, {room.district}, {room.city}
      </p>

      <div className="room-detail-tags">
        <span>{room.area} m²</span>
        <span>{room.bedrooms} phòng ngủ</span>
        <span>{room.type}</span>
      </div>

      <div className="room-detail-meta">
        <span>Thời gian đăng: {room.timeAgo}</span>
      </div>

      <div className="room-detail-actions">
        <button type="button" className="room-detail-button">Nhắn tin chủ phòng</button>
        <button type="button" className="room-detail-button ghost">Gọi điện</button>
      </div>
    </div>
  );
};

export default RoomDetailInfo;
