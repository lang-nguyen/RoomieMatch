import { Check, ChevronLeft } from 'lucide-react';
import { useAddRoomForm } from '../../hooks/useAddRoomForm';
import styles from './StepForm.module.css';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const Row = ({ label, value }) => (
  <p>
    <strong>{label}:</strong>
    <span>{value || 'Chưa cập nhật'}</span>
  </p>
);

const StepConfirm = () => {
  const { draft, isSubmitting, error, successMessage, goBack, handleSubmit } = useAddRoomForm();

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.sectionTitle}>Xác nhận thông tin</h2>

      <div className={styles.confirmBox}>
        <Row label="Tên phòng" value={draft.name} />
        <Row label="Loại phòng" value={draft.room_type} />
        <Row label="Diện tích" value={draft.area ? `${draft.area} m²` : ''} />
        <Row label="Địa chỉ" value={[draft.address, draft.district, draft.city].filter(Boolean).join(', ')} />
        <Row label="Giá thuê" value={`${formatMoney(draft.price)}/tháng`} />
        <Row label="Tiền cọc" value={formatMoney(draft.deposit)} />
        <Row label="Tiền điện" value={formatMoney(draft.electricity_price)} />
        <Row label="Tiền nước" value={formatMoney(draft.water_price)} />
        <Row label="Wifi" value={formatMoney(draft.internet_price)} />
        <Row label="Gửi xe" value={formatMoney(draft.parking_price)} />
        <Row label="Tiện ích" value={(draft.amenities || []).join(', ') || 'Không có'} />
      </div>

      {error && <div className={styles.errorText}>{error}</div>}
      {successMessage && <div className={styles.successText}>{successMessage}</div>}

      <div className={styles.footer}>
        <button type="button" className={styles.backBtn} onClick={goBack} disabled={isSubmitting}>
          <ChevronLeft size={15} /> Quay lại
        </button>
        <button type="button" className={styles.submitBtn} onClick={() => handleSubmit({ publish: true })} disabled={isSubmitting}>
          <Check size={15} /> {isSubmitting ? 'Đang lưu...' : 'Lưu và đăng bài'}
        </button>
      </div>
    </div>
  );
};

export default StepConfirm;
