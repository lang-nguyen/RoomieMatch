import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ImagePlus, PlusCircle, Shield, X } from 'lucide-react';
import { useGetLandlordVerificationQuery, useSubmitLandlordVerificationMutation } from '../api/landlordApi';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import styles from './VerificationModal.module.css';

const STATUS_LABELS = {
  pending: 'Đang chờ duyệt',
  approved: 'Đã xác thực',
  rejected: 'Chưa xác thực',
};

const VerificationModal = ({ isOpen, onClose }) => {
  const { data: verification, isLoading } = useGetLandlordVerificationQuery(undefined, { skip: !isOpen });
  const [submitVerification, submitState] = useSubmitLandlordVerificationMutation();
  const [activeTab, setActiveTab] = useState('images');
  const [activeImageSide, setActiveImageSide] = useState('front');
  const [form, setForm] = useState({
    legalName: '',
    identityNumber: '',
    issuedDate: '',
    issuedPlace: '',
    frontImage: null,
    backImage: null,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMessage('');
    setActiveTab('images');
    setActiveImageSide('front');
    setForm({
      legalName: verification?.legal_name || '',
      identityNumber: verification?.identity_number || '',
      issuedDate: verification?.issued_date || '',
      issuedPlace: verification?.issued_place || '',
      frontImage: null,
      backImage: null,
    });
  }, [isOpen, verification]);

  const statusText = useMemo(() => {
    if (isLoading) return 'Đang tải...';
    return STATUS_LABELS[verification?.status] || 'Chưa xác thực';
  }, [isLoading, verification]);

  if (!isOpen) return null;

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const currentImageKey = activeImageSide === 'front' ? 'frontImage' : 'backImage';
  const currentFile = form[currentImageKey];
  const currentImageTitle = activeImageSide === 'front' ? 'Mặt Trước CCCD' : 'Mặt Sau CCCD';

  const missingInfo = !form.legalName.trim() || !form.identityNumber.trim() || !form.issuedDate || !form.issuedPlace.trim();
  const missingImages = !form.frontImage || !form.backImage;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (missingInfo) {
      setActiveTab('info');
      setMessage('Vui lòng nhập đầy đủ thông tin CCCD trước khi gửi.');
      return;
    }
    if (!form.frontImage || !form.backImage) {
      setMessage('Vui lòng chọn đủ ảnh mặt trước và mặt sau CCCD.');
      setActiveTab('images');
      return;
    }
    try {
      await submitVerification(form).unwrap();
      setMessage('Đã gửi hồ sơ xác minh. Admin sẽ kiểm tra và phản hồi.');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Không thể gửi hồ sơ xác minh.'));
    }
  };

  const canSubmit = verification?.status !== 'approved';

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div className={styles.modalContainer} onMouseDown={(event) => event.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.iconTabs}>
            <button
              type="button"
              className={`${styles.iconTab} ${activeTab === 'info' ? styles.iconTabActive : ''}`}
              onClick={() => setActiveTab('info')}
              aria-label="Thông tin CCCD"
            >
              <Shield size={24} />
            </button>
            <button
              type="button"
              className={`${styles.iconTab} ${activeTab === 'images' ? styles.iconTabActive : ''}`}
              onClick={() => setActiveTab('images')}
              aria-label="Ảnh CCCD"
            >
              <PlusCircle size={24} />
            </button>
          </div>

          <div className={styles.titleBlock}>
            <h3>Căn Cước Công Dân</h3>
            <span className={verification?.status === 'approved' ? styles.statusVerified : styles.statusUnverified}>
              {statusText}
            </span>
          </div>

          {verification?.rejection_reason && (
            <div className={styles.alertBox}>
              <strong>Lý do từ chối</strong>
              <p>{verification.rejection_reason}</p>
            </div>
          )}

          {verification?.status === 'approved' ? (
            <div className={styles.approvedBox}>
              <CheckCircle2 size={22} />
              <div>
                <strong>Hồ sơ của bạn đã được xác thực.</strong>
                <p>Bạn có thể đóng cửa sổ này hoặc chờ thêm tính năng cập nhật hồ sơ xác minh.</p>
              </div>
            </div>
          ) : activeTab === 'images' ? (
            <div className={styles.panelBody}>
              <div className={styles.imageSwitch}>
                <button
                  type="button"
                  className={`${styles.sideChip} ${activeImageSide === 'front' ? styles.sideChipActive : ''}`}
                  onClick={() => setActiveImageSide('front')}
                >
                  Mặt trước
                </button>
                <button
                  type="button"
                  className={`${styles.sideChip} ${activeImageSide === 'back' ? styles.sideChipActive : ''}`}
                  onClick={() => setActiveImageSide('back')}
                >
                  Mặt sau
                </button>
              </div>

              <label className={styles.uploadHero}>
                <input
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setValue(currentImageKey, event.target.files?.[0] || null)}
                />
                <span className={styles.heroArt}>
                  <span className={styles.heroArtBack} />
                  <span className={styles.heroArtFront}>
                    <ImagePlus size={54} />
                  </span>
                </span>
              </label>

              <div className={styles.uploadTextBlock}>
                <strong>{currentImageTitle}</strong>
                <p>{currentFile ? currentFile.name : 'Thêm Ảnh Căn Cước Của Bạn'}</p>
              </div>
            </div>
          ) : (
            <div className={styles.panelBody}>
              <div className={styles.formStack}>
                <input
                  required
                  value={form.legalName}
                  onChange={(event) => setValue('legalName', event.target.value)}
                  placeholder="Họ Và Tên"
                  className={styles.inputField}
                />
                <input
                  required
                  value={form.identityNumber}
                  onChange={(event) => setValue('identityNumber', event.target.value)}
                  placeholder="Số CCCD"
                  className={styles.inputField}
                />
                <div className={styles.inputWithIcon}>
                  <input
                    required
                    type="date"
                    value={form.issuedDate}
                    onChange={(event) => setValue('issuedDate', event.target.value)}
                    className={styles.inputField}
                  />
                  <CalendarDays size={16} />
                </div>
                <input
                  required
                  value={form.issuedPlace}
                  onChange={(event) => setValue('issuedPlace', event.target.value)}
                  placeholder="Đơn Vị Cấp"
                  className={styles.inputField}
                />
              </div>
            </div>
          )}

          {message && <div className={styles.messageBox}>{message}</div>}

          {canSubmit && activeTab === 'info' && (
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => {
                if (missingInfo) {
                  setMessage('Vui lòng nhập đầy đủ thông tin CCCD trước khi sang bước tải ảnh.');
                  return;
                }
                setMessage('');
                setActiveTab('images');
              }}
            >
              Tiếp
            </button>
          )}

          {canSubmit && activeTab === 'images' && (
            <button className={styles.submitBtn} disabled={submitState.isLoading || missingImages}>
              {submitState.isLoading ? 'Đang gửi...' : 'Gửi'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default VerificationModal;
