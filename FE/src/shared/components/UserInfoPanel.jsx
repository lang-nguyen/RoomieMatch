import { useMemo, useState } from 'react';
import { Bell, MoreVertical, Plus, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../features/auth/slice';
import { useGetLandlordProfileQuery } from '../../features/landlord/api/landlordApi';
import NotificationPanel from '../../features/landlord/components/NotificationPanel';
import VerificationModal from '../../features/landlord/components/VerificationModal';
import styles from './UserInfoPanel.module.css';

const STATUS_TEXT = {
  available: 'Đang trống',
  rented: 'Đã thuê',
  negotiating: 'Đang thương lượng',
};

const getDisplayName = (profile, user) =>
  profile?.display_name ||
  profile?.full_name ||
  profile?.nickname ||
  user?.display_name ||
  user?.full_name ||
  user?.username ||
  'Chủ trọ';

const UserInfoPanel = ({ ownedRooms = [], roomStatus = [] }) => {
  const user = useSelector(selectCurrentUser);
  const { data: profileData } = useGetLandlordProfileQuery();
  const profile = profileData?.profile;
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const displayName = getDisplayName(profile, user);
  const roleLabel = profile?.role || user?.role || 'Chủ trọ';
  const avatarUrl = profile?.avatar || profile?.avatar_url || user?.avatar || user?.avatar_url;
  const avatarLetter = displayName?.trim()?.[0]?.toUpperCase() ?? 'C';

  const statusItems = useMemo(() => (
    roomStatus.length ? roomStatus : [
      { label: 'available', value: 0, color: '#22c55e' },
      { label: 'rented', value: 0, color: '#4f6ef7' },
      { label: 'negotiating', value: 0, color: '#f59e0b' },
    ]
  ), [roomStatus]);

  const totalRooms = statusItems.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Thông tin chủ trọ</span>
        <button className={styles.moreBtn} aria-label="Thêm tùy chọn">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className={styles.profileBlock}>
        <div className={styles.avatarRing}>
          <div className={styles.avatarInner}>
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className={styles.avatarImg} /> : <span className={styles.avatarLetter}>{avatarLetter}</span>}
          </div>
        </div>
        <div className={styles.displayName}>{displayName}</div>
        <div className={styles.roleLabel}>{roleLabel}</div>

        <div className={styles.iconTabs}>
          <button className={`${styles.iconTab} ${showNotifications ? styles.iconTabActive : ''}`} title="Thông báo" onClick={() => setShowNotifications((value) => !value)}>
            <Bell size={16} />
          </button>
          <button className={`${styles.iconTab} ${showVerification ? styles.iconTabActive : ''}`} title="Xác thực chủ trọ" onClick={() => setShowVerification(true)}>
            <Shield size={16} />
          </button>
        </div>
      </div>

      <VerificationModal isOpen={showVerification} onClose={() => setShowVerification(false)} />

      {showNotifications ? (
        <div className={styles.notificationWrapper}>
          <NotificationPanel />
        </div>
      ) : (
        <>
          <div className={styles.statusBlock}>
            <div className={styles.statusHead}>
              <strong>Tình trạng phòng</strong>
              <span>{totalRooms} phòng</span>
            </div>
            <div className={styles.statusList}>
              {statusItems.map((item) => (
                <div key={item.label} className={styles.statusItem}>
                  <span className={styles.statusDot} style={{ background: item.color || '#c1440e' }} />
                  <span>{STATUS_TEXT[item.label] || item.label}</span>
                  <strong>{Number(item.value || 0).toLocaleString('vi-VN')}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.ownedBlock}>
            <div className={styles.ownedHeader}>
              <span className={styles.ownedTitle}>Phòng thuộc sở hữu</span>
              <button className={styles.addBtn} title="Thêm phòng" onClick={() => navigate('/landlord/rooms/add')}>
                <Plus size={14} />
              </button>
            </div>

            <div className={styles.ownedList}>
              {ownedRooms.length === 0 ? (
                <div className={styles.emptyOwned}>Chưa có phòng nào</div>
              ) : (
                ownedRooms.map((room) => (
                  <button key={room.id} className={styles.ownedItem} onClick={() => navigate(`/landlord/rooms/${room.id}`)}>
                    <div className={styles.ownedAvatar}><span>{room.code?.slice(-2) ?? 'TR'}</span></div>
                    <div className={styles.ownedInfo}>
                      <div className={styles.ownedName}>{room.name}</div>
                      <div className={styles.ownedCode}>Mã trọ: {room.code}</div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {ownedRooms.length > 0 && <button className={styles.viewAllBtn} onClick={() => navigate('/landlord/rooms')}>Xem tất cả</button>}
          </div>
        </>
      )}
    </aside>
  );
};

export default UserInfoPanel;
