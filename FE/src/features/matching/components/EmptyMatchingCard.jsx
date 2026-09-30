import { UsersRound } from 'lucide-react';

const EmptyMatchingCard = ({ isFlipping, onReveal }) => {
  return (
    <button
      className={`empty-matching-card ${isFlipping ? 'is-flipping' : ''}`}
      type="button"
      onClick={onReveal}
      aria-label="Mở gợi ý matching"
    >
      <span className="empty-matching-shadow" />
      <span className="empty-matching-card-face">
        <UsersRound size={96} strokeWidth={1.8} />
      </span>
    </button>
  );
};

export default EmptyMatchingCard;
