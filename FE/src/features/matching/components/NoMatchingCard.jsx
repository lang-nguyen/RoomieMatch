import { UserX } from 'lucide-react';

const NoMatchingCard = () => {
  return (
    <article className="no-matching-card matching-panel-pop">
      <div className="no-matching-icon">
        <UserX size={52} />
      </div>
      <h2>Không có người phù hợp</h2>
      <p>Bạn có thể quay lại sau hoặc chỉnh sửa hồ sơ để AI gợi ý tốt hơn.</p>
    </article>
  );
};

export default NoMatchingCard;
