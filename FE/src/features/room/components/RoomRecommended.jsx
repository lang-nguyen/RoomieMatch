import { Link } from 'react-router-dom';

const RoomRecommended = ({ rooms }) => {
  return (
    <section className="room-recommended">
      <div className="room-section-header">
        <p className="room-section-kicker">TIN NỔI BẬT</p>
        <h2 className="room-section-title">Được đề xuất hôm nay</h2>
      </div>

      <div className="room-recommended-grid">
        {rooms.map((room, index) => (
          <Link
            key={room.id}
            to={`/rooms/${room.id}`}
            className={`room-recommended-card room-recommended-link ${index === 0 ? 'large' : ''}`}
          >
            <img src={room.image} alt={room.title} className="room-recommended-image" />
            <div className="room-recommended-overlay">
              <div className="room-recommended-badge">MỚI</div>
              <h3 className="room-recommended-title">{room.title}</h3>
              <div className="room-recommended-meta">
                <span>{new Intl.NumberFormat('vi-VN').format(room.price)} đ/tháng</span>
                <span> · {room.area}m²</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RoomRecommended;
