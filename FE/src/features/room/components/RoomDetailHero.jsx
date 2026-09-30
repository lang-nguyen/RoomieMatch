const RoomDetailHero = ({ image, title, verified }) => {
  return (
    <div className="room-detail-hero">
      <img src={image} alt={title} className="room-detail-image" />
      {verified && <div className="room-detail-badge">Đã xác minh</div>}
    </div>
  );
};

export default RoomDetailHero;
