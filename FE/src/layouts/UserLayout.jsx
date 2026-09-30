import { Outlet } from 'react-router-dom';
import { UserSidebar } from '../features/user';
import styles from './UserLayout.module.css';

const UserLayout = () => {
  return (
    <div className={styles.layout}>
      <UserSidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
