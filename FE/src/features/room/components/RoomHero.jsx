const RoomHero = ({ location, title, emphasis, subtitle, stats }) => {
  return (
    <section className="room-hero">
      <div className="room-hero-content">
        <p className="room-hero-location">{location}</p>
        <h1 className="room-hero-title">
          {title} <span className="room-hero-emphasis">{emphasis}</span>
          <br />
          sống của bạn
        </h1>
        <p className="room-hero-subtitle">{subtitle}</p>
      </div>

      <div className="room-hero-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="room-hero-stat">
            <div className="room-hero-stat-value">{stat.value}</div>
            <div className="room-hero-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomHero;
