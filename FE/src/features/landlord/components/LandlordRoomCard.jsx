import { Edit3, Eye, FilePlus2, Maximize2, Tag, Trash2, Users } from 'lucide-react';
import StatusBadge from '../../../shared/components/StatusBadge';
import styles from './LandlordRoomCard.module.css';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #f4a261, #e76f51)',
  'linear-gradient(135deg, #43aa8b, #277da1)',
  'linear-gradient(135deg, #577590, #4d908e)',
  'linear-gradient(135deg, #f8961e, #f3722c)',
  'linear-gradient(135deg, #f94144, #f3722c)',
];

const getGradient = (id) => CARD_GRADIENTS[(Number(id) - 1 || 0) % CARD_GRADIENTS.length];

const LandlordRoomCard = ({ room, onView, onEdit, onDelete, onTogglePost }) => {
  const {
    id,
    code,
    room_code,
    name,
    title,
    address,
    full_address,
    area,
    capacity,
    max_people,
    amenities = [],
    price,
    status,
    images = [],
  } = room;

  const displayCode = room_code || code || `TRO-${String(id).padStart(6, '0')}`;
  const displayName = name || title || 'Phòng trọ';
  const displayAddress = address || full_address || 'Đang cập nhật địa chỉ';
  const displayCapacity = capacity || max_people || 1;
  const displayPrice = Number(price) || 0;
  const hasThumbnail = images.length > 0;
  const visibleAmenities = amenities.slice(0, 3);
  const restAmenities = Math.max(0, amenities.length - visibleAmenities.length);

  return (
    <article className={styles.card}>
      <div className={styles.thumbnail} style={{ background: hasThumbnail ? undefined : getGradient(id) }}>
        {hasThumbnail ? (
          <img src={images[0]} alt={displayName} className={styles.thumbnailImg} />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Maximize2 size={32} color="rgba(255,255,255,0.5)" />
          </div>
        )}

        <span className={styles.codeBadge}>{displayCode}</span>
        <span className={styles.statusBadgeWrapper}>
          <StatusBadge status={status} />
        </span>
      </div>

      <div className={styles.info}>
        <h3 className={styles.name} title={displayName}>{displayName}</h3>
        <p className={styles.address}>{displayAddress}</p>

        <div className={styles.chipRows}>
          <div className={styles.chips}>
            <span className={styles.chip}>
              <Maximize2 size={11} />
              {Number(area) || 0} m²
            </span>
            <span className={styles.chip}>
              <Users size={11} />
              {displayCapacity} người
            </span>
          </div>

          <div className={styles.chips}>
            {visibleAmenities.map((amenity) => (
              <span key={amenity} className={styles.chip}>
                <Tag size={11} />
                {amenity}
              </span>
            ))}
            {restAmenities > 0 ? <span className={styles.chip}>+{restAmenities} tiện ích</span> : null}
          </div>
        </div>

        <div className={styles.price}>
          {displayPrice.toLocaleString('vi-VN')} đ
          <span className={styles.priceUnit}>/ tháng</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton} onClick={() => onView?.(room)} title="Xem chi tiết" aria-label="Xem chi tiết">
          <Eye size={15} />
        </button>
        <button className={styles.iconButton} onClick={() => onEdit?.(room)} title="Sửa phòng" aria-label="Sửa phòng">
          <Edit3 size={15} />
        </button>
        {onDelete ? (
          <button className={`${styles.iconButton} ${styles.dangerButton}`} onClick={() => onDelete?.(room)} title="Xóa phòng" aria-label="Xóa phòng">
            <Trash2 size={15} />
          </button>
        ) : null}
        <button className={`${styles.iconButton} ${styles.postButton}`} onClick={() => onTogglePost?.(room)} title="Dùng cho bài" aria-label="Dùng cho bài">
          <FilePlus2 size={15} />
          <span>Dùng cho bài</span>
        </button>
      </div>
    </article>
  );
};

export default LandlordRoomCard;
