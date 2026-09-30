import { Check } from 'lucide-react';

const MatchingSuccessCard = ({ onStart }) => {
  return (
    <section className="matching-success-card">
      <div className="matching-success-icon">
        <Check size={38} />
      </div>
      <h2>Thành công</h2>
      <p>
        Chào mừng bạn đến với <span>Matching AI</span>
      </p>
      <button type="button" onClick={onStart}>
        Bắt đầu Matching
      </button>
    </section>
  );
};

export default MatchingSuccessCard;
