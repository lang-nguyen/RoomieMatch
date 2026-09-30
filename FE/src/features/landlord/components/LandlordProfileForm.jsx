import { Camera, Edit3, Save, X } from 'lucide-react';
import { useRef } from 'react';
import { useLandlordProfile } from '../hooks/useLandlordProfile';
import styles from './LandlordProfileForm.module.css';

const formatGender = (value) => {
  if (value === 'male') return 'Nam';
  if (value === 'female') return 'Nữ';
  return value || 'Chưa cập nhật';
};

const formatStatus = (value) => {
  if (value === 'active') return 'Đang hoạt động';
  if (value === 'blocked') return 'Bị khóa';
  return value || 'Chưa cập nhật';
};

const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
};

const InfoRow = ({ label, value, name, isEditing, onChange, type = 'text', displayValue }) => (
  <label className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}</span>
    {isEditing ? (
      <input type={type} name={name} className={styles.infoInput} value={value || ''} onChange={onChange} placeholder={`Nhập ${label.toLowerCase()}`} />
    ) : (
      <span className={styles.infoValue}>{displayValue || value || 'Chưa cập nhật'}</span>
    )}
  </label>
);

const LandlordProfileForm = () => {
  const {
    profile,
    isLoading,
    isError,
    isEditing,
    formData,
    isUpdating,
    successMessage,
    errorMessage,
    startEditing,
    cancelEditing,
    handleChange,
    handleSave,
    handleAvatarUpload,
    isUploadingAvatar,
  } = useLandlordProfile();

  const fileInputRef = useRef(null);

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleAvatarUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <div className={styles.loadingState}><div className={styles.loadingSpinner} /><p>Đang tải hồ sơ...</p></div>;
  }

  if (isError || !profile) {
    return <div className={styles.errorState}><p>Đã có lỗi xảy ra khi tải hồ sơ. Vui lòng thử lại.</p></div>;
  }

  const display = isEditing ? formData : profile;
  const displayName = display?.display_name || display?.full_name || profile.nickname || 'Chủ trọ';
  const avatarLetter = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      <section className={styles.profileCard}>
        <div className={styles.topSection}>
          <button className={styles.avatarWrapper} type="button" onClick={() => fileInputRef.current?.click()}>
            <div className={`${styles.avatarRing} ${isUploadingAvatar ? styles.uploading : ''}`}>
              <div className={styles.avatarInner}>
                {profile.avatar ? <img src={profile.avatar} alt={displayName} className={styles.avatarImg} /> : <span className={styles.avatarLetter}>{avatarLetter}</span>}
                <span className={styles.avatarOverlay}><Camera size={22} /></span>
              </div>
            </div>
          </button>
          <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" hidden />

          <div className={styles.nameSection}>
            {isEditing ? (
              <input name="display_name" className={styles.nameInput} value={display?.display_name || ''} onChange={handleChange} placeholder="Tên chủ trọ" />
            ) : (
              <h1 className={styles.displayName}>{displayName}</h1>
            )}
            <p className={styles.roleText}>{profile.role || 'Chủ trọ'}</p>
          </div>

          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button className={styles.cancelBtn} type="button" onClick={cancelEditing}><X size={15} /> Hủy</button>
                <button className={styles.saveBtn} type="button" onClick={handleSave} disabled={isUpdating}><Save size={15} /> {isUpdating ? 'Đang lưu...' : 'Lưu'}</button>
              </>
            ) : (
              <button className={styles.editBtn} type="button" onClick={startEditing}><Edit3 size={15} /> Chỉnh sửa</button>
            )}
          </div>
        </div>

        {successMessage && <div className={styles.successMsg}>{successMessage}</div>}
        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}

        <div className={styles.infoGrid}>
          <div className={styles.infoCol}>
            <div className={styles.sectionTitle}>Thông tin cá nhân</div>
            <div className={styles.infoBlock}>
              <InfoRow label="Ngày sinh" name="dob" value={display?.dob} displayValue={formatDate(display?.dob)} isEditing={isEditing} onChange={handleChange} type="date" />
              <label className={styles.infoRow}>
                <span className={styles.infoLabel}>Giới tính</span>
                {isEditing ? (
                  <select name="gender" className={styles.infoInput} value={display?.gender || ''} onChange={handleChange}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                ) : (
                  <span className={styles.infoValue}>{formatGender(display?.gender)}</span>
                )}
              </label>
              <InfoRow label="Tình trạng" name="status" value={display?.status} displayValue={formatStatus(display?.status)} isEditing={false} />
              <InfoRow label="Số điện thoại" name="phone" value={display?.phone} isEditing={isEditing} onChange={handleChange} type="tel" />
              <InfoRow label="Facebook" name="facebook" value={display?.facebook} isEditing={isEditing} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.infoCol}>
            <div className={styles.sectionTitle}>Thông tin bổ sung</div>
            <div className={styles.infoBlock}>
              <InfoRow label="Vị trí" name="location" value={display?.location} isEditing={isEditing} onChange={handleChange} />
              <InfoRow label="Quê quán" name="hometown" value={display?.hometown} isEditing={isEditing} onChange={handleChange} />
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Căn cước công dân</span>
                <span className={profile.cccd_verified ? styles.verified : styles.unverified}>{profile.cccd_verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bioSection}>
          <div className={styles.sectionTitle}>Giới thiệu</div>
          {isEditing ? (
            <textarea name="bio" className={styles.bioTextarea} value={display?.bio || ''} onChange={handleChange} rows={4} placeholder="Giới thiệu bản thân..." />
          ) : (
            <p className={styles.bioText}>{profile.bio || 'Chưa có phần giới thiệu.'}</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandlordProfileForm;
