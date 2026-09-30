const ContactHero = ({ stats }) => {
  return (
    <section className="contact-hero">
      <div className="contact-hero-main">
        <div className="contact-hero-eyebrow">
          <span className="dot" /> Hỗ trợ khách hàng
        </div>
        <h1 className="contact-hero-title">
          Liên hệ với
          <br />
          <em>đội ngũ chúng tôi</em>
        </h1>
        <p className="contact-hero-subtitle">
          Chúng tôi luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề bạn gặp phải —
          từ tìm phòng trọ đến kết nối bạn ở ghép.
        </p>
      </div>
      <div className="contact-hero-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="contact-stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactHero;
