import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/slice';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useGetSavedRoomsQuery, useSavePostMutation, useUnsavePostMutation } from '../../user/api/userApi';
import { ACCOUNT_TYPES } from '../../../shared/constants/roles';
import '../Homepage.css';

const DEFAULT_ROOM_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22 viewBox=%220 0 800 600%22%3E%3Crect width=%22800%22 height=%22600%22 fill=%23f3f4f6%22/%3E%3Cpath d=%22M160 410l120-120 90 90 120-120 170 170v70H160z%22 fill=%23d1d5db%22/%3E%3Ccircle cx=%22585%22 cy=%22210%22 r=%2240%22 fill=%23e5e7eb%22/%3E%3Ctext x=%22400%22 y=%22330%22 text-anchor=%22middle%22 font-family=%22Arial,%20sans-serif%22 font-size=%2230%22 fill=%239ca3af%22%3EKhông có ảnh%3C/text%3E%3C/svg%3E';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const isTenant = currentUser?.account_type === ACCOUNT_TYPES.TENANT;
  const { data: savedRoomsData } = useGetSavedRoomsQuery(undefined, {
    skip: !isAuthenticated || !isTenant,
  });
  const [savePost, { isLoading: isSaving }] = useSavePostMutation();
  const [unsavePost, { isLoading: isUnsaving }] = useUnsavePostMutation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'alert', message: '', title: 'Thông báo' });
  const location = useLocation();

  const isSaved = savedRoomsData?.items?.some((item) => String(item.post_id) === String(room.id)) || false;

  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_ROOM_IMAGE) {
      event.currentTarget.src = DEFAULT_ROOM_IMAGE;
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.wishlist-icon')) {
      return;
    }
    navigate(`/rooms/${room.id}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!isTenant) {
      alert('Chi tai khoan khach thue moi co the luu bai dang.');
      return;
    }

    try {
      if (isSaved) {
        await unsavePost(room.id).unwrap();
      } else {
        await savePost(room.id).unwrap();
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setAlertModal({ isOpen: true, type: 'alert', message: 'Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại.', title: 'Lỗi' });
    }
  };

  return (
    <div className="room-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="room-image-container">
        <img src={room.image || DEFAULT_ROOM_IMAGE} alt={room.title} className="room-image" onError={handleImageError} />
        <div className="image-gradient"></div>

        {room.featured && (
          <div className="badge-verified">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Tin nổi bật{room.boostDaysLeft > 0 ? ` · còn ${room.boostDaysLeft} ngày` : ''}
          </div>
        )}

        <button 
          className={`wishlist-icon ${isSaved ? 'saved' : ''}`}
          onClick={handleWishlistClick}
          disabled={isSaving || isUnsaving}
          type="button"
          title={isSaved ? "Bỏ lưu bài đăng" : "Lưu bài đăng"}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={isSaved ? "#D45B13" : "none"} 
            stroke={isSaved ? "#D45B13" : "currentColor"} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <div className="price-overlay">
          <span className="price-amount">{new Intl.NumberFormat('vi-VN').format(Number(room.price) || 0)}</span>
          <span className="price-unit"> VNĐ/tháng</span>
        </div>
      </div>

      <div className="room-info">
        <div className="room-meta-top">
          <span className="room-type-tag">{(room.type || 'Phòng trọ').toUpperCase()}</span>
          <span className="time-ago">{room.timeAgo}</span>
        </div>

        <h3 className="room-title">{room.title}</h3>

        <div className="room-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>{room.ward && room.district ? `${room.ward}, ${room.district}` : (room.district || room.ward || 'Đang cập nhật vị trí')}</span>
        </div>

        <div className="room-divider"></div>

        <div className="room-tags">
          <div className="tag-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle></svg>
            <span>{Number(room.area) || 0}m²</span>
          </div>
          <div className="tag-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
            <span>{Number(room.bedrooms) || 0} Ngủ</span>
          </div>
          <div className="tag-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D45B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>{room.type || 'Phòng trọ'}</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLoginModal}
        title="Yêu cầu đăng nhập"
        message="Vui lòng đăng nhập để lưu bài viết và xem lại sau!"
        confirmText="Đăng nhập ngay"
        cancelText="Đóng"
        onConfirm={() => navigate('/login', { state: { from: location } })}
        onCancel={() => setShowLoginModal(false)}
      />

      <ConfirmModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Đóng"
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
        onCancel={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};

export default RoomCard;
