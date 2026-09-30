const RoomDetailDescription = ({ text }) => {
  return (
    <section className="room-detail-section">
      <h2 className="room-detail-section-title">Mô tả</h2>
      <div className="room-detail-card">
        <p className="room-detail-text">{text}</p>
      </div>
    </section>
  );
};

export default RoomDetailDescription;
