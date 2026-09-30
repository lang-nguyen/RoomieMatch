const RoomDetailRelated = ({ rooms, ownerName }) => {
  return (
    <section className="room-detail-section">
      <h2 className="room-detail-section-title">Tin khác của {ownerName}</h2>
      <div className="room-detail-related">
        {rooms.map((room) => (
          <div key={room.id} className="room-detail-related-card">
            <img src={room.image} alt={room.title} />
            <div className="room-detail-related-body">
              <p className="room-detail-related-price">{room.price}</p>
              <h3>{room.title}</h3>
              <p className="room-detail-related-location">📍 {room.location}</p>
              <div className="room-detail-related-tags">
                {room.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomDetailRelated;
