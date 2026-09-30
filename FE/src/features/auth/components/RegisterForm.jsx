import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { useGoogleLoginMutation } from '../api/authApi';
import { setCredentials, setError, clearError } from '../slice';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import styles from './Auth.module.css';

const GoogleIcon = () => (
  <svg className={styles.googleIcon} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export const RegisterForm = () => {
  const { formData, error: registerError, successMessage, isLoading, handleChange, handleSubmit } = useRegisterForm();
  
  const [googleLoginMutate, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);

  const error = registerError; // alias for the template

  const handleGoogleSuccess = async (tokenResponse) => {
    const token = tokenResponse.access_token;
    dispatch(clearError());
    try {
      const response = await googleLoginMutate({ access_token: token }).unwrap();
      dispatch(setCredentials(response));
      navigate('/');
    } catch (err) {
      if (err.status === 400 && err.data?.detail?.includes('Account type is required')) {
        setPendingToken(token);
        setIsRoleModalOpen(true);
      } else {
        dispatch(setError(getApiErrorMessage(err, 'Đăng nhập Google thất bại')));
      }
    }
  };

  const handleGoogleError = () => {
    dispatch(setError('Lỗi kết nối với Google'));
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  const handleRoleSelection = async (role) => {
    if (!pendingToken) return;
    setIsRoleModalOpen(false);
    try {
      const response = await googleLoginMutate({ access_token: pendingToken, account_type: role }).unwrap();
      dispatch(setCredentials(response));
      navigate('/');
    } catch (err) {
      dispatch(setError(getApiErrorMessage(err, 'Tạo tài khoản Google thất bại')));
    }
    setPendingToken(null);
  };


  return (
    <div className={styles.formWrapper}>
      <div className={styles.tabs}>
        <Link to="/login" className={styles.tab}>Đăng nhập</Link>
        <Link to="/register" className={`${styles.tab} ${styles.activeTab}`}>Tạo tài khoản mới</Link>
      </div>

      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            name="display_name"
            placeholder="Họ tên" 
            className={styles.input} 
            value={formData.display_name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className={styles.inputGroup}>
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            className={styles.input} 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className={styles.inputGroup}>
          <input 
            type="password" 
            name="password"
            placeholder="Mật khẩu" 
            className={styles.input} 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <div className={styles.inputGroup}>
          <input 
            type="password" 
            name="password_confirm"
            placeholder="Xác nhận lại mật khẩu" 
            className={styles.input} 
            value={formData.password_confirm}
            onChange={handleChange}
            required 
          />
        </div>

        <div className={styles.radioGroup}>
          <span>Loại tài khoản:</span>
          <label className={styles.radioLabel}>
            <input 
              type="radio" 
              name="account_type" 
              value="tenant" 
              className={styles.radioInput} 
              checked={formData.account_type === 'tenant'}
              onChange={handleChange}
            />
            Người thuê trọ
          </label>
          <label className={styles.radioLabel}>
            <input 
              type="radio" 
              name="account_type" 
              value="landlord" 
              className={styles.radioInput} 
              checked={formData.account_type === 'landlord'}
              onChange={handleChange}
            />
            Chủ trọ
          </label>
        </div>

        <button type="submit" className={styles.primaryButton} disabled={isLoading}>
          {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>
      </form>

      <div className={styles.divider}>Hoặc</div>

      <button type="button" className={styles.googleButton} onClick={() => loginWithGoogle()} disabled={isGoogleLoading}>
        <GoogleIcon />
        {isGoogleLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}
      </button>

      <ConfirmModal
        isOpen={isRoleModalOpen}
        title="Chọn loại tài khoản"
        message="Vui lòng chọn loại tài khoản bạn muốn tạo"
        confirmText="Người thuê trọ"
        cancelText="Chủ trọ"
        onConfirm={() => handleRoleSelection('tenant')}
        onCancel={() => handleRoleSelection('landlord')}
      />
    </div>
  );
};
