import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { selectIsAuthenticated } from '../../auth/slice';
import { useCreateRentalRequestMutation, useGetSavedRoomsQuery, useRevealPostContactMutation, useSavePostMutation, useUnsavePostMutation } from '../../user/api/userApi';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const RoomDetailSidebar = ({ price, deposit, owner, reference, roomId, postId, postStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showRentalRequest, setShowRentalRequest] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [rentalForm, setRentalForm] = useState({ startDate: new Date().toISOString().slice(0, 10), note: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', title: 'Thông báo' });
  const { data: savedRoomsData } = useGetSavedRoomsQuery(undefined, { skip: !isAuthenticated });
  const [savePost, saveState] = useSavePostMutation();
  const [unsavePost, unsaveState] = useUnsavePostMutation();
  const [revealContact, revealState] = useRevealPostContactMutation();
  const [createRentalRequest, requestState] = useCreateRentalRequestMutation();
  const isSaved = savedRoomsData?.items?.some((item) => String(item.post_id) === String(postId)) || false;

  const requireAuth = (callback) => (isAuthenticated ? callback() : setShowLoginModal(true));
  const showError = (error, fallback) => setAlertModal({ isOpen: true, title: 'Thông báo', message: error?.data?.detail || fallback });

  const handleSave = async () => {
    try {
      await (isSaved ? unsavePost(postId) : savePost(postId)).unwrap();
    } catch (error) {
      showError(error, 'Không thể cập nhật danh sách đã lưu.');
    }
  };

  const handleContact = async () => {
    try {
      setContactData(await revealContact({ postId }).unwrap());
      setShowContact(true);
    } catch (error) {
      showError(error, 'Không thể mở thông tin liên hệ.');
    }
  };

  const handleRentalSubmit = async (event) => {
    event.preventDefault();
    try {
      await createRentalRequest({ postId, startDate: rentalForm.startDate, note: rentalForm.note }).unwrap();
      setShowRentalRequest(false);
      showError(null, 'Đã gửi xác nhận thuê cho chủ trọ.');
    } catch (error) {
      showError(error, 'Không thể gửi xác nhận thuê.');
    }
  };

  return (
    <aside className="room-detail-sidebar">
      <div className="room-detail-sidebar-card dark">
        <p className="room-detail-sidebar-label">Giá thuê hàng tháng</p>
        <p className="room-detail-sidebar-price">{price}</p>
        <p className="room-detail-sidebar-note">Tiền cọc: {deposit}</p>
      </div>

      <div className="room-detail-sidebar-actions">
        <button type="button" className="room-detail-action primary" disabled={revealState.isLoading} onClick={() => requireAuth(handleContact)}>
          {revealState.isLoading ? 'Đang tải...' : 'Xem liên hệ'}
        </button>
        <button
          type="button"
          className="room-detail-action primary"
          onClick={() => requireAuth(() => setShowRentalRequest(true))}
          disabled={postStatus !== 'active'}
          style={postStatus !== 'active' ? { opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#94a3b8' } : {}}
        >
          {postStatus !== 'active' ? 'Tin đã đóng / đã thuê' : 'Xác nhận đang thuê'}
        </button>
        <button type="button" className="room-detail-action ghost" disabled={saveState.isLoading || unsaveState.isLoading} onClick={() => requireAuth(handleSave)}>
          {isSaved ? 'Đã lưu' : 'Lưu'}
        </button>
      </div>

      <div className="room-detail-sidebar-card">
        <div className="room-detail-owner">
          <div className="room-detail-owner-avatar">{owner.initials}</div>
          <div className="room-detail-owner-info">
            <p className="room-detail-owner-name">{owner.name}</p>
            <p className="room-detail-owner-role">{owner.role}</p>
          </div>
        </div>
        <div className="room-detail-owner-note">“{owner.note}”</div>
      </div>

      <div className="room-detail-sidebar-card">
        <h3 className="room-detail-sidebar-title">Thông tin tham khảo</h3>
        <div className="room-detail-reference">
          {reference.map((item) => (
            <div key={item.label} className="room-detail-reference-item">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {showContact && contactData && createPortal(
        <div className="modal-overlay" onClick={() => setShowContact(false)}>
          <div
            className="contact-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="contact-modal-header">
              <button
                type="button"
                className="contact-modal-close"
                onClick={() => setShowContact(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
              <div className="contact-modal-avatar">
                {owner.initials}
              </div>
              <h3 className="contact-modal-name">{contactData.name || owner.name}</h3>
              <p className="contact-modal-role">{owner.role}</p>
            </div>

            {/* Contact items */}
            <div className="contact-modal-body">
              {contactData.phone && (
                <a href={`tel:${contactData.phone}`} className="contact-modal-item">
                  <span className="contact-modal-item-icon">📞</span>
                  <div className="contact-modal-item-info">
                    <span className="contact-modal-item-label">Số điện thoại</span>
                    <span className="contact-modal-item-value">{contactData.phone}</span>
                  </div>
                  <button
                    type="button"
                    className="contact-modal-copy-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(contactData.phone);
                    }}
                    title="Sao chép"
                  >
                    📋
                  </button>
                </a>
              )}

              {!contactData.phone && (
                <div className="contact-modal-item contact-modal-item--muted">
                  <span className="contact-modal-item-icon">📞</span>
                  <div className="contact-modal-item-info">
                    <span className="contact-modal-item-label">Số điện thoại</span>
                    <span className="contact-modal-item-value">Chưa cập nhật</span>
                  </div>
                </div>
              )}

              {contactData.social && (
                <a
                  href={contactData.social.startsWith('http') ? contactData.social : `#`}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-modal-item"
                >
                  <span className="contact-modal-item-icon">🔗</span>
                  <div className="contact-modal-item-info">
                    <span className="contact-modal-item-label">Mạng xã hội / Zalo</span>
                    <span className="contact-modal-item-value contact-modal-item-link">{contactData.social}</span>
                  </div>
                </a>
              )}

              <div className="contact-modal-note">
                <span>💡</span>
                <p>Vui lòng liên hệ trong giờ hành chính (8:00 – 21:00). Hãy đề cập bạn xem qua RommieMatch.</p>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}


      {showRentalRequest && createPortal(
        <div className="modal-overlay" onClick={() => setShowRentalRequest(false)}>
          <form className="modal-container rental-confirm-modal" onSubmit={handleRentalSubmit} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setShowRentalRequest(false)}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <h3 className="modal-title">Xác nhận đang thuê phòng</h3>
            </div>

            <div className="modal-body rental-confirm-body">
              <div className="rental-confirm-field">
                <label className="rental-confirm-label">Ngày bắt đầu</label>
                <input
                  required
                  type="date"
                  className="rental-confirm-input"
                  value={rentalForm.startDate}
                  onChange={(event) => setRentalForm((current) => ({ ...current, startDate: event.target.value }))}
                />
              </div>

              <div className="rental-confirm-field">
                <label className="rental-confirm-label">Ghi chú</label>
                <textarea
                  maxLength={1000}
                  className="rental-confirm-textarea"
                  placeholder="Nhập ghi chú cho chủ trọ..."
                  value={rentalForm.note}
                  onChange={(event) => setRentalForm((current) => ({ ...current, note: event.target.value }))}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowRentalRequest(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="modal-btn modal-btn-confirm rental-confirm-submit-btn"
                disabled={requestState.isLoading}
              >
                {requestState.isLoading ? 'Đang gửi...' : 'Gửi cho chủ trọ'}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}

      <ConfirmModal
        isOpen={showLoginModal}
        title="Yêu cầu đăng nhập"
        message="Vui lòng đăng nhập bằng tài khoản khách thuê để tiếp tục."
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
        onConfirm={() => setAlertModal((current) => ({ ...current, isOpen: false }))}
        onCancel={() => setAlertModal((current) => ({ ...current, isOpen: false }))}
      />
    </aside>
  );
};

export default RoomDetailSidebar;
