const RoomDetailCosts = ({ items }) => {
  return (
    <section className="room-detail-section room-detail-section-costs">
      <h2 className="room-detail-section-title">Chi phí hàng tháng</h2>
      <div className="room-detail-card">
        <div className="room-detail-costs">
          {items.map((item) => (
            <div key={item.label} className={`room-detail-cost ${item.highlight ? 'highlight' : ''}`}>
              <span className="room-detail-cost-label">{item.label}</span>
              <span className="room-detail-cost-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomDetailCosts;
