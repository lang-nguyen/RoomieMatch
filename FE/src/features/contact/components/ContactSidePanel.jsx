import ContactFaq from './ContactFaq';

const ContactSidePanel = ({ supportInfo, faq }) => {
  return (
    <aside className="contact-side">
      <div className="contact-info-card">
        <div className="contact-info-header">
          <h3>{supportInfo.title}</h3>
          <p>{supportInfo.subtitle}</p>
        </div>
        <div className="contact-info-body">
          {supportInfo.rows.map((row) => (
            <div key={row.title} className="contact-info-row">
              <div className="contact-info-icon">{row.icon}</div>
              <div className="contact-info-text">
                <strong>{row.title}</strong>
                <span>{row.content}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContactFaq items={faq} />
    </aside>
  );
};

export default ContactSidePanel;
