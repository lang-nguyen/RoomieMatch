import { useState } from 'react';

const ContactFaq = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="contact-faq">
      <h4>
        <span className="contact-faq-icon">❓</span>
        Câu hỏi thường gặp
      </h4>
      {items.map((item, index) => (
        <div
          key={item.question}
          className={`contact-faq-item ${openIndex === index ? 'open' : ''}`}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <div className="contact-faq-question">
            {item.question}
            <span className="contact-faq-arrow">⌄</span>
          </div>
          <div className="contact-faq-answer">{item.answer}</div>
        </div>
      ))}
    </div>
  );
};

export default ContactFaq;
