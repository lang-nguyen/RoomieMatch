import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../api/authApi';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import styles from './Auth.module.css';

const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await forgotPassword(email).unwrap();
      setSuccessMsg('Đã gửi liên kết khôi phục mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Không thể gửi yêu cầu khôi phục mật khẩu'));
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.headerTitle}>
        <button type="button" onClick={() => navigate('/login')} className={styles.backButton}>
          <BackArrowIcon />
        </button>
        Khôi phục mật khẩu
      </div>

      <p style={{ color: 'white', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
        Nhập email của bạn để nhận mã đặt lại mật khẩu
      </p>

      {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input 
            type="email" 
            placeholder="Email" 
            className={styles.input} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className={styles.primaryButton} disabled={isLoading}>
          {isLoading ? 'Đang gửi...' : 'Tiếp tục'}
        </button>
      </form>

      <div className={styles.supportText}>
        Nếu bạn cần hỗ trợ, vui lòng liên hệ SĐT/Zalo: <span>0582969652</span>
      </div>
    </div>
  );
};
