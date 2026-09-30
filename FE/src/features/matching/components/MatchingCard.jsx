import { CircleCheck, MapPin, X } from 'lucide-react';

const MatchingCard = ({ user, isSkipping, onSkip, onShowContact }) => {
  if (!user) return null;

  return (
    <article className={`matching-user-card ${isSkipping ? 'is-skipping' : ''}`}>
      <div className="matching-card-deck">
        <div className="matching-user-card-inner">
          <img className="matching-user-image" src={user.avatar || user.avatar_url} alt={user.name || user.full_name} />

          <div className="matching-user-body">
            <h2>{user.name || user.full_name}</h2>
            {user.area && (
              <p className="matching-user-location">
                <MapPin size={15} />
                {user.area}
              </p>
            )}
            {user.description && <p className="matching-user-description">{user.description}</p>}

            {user.matched_criteria && user.matched_criteria.length > 0 && (
              <div className="matching-user-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <strong style={{ fontSize: '12px', marginBottom: '4px' }}>Tiêu chí phù hợp:</strong>
                {user.matched_criteria.map((item, idx) => (
                  <span key={idx} style={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                    <CircleCheck size={14} style={{ marginRight: '6px' }} />
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="matching-user-actions">
              <button className="matching-skip-button" type="button" onClick={onSkip} aria-label="Bỏ qua">
                <X size={20} />
              </button>
              <button className="matching-contact-button" type="button" onClick={onShowContact}>
                Xem thông tin liên hệ
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="matching-block-button" type="button" onClick={onSkip}>
        Chặn người này
      </button>
    </article>
  );
};

export default MatchingCard;
