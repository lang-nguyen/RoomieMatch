import { CheckCircle2, Clock3, Flame, XCircle } from 'lucide-react';
import styles from './PostStatusBadge.module.css';

const CONFIG = {
  pending: { label: 'Chờ duyệt', icon: Clock3 },
  approved: { label: 'Đã duyệt', icon: CheckCircle2 },
  boosted: { label: 'Đang nổi bật', icon: Flame },
  rejected: { label: 'Từ chối', icon: XCircle },
  closed: { label: 'Đã đóng', icon: XCircle },
};

const PostStatusBadge = ({ status, subText }) => {
  const config = CONFIG[status] || CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className={styles.wrap}>
      <span className={`${styles.badge} ${styles[status] || styles.pending}`}>
        <Icon size={12} />
        {config.label}
      </span>
      {subText ? <span className={styles.sub}>{subText}</span> : null}
    </div>
  );
};

export default PostStatusBadge;
