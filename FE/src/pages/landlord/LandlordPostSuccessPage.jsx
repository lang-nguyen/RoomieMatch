import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, FileText } from 'lucide-react';
import sharedStyles from './LandlordPageShared.module.css';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    height: '100%',
    minHeight: '600px',
  },
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '60px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '800px',
    width: '100%',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  iconWrapper: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#374151',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  btnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#f97316',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

const LandlordPostSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landlord/posts');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={sharedStyles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconWrapper}>
            <Bell size={100} color="#111827" strokeWidth={1.5} />
          </div>
          <h1 style={styles.title}>Đăng bài viết thành công</h1>
          <p style={styles.subtitle}>Vui lòng chờ admin phê duyệt</p>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnOutline} onClick={() => navigate('/landlord')}>
            <ChevronLeft size={16} />
            Quay lại trang chủ
          </button>
          <button style={styles.btnPrimary} onClick={() => navigate('/landlord/posts')}>
            <FileText size={16} />
            Xem bài đăng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordPostSuccessPage;
