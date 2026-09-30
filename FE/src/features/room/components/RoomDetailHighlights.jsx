const RoomDetailHighlights = ({ items }) => {
  return (
    <section className="room-detail-highlights">
      {items.map((item) => (
        <div key={item.label} className="room-detail-highlight">
          <p className="room-detail-highlight-label">{item.label}</p>
          <p className="room-detail-highlight-value">{item.value}</p>
        </div>
      ))}
    </section>
  );
};

export default RoomDetailHighlights;
