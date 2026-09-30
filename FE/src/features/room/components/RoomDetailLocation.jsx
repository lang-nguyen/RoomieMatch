const RoomDetailLocation = ({ address, coords }) => {
  return (
    <section className="room-detail-section room-detail-section-location">
      <h2 className="room-detail-section-title">Vị trí</h2>
      <div className="room-detail-map">
        <div className="room-detail-map-address-chip">{address}</div>
        <div className="room-detail-map-pin">📍</div>
        <p className="room-detail-map-coords">{coords}</p>
      </div>
    </section>
  );
};

export default RoomDetailLocation;
