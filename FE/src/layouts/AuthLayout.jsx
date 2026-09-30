import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.backgroundOverlay}></div>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1>RoomieMatch - Tìm Phòng Trọ Cùng Nhau</h1>
          <p>Chào mừng trở lại</p>
        </div>
        <div className={styles.formContainer}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
