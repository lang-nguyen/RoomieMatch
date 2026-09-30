import { useState } from 'react';
import { CalendarDays, Check, Clock3, Mail, MapPin, Phone, Search, User, X } from 'lucide-react';
import { useDecideLandlordRentalRequestMutation, useEndLandlordRentalRequestMutation, useGetLandlordRentalRequestsQuery } from '../../features/landlord/api/landlordApi';
import LandlordPageHeader from '../../features/landlord/components/LandlordPageHeader';
import { getApiErrorMessage } from '../../shared/utils/getApiErrorMessage';
import sharedStyles from './LandlordPageShared.module.css';
import styles from './LandlordRentalRequestsPage.module.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'accepted', label: 'Đã chấp nhận' },
  { value: 'ended', label: 'Đã kết thúc' },
  { value: 'rejected', label: 'Đã từ chối' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  accepted: 'Đã chấp nhận',
  ended: 'Đã kết thúc',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy',
};

const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN');
};

const profileFacts = (request) => ([
  { label: 'Điện thoại', value: request.tenant_phone, icon: Phone },
  { label: 'Email', value: request.tenant_email, icon: Mail },
  { label: 'Giới tính', value: request.tenant_gender, icon: User },
  { label: 'Ngày sinh', value: request.tenant_date_of_birth ? formatDate(request.tenant_date_of_birth) : null, icon: CalendarDays },
  { label: 'Địa chỉ', value: request.tenant_address, icon: MapPin },
  { label: 'Quê quán', value: request.tenant_hometown, icon: MapPin },
  { label: 'Facebook', value: request.tenant_facebook, icon: Mail },
  { label: 'Instagram', value: request.tenant_instagram, icon: Mail },
  { label: 'Twitter', value: request.tenant_twitter, icon: Mail },
].filter((item) => item.value));

const DecisionModal = ({ target, reason, setReason, isLoading, onClose, onConfirm }) => {
  if (!target) return null;
  const isReject = target.decision === 'rejected';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.decisionModal} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>
        <div className={`${styles.decisionIcon} ${isReject ? styles.rejectIcon : styles.acceptIcon}`}>
          {isReject ? <X size={24} /> : <Check size={24} />}
        </div>
        <h3>{isReject ? 'Từ chối yêu cầu thuê' : 'Xác nhận khách thuê'}</h3>
        <p>
          {isReject
            ? `Bạn muốn từ chối yêu cầu thuê của ${target.request.tenant_name}?`
            : `Bạn muốn xác nhận ${target.request.tenant_name} đang thuê phòng này?`}
        </p>
        {isReject ? (
          <label className={styles.reasonField}>
            <span>Lý do từ chối</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do để khách thuê nắm rõ hơn..."
              rows={4}
            />
          </label>
        ) : (
          <div className={styles.acceptNote}>Sau khi xác nhận, bài đăng liên quan sẽ được cập nhật trạng thái thuê.</div>
        )}
        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelModalBtn} onClick={onClose}>Quay lại</button>
          <button
            type="button"
            className={isReject ? styles.rejectModalBtn : styles.acceptModalBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : isReject ? 'Từ chối' : 'Đồng ý'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EndRentalModal = ({ target, isLoading, onClose, onConfirm }) => {
  if (!target) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.decisionModal} onClick={(event) => event.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>
        <div className={`${styles.decisionIcon} ${styles.endIcon}`}>
          <Clock3 size={24} />
        </div>
        <h3>Kết thúc lượt thuê</h3>
        <p>
          Kết thúc lượt thuê của {target.tenant_name}? Phòng sẽ chuyển về trạng thái trống để có thể đăng lại.
        </p>
        <div className={styles.endNote}>
          Bài đăng cũ vẫn được đóng. Khi cần cho thuê tiếp, bạn có thể tạo bài đăng mới từ phòng này.
        </div>
        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelModalBtn} onClick={onClose}>Quay lại</button>
          <button
            type="button"
            className={styles.endModalBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Kết thúc thuê'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LandlordRentalRequestsPage = () => {
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetLandlordRentalRequestsQuery({ status, search });
  const [decide, decisionState] = useDecideLandlordRentalRequestMutation();
  const [endRental, endRentalState] = useEndLandlordRentalRequestMutation();
  const [message, setMessage] = useState('');
  const [decisionTarget, setDecisionTarget] = useState(null);
  const [endTarget, setEndTarget] = useState(null);
  const [reason, setReason] = useState('');
  const items = data?.items || [];

  const openDecisionModal = (request, decision) => {
    setReason('');
    setDecisionTarget({ request, decision });
  };

  const handleDecision = async () => {
    if (!decisionTarget) return;
    const { request, decision } = decisionTarget;
    try {
      await decide({ id: request.id, decision, reason: decision === 'rejected' ? reason : null }).unwrap();
      setMessage(decision === 'accepted' ? 'Đã xác nhận thuê. Bài đăng đã tự động đóng.' : 'Đã từ chối yêu cầu.');
      setDecisionTarget(null);
      setReason('');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Không thể xử lý yêu cầu.'));
    }
  };

  const handleEndRental = async () => {
    if (!endTarget) return;
    try {
      await endRental({ id: endTarget.id }).unwrap();
      setMessage('Đã kết thúc lượt thuê. Phòng đã chuyển về trạng thái trống và có thể đăng lại.');
      setEndTarget(null);
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Không thể kết thúc lượt thuê.'));
    }
  };

  return (
    <div className={sharedStyles.page}>
      <LandlordPageHeader title="Yêu cầu xác nhận thuê" subtitle="Đối chiếu thông tin khách và xác nhận người đang thuê phòng" />

      <div className={styles.searchBox}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên khách, số điện thoại, tên phòng, mã phòng hoặc mã bài..."
        />
      </div>

      <div className={styles.toolbar}>
        {STATUS_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`${styles.filterChip} ${status === item.value ? styles.filterActive : ''}`}
            onClick={() => setStatus(item.value)}
            disabled={status === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && <div className={styles.notice}>{message}</div>}

      {isLoading ? (
        <div className={styles.emptyState}>Đang tải yêu cầu thuê...</div>
      ) : (
        <div className={styles.requestList}>
          {items.map((request) => (
            <article key={request.id} className={styles.requestCard}>
              <div className={styles.requestHead}>
                <div className={styles.tenantSummary}>
                  <div className={styles.avatar}>
                    {request.tenant_avatar_url ? (
                      <img src={request.tenant_avatar_url} alt={request.tenant_name} />
                    ) : (
                      request.tenant_name?.charAt(0)?.toUpperCase() || 'K'
                    )}
                  </div>
                  <div>
                    <h3>{request.tenant_name}</h3>
                    <p>
                      {request.room_title || `Bài đăng #${request.post_id}`}
                      {' · '}
                      {request.room_code || `Phòng #${request.room_id}`}
                    </p>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${request.status}`] || ''}`}>
                  <Clock3 size={14} />
                  {STATUS_LABELS[request.status] || request.status}
                </span>
              </div>

              <div className={styles.contentGrid}>
                <section className={styles.panel}>
                  <h4>Thông tin thuê</h4>
                  <div className={styles.factGrid}>
                    <div className={styles.factItem}>
                      <span>Ngày bắt đầu</span>
                      <strong>{formatDate(request.start_date)}</strong>
                    </div>
                    <div className={styles.factItem}>
                      <span>Mã bài đăng</span>
                      <strong>{request.post_code || `#${request.post_id}`}</strong>
                    </div>
                    <div className={styles.factItem}>
                      <span>Mã phòng</span>
                      <strong>{request.room_code || `#${request.room_id}`}</strong>
                    </div>
                    <div className={styles.factItem}>
                      <span>Thời điểm gửi</span>
                      <strong>{formatDate(request.created_at)}</strong>
                    </div>
                  </div>
                  <div className={styles.noteBox}>
                    <span>Ghi chú từ khách thuê</span>
                    <p>{request.note || 'Khách thuê chưa để lại ghi chú.'}</p>
                  </div>
                  {request.decision_reason && (
                    <div className={styles.noteBox}>
                      <span>Lý do xử lý</span>
                      <p>{request.decision_reason}</p>
                    </div>
                  )}
                </section>

                <section className={styles.panel}>
                  <h4>Hồ sơ khách thuê</h4>
                  {profileFacts(request).length ? (
                    <div className={styles.profileGrid}>
                      {profileFacts(request).map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className={styles.profileItem}>
                            <span className={styles.profileIcon}><Icon size={14} /></span>
                            <div>
                              <small>{item.label}</small>
                              <strong>{item.value}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.placeholderCard}>Khách thuê chưa cập nhật thêm hồ sơ cá nhân.</div>
                  )}

                  <div className={styles.noteBox}>
                    <span>Giới thiệu</span>
                    <p>{request.tenant_bio || 'Chưa có mô tả cá nhân.'}</p>
                  </div>

                  <div className={styles.helperText}>
                    Tìm kiếm hỗ trợ tên, số điện thoại, tên phòng và mã phòng hoặc mã bài nếu có.
                  </div>
                </section>
              </div>

              {request.status === 'pending' && (
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} disabled={decisionState.isLoading} onClick={() => openDecisionModal(request, 'accepted')}>
                    <Check size={16} />
                    Xác nhận thuê
                  </button>
                  <button className={styles.secondaryBtn} disabled={decisionState.isLoading} onClick={() => openDecisionModal(request, 'rejected')}>
                    <X size={16} />
                    Từ chối
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <div className={styles.actions}>
                  <button className={styles.secondaryBtn} disabled={endRentalState.isLoading} onClick={() => setEndTarget(request)}>
                    <X size={16} />
                    Kết thúc thuê
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!isLoading && !items.length && (
        <div className={styles.emptyState}>
          {search
            ? 'Không tìm thấy yêu cầu nào phù hợp với từ khóa hiện tại.'
            : status === 'pending'
              ? 'Chưa có yêu cầu thuê nào đang chờ xử lý.'
              : 'Không có yêu cầu phù hợp với bộ lọc hiện tại.'}
        </div>
      )}

      <DecisionModal
        target={decisionTarget}
        reason={reason}
        setReason={setReason}
        isLoading={decisionState.isLoading}
        onClose={() => setDecisionTarget(null)}
        onConfirm={handleDecision}
      />
      <EndRentalModal
        target={endTarget}
        isLoading={endRentalState.isLoading}
        onClose={() => setEndTarget(null)}
        onConfirm={handleEndRental}
      />
    </div>
  );
};

export default LandlordRentalRequestsPage;
