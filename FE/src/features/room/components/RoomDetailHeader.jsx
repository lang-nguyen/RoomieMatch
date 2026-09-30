const RoomDetailHeader = ({ title, breadcrumbs, address, badges, views, updatedAt }) => {
  return (
    <section className="room-detail-header">
      <div className="room-detail-breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb} className="room-detail-crumb">
            {crumb}
            {index < breadcrumbs.length - 1 && <span className="room-detail-crumb-sep">·</span>}
          </span>
        ))}
      </div>
      <h1 className="room-detail-heading">{title}</h1>
      <div className="room-detail-meta-row">
        <span className="room-detail-meta-item">📍 {address}</span>
        <span className="room-detail-pill">{badges[0]}</span>
        <span className="room-detail-pill success">{badges[1]}</span>
        <span className="room-detail-meta-item">👁 {views} lượt xem</span>
        <span className="room-detail-meta-item">🗓 Cập nhật: {updatedAt}</span>
      </div>
    </section>
  );
};

export default RoomDetailHeader;
