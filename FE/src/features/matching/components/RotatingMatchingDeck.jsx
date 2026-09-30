import { UsersRound } from 'lucide-react';

const deckColors = [
  '255, 154, 117',
  '255, 190, 142',
  '252, 142, 142',
  '252, 142, 204',
  '204, 142, 252',
  '142, 202, 252',
];

const RotatingMatchingDeck = ({ users, isSelecting, onSelect }) => {
  const visibleCards = Array.from({ length: 10 });

  return (
    <section className={`matching-roulette ${isSelecting ? 'is-selecting' : ''}`} aria-label="Vòng xoay matching">
      <p>Chọn một thẻ để AI Matching gợi ý bạn ở phù hợp</p>
      <div className="matching-roulette-inner" style={{ '--quantity': visibleCards.length }}>
        {visibleCards.map((_, index) => (
          <button
            key={`matching-hidden-card-${index}`}
            className="matching-roulette-card"
            style={{
              '--index': index,
              '--color-card': deckColors[index % deckColors.length],
            }}
            type="button"
            aria-label="Lật thẻ matching"
            onClick={() => onSelect(users.length ? index % users.length : 0)}
          >
            <span className="matching-roulette-card-bg">
              <UsersRound size={42} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default RotatingMatchingDeck;
