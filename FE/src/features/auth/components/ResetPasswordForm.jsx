import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../api/authApi';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import styles from './Auth.module.css';

const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await resetPassword({ token, new_password: password }).unwrap();
      setSuccessMsg('Đặt lại mật khẩu thành công. Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Mã xác nhận không hợp lệ hoặc đã hết hạn'));
    }
  };

  if (!token) {
    return (
      <div className={styles.formWrapper}>
        <div className={styles.headerTitle}>
          Lỗi đường dẫn
        </div>
        <p style={{ color: 'white', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
          Đường dẫn không hợp lệ hoặc bị thiếu mã xác nhận (token).
        </p>
        <button type="button" onClick={() => navigate('/login')} className={styles.primaryButton}>
          Quay lại Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      <div className={styles.headerTitle}>
        <button type="button" onClick={() => navigate('/login')} className={styles.backButton}>
          <BackArrowIcon />
        </button>
        Đặt lại mật khẩu
      </div>

      <p style={{ color: 'white', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
        Nhập mật khẩu mới cho tài khoản của bạn
      </p>

      {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input 
            type="password" 
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)" 
            className={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength={8}
          />
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '15px' }}>
          <input 
            type="password" 
            placeholder="Xác nhận mật khẩu mới" 
            className={styles.input} 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            minLength={8}
          />
        </div>

        <button type="submit" className={styles.primaryButton} disabled={isLoading} style={{ marginTop: '20px' }}>
          {isLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
        </button>
      </form>

      <div className={styles.supportText}>
        Nếu bạn cần hỗ trợ, vui lòng liên hệ SĐT/Zalo: <span>0582969652</span>
      </div>
    </div>
  );
};
