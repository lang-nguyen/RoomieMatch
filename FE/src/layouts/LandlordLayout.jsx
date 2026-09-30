import { Outlet, useLocation } from 'react-router-dom';
import LandlordSidebar from '../shared/components/LandlordSidebar';
import UserInfoPanel from '../shared/components/UserInfoPanel';
import { useGetLandlordRoomsQuery, useGetLandlordStatsQuery } from '../features/landlord/api/landlordApi';
import styles from './LandlordLayout.module.css';

const LandlordLayout = () => {
  const location = useLocation();
  const { data: roomsData } = useGetLandlordRoomsQuery({ page: 1, pageSize: 4 });
  const { data: statsData } = useGetLandlordStatsQuery({ range: '7d' });
  const showRightPanel = location.pathname === '/landlord' || location.pathname === '/landlord/';
  const ownedRooms = (roomsData?.items || []).map((room) => ({ id: room.id, name: room.title || room.name, code: room.room_code || room.code }));
  const roomStatus = statsData?.roomStatus || [];

  return (
    <div className={`${styles.wrapper} ${!showRightPanel ? styles.wrapperWide : ''}`}>
      <LandlordSidebar />
      <main className={styles.main}><Outlet /></main>
      {showRightPanel && <UserInfoPanel ownedRooms={ownedRooms} roomStatus={roomStatus} />}
    </div>
  );
};

export default LandlordLayout;
