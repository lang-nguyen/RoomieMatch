import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/auth/slice';
import { Heart, Eye, Trash2 } from 'lucide-react';
import { useUnsavePostMutation } from '../../features/user';
import ConfirmModal from './ConfirmModal';
import styles from './RoomCard.module.css';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const { title, image, area, status } = room;
  const postId = room.post_id || room.id;
  
  const address = room.address || room.full_address || 'Đang cập nhật';
  const isAvailable = status === 'Còn trống' || status === 'active';

  let dateSaved = room.dateSaved;
  if (!dateSaved && room.saved_at) {
    const d = new Date(room.saved_at);
    if (!Number.isNaN(d.getTime())) {
      dateSaved = d.toLocaleDateString('vi-VN');
    }
  }
  if (!dateSaved) dateSaved = 'Đang cập nhật';

  const handleViewDetails = () => {
    navigate(`/rooms/${postId}`);
  };

  const handleUnsave = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmUnsave = async () => {
    setShowConfirmModal(false);
    try {
      await unsavePost(postId).unwrap();
    } catch (err) {
      console.error('Error unsaving post:', err);
      setErrorModal({ isOpen: true, message: 'Đã xảy ra lỗi khi bỏ lưu bài viết.' });
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img 
          src={image || 'https://placehold.co/600x400?text=No+Image'} 
          alt={title} 
          className={styles.image} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/600x400?text=No+Image';
          }}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.details}>
          <div className={`${styles.detailItem} ${styles.address}`}>
            Địa chỉ: {address}
          </div>
          <div className={styles.detailItem}>
            Ngày lưu: {dateSaved}
          </div>
          <div className={styles.detailItem}>
            {area || 0} m²
          </div>
        </div>

        <div className={`${styles.statusTag} ${isAvailable ? styles.statusAvailable : styles.statusRented}`}>
          {isAvailable ? 'Còn trống' : 'Đã thuê'}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleViewDetails}>
          <Heart className={styles.btnIcon} />
          Quan tâm
        </button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleViewDetails}>
          <Eye className={styles.btnIcon} />
          Xem chi tiết
        </button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleUnsave} disabled={isUnsaving}>
          <Trash2 className={styles.btnIcon} />
          Bỏ lưu
        </button>
      </div>

      <ConfirmModal
        isOpen={showLoginModal}
        title="Yêu cầu đăng nhập"
        message="Vui lòng đăng nhập để thực hiện chức năng này!"
        confirmText="Đăng nhập ngay"
        cancelText="Đóng"
        onConfirm={() => navigate('/login', { state: { from: location } })}
        onCancel={() => setShowLoginModal(false)}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Bỏ lưu phòng trọ"
        message="Bạn có chắc chắn muốn bỏ lưu phòng trọ này không?"
        confirmText="Đồng ý"
        cancelText="Hủy"
        onConfirm={confirmUnsave}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmModal
        isOpen={errorModal.isOpen}
        title="Thông báo"
        message={errorModal.message}
        confirmText="Đóng"
        type="alert"
        onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
        onCancel={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default RoomCard;
