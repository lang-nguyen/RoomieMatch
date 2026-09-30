import {
  Camera,
  CheckCircle2,
  Edit3,
  UserSquare2,
  Mail,
  Phone,
  User as UserIcon,
  ShieldCheck,
  VenusAndMars,
  Lock,
  EyeOff
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useChangePasswordMutation, useUploadAvatarMutation } from '../api/userApi';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { uploadImage } from '../../../shared/api/uploadApi';
import styles from './Profile.module.css';

const Profile = () => {
  const { data, isLoading, isError } = useGetUserProfileQuery();
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const fileInputRef = useRef(null);
  
  const profile = data?.profile;
  const account = data?.account;

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'alert', message: '', title: 'Thông báo' });
  
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });


  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    full_name: '',
    gender: ''
  });

  useEffect(() => {
    if (profile && account) {
      setFormData({
        username: account.username || '',
        email: account.email || '',
        phone: profile.phone || '',
        full_name: profile.full_name || '',
        gender: profile.gender || ''
      });
    }
  }, [profile, account, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = () => {
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setShowConfirmModal(false);
    setIsUploading(true);
    try {
      const updateData = { ...formData };
      
      // Loại bỏ các trường rỗng để tránh lỗi validation từ Pydantic (ví dụ: gender=""), và bỏ email/username
      delete updateData.username;
      delete updateData.email;
      if (updateData.gender === '') delete updateData.gender;
      if (updateData.phone === '') delete updateData.phone;
      if (updateData.full_name === '') delete updateData.full_name;

      if (avatarFile) {
        const uploadResult = await uploadImage(avatarFile);
        updateData.avatar_url = uploadResult.url;
      }
      await updateUserProfile(updateData).unwrap();
      setIsEditing(false);
      setAvatarFile(null);
      setAlertModal({ isOpen: true, type: 'success', message: 'Cập nhật thành công!', title: 'Thành công' });
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      setAlertModal({ isOpen: true, type: 'alert', message: 'Cập nhật thất bại. Vui lòng thử lại.', title: 'Lỗi' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
  };


  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setShowConfirmModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setAlertModal({ isOpen: true, type: 'alert', message: 'Mật khẩu mới không khớp!', title: 'Lỗi' });
      return;
    }
    try {
      await changePassword({ 
        old_password: passwordForm.old_password, 
        new_password: passwordForm.new_password 
      }).unwrap();
      setShowPasswordModal(false);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setAlertModal({ isOpen: true, type: 'success', message: 'Đổi mật khẩu thành công!', title: 'Thành công' });
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      setAlertModal({ isOpen: true, type: 'alert', message: error?.data?.detail || 'Đổi mật khẩu thất bại. Vui lòng thử lại.', title: 'Lỗi' });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar(file).unwrap();
      setAlertModal({ isOpen: true, type: 'success', message: 'Cập nhật ảnh đại diện thành công!', title: 'Thành công' });
    } catch (error) {
      console.error('Lỗi khi upload avatar:', error);
      setAlertModal({ isOpen: true, type: 'alert', message: 'Lỗi khi tải ảnh lên. Vui lòng thử lại.', title: 'Lỗi' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  if (isLoading) {
    return <div className={styles.container}>Đang tải hồ sơ cá nhân...</div>;
  }

  if (isError || !profile) {
    return <div className={styles.container}>Đã có lỗi xảy ra khi tải hồ sơ.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Hồ sơ cá nhân</h1>

      <div className={styles.card}>
        <div className={styles.leftSidebar}>
          <div className={styles.avatarWrapper}>
            <img
              src={avatarPreview || profile.avatar_url || profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name || account.username || 'U'}&backgroundColor=e5e7eb&textColor=4b5563`}
              alt="Avatar"
              className={styles.avatar}
            />
          </div>

          <h3 className={styles.username}>{profile.full_name || account.username || 'N/A'}</h3>

          {account.email_verified && (
            <div className={styles.verificationBadge}>
              Đã xác minh tài khoản
              <CheckCircle2 className={styles.checkIcon} />
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <button className={styles.changeAvatarBtn} onClick={handleAvatarClick} disabled={isUploadingAvatar}>

            <Camera className={styles.btnIcon} />
            {isUploadingAvatar ? 'Đang tải...' : 'Thay đổi ảnh đại diện'}
          </button>
        </div>

        <div className={styles.rightContent}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Chi tiết tài khoản</h2>
            {!isEditing ? (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                <Edit3 className={styles.btnIcon} />
                Chỉnh sửa
              </button>
            ) : (
              <div className={styles.actionButtons}>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  Hủy
                </button>
                <button 
                  className={styles.updateBtn} 
                  onClick={handleUpdate} 
                  disabled={isUpdating || isUploading}
                >
                  {(isUpdating || isUploading) ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <UserSquare2 className={styles.labelIcon} />
                Tên đăng nhập
              </div>
              <input 
                type="text" 
                name="username"
                className={styles.input} 
                value={isEditing ? formData.username : (account.username || '')} 
                onChange={handleChange}
                readOnly={!isEditing} 
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <Mail className={styles.labelIcon} />
                Email
              </div>
              <input 
                type="email" 
                name="email"
                className={styles.input} 
                value={account.email || ''} 
                readOnly
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
                title="Email không thể thay đổi"
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <Phone className={styles.labelIcon} />
                Số điện thoại
              </div>
              <input 
                type="tel" 
                name="phone"
                className={styles.input} 
                value={isEditing ? formData.phone : (profile.phone || '')} 
                onChange={handleChange}
                readOnly={!isEditing} 
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <UserIcon className={styles.labelIcon} />
                Họ và tên
              </div>
              <input 
                type="text" 
                name="full_name"
                className={styles.input} 
                value={isEditing ? formData.full_name : (profile.full_name || '')} 
                onChange={handleChange}
                readOnly={!isEditing} 
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <ShieldCheck className={styles.labelIcon} />
                Vai trò
              </div>
              <div className={styles.roleTag}>{account.account_type === 'landlord' ? 'Chủ nhà' : 'Người thuê'}</div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <VenusAndMars className={styles.labelIcon} />
                Giới tính
              </div>
              {isEditing ? (
                <select 
                  name="gender" 
                  className={styles.input} 
                  value={formData.gender} 
                  onChange={handleChange}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db' }}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  className={styles.input} 
                  value={profile.gender || ''} 
                  readOnly 
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <Lock className={styles.labelIcon} />
                Mật khẩu
              </div>
              <div className={styles.passwordGroup}>
                <input type="password" className={styles.input} value="****************" readOnly />
                <button 
                  className={styles.changePasswordBtn} 
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#ea580c',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Xác nhận cập nhật"
        message="Bạn có chắc chắn muốn cập nhật thông tin không?"
        confirmText="Cập nhật"
        cancelText="Hủy"
        onConfirm={confirmUpdate}
        onCancel={() => {
          setShowConfirmModal(false);
          if (!isEditing && avatarFile) {
            setAvatarPreview(null);
            setAvatarFile(null);
          }
        }}
      />

      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Đổi mật khẩu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <input 
                type="password" 
                placeholder="Mật khẩu cũ" 
                className={styles.input} 
                style={{ backgroundColor: '#fff', border: '1px solid #d1d5db' }}
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Mật khẩu mới" 
                className={styles.input} 
                style={{ backgroundColor: '#fff', border: '1px solid #d1d5db' }}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Nhập lại mật khẩu mới" 
                className={styles.input} 
                style={{ backgroundColor: '#fff', border: '1px solid #d1d5db' }}
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                }}
              >
                Hủy
              </button>
              <button 
                className={styles.updateBtn} 
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password}
              >
                {isChangingPassword ? 'Đang đổi...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Profile;
