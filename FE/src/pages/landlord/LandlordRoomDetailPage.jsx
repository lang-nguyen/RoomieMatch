import { ChevronLeft, Edit3, MapPin, Share2, Trash2, Users, Wallet } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteRoomMutation, useGetLandlordRoomByIdQuery } from '../../features/landlord/api/landlordApi';
import ConfirmModal from '../../shared/components/ConfirmModal';
import sharedStyles from './LandlordPageShared.module.css';
import styles from './LandlordRoomDetailPage.module.css';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;

const CostItem = ({ label, value }) => (
  <div className={styles.costItem}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const FactItem = ({ icon: Icon, label, value }) => (
  <div className={styles.factItem}>
    <span className={styles.factIcon}><Icon size={15} /></span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  </div>
);

const LandlordRoomDetailPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: room, isLoading, isError } = useGetLandlordRoomByIdQuery({ id: roomId });
  const [deleteRoom] = useDeleteRoomMutation();

  if (isLoading) return <div className={sharedStyles.page}>Đang tải thông tin phòng...</div>;

  if (isError || !room) {
    return (
      <div className={sharedStyles.page}>
        <div className={styles.emptyState}>
          <h3>Không tìm thấy phòng trọ</h3>
          <button type="button" className={styles.backBtn} onClick={() => navigate('/landlord/rooms')}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const address = room.full_address || room.address || 'Đang cập nhật địa chỉ';
  const images = room.images || [];
  const name = room.title || room.name || 'Chi tiết phòng trọ';

  return (
    <div className={`${sharedStyles.page} ${styles.page}`}>
      <div className={styles.stickyHeader}>
        <div className={styles.topBar}>
          <div className={styles.titleRow}>
            <button type="button" className={styles.backBtn} onClick={() => navigate('/landlord/rooms')}>
              <ChevronLeft size={16} />
              Quay lại
            </button>
            <div className={styles.titleBlock}>
              <h1>{name}</h1>
              <p>{address}</p>
            </div>
          </div>

          <div className={styles.actionGroup}>
            <button type="button" className={styles.editBtn} onClick={() => navigate(`/landlord/rooms/${room.id}/edit`)}>
              <Edit3 size={15} /> Sửa
            </button>
            <button type="button" className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} /> Xóa
            </button>
          </div>
        </div>
      </div>

      <div className={styles.gallery}>
        {images.length ? images.slice(0, 5).map((image, index) => (
          <div key={`${image}-${index}`} className={index === 0 ? styles.heroImage : styles.sideImage}>
            <img src={image} alt={`${name} ${index + 1}`} />
          </div>
        )) : (
          <div className={`${styles.heroImage} ${styles.placeholder}`}>
            <span>Chưa có ảnh phòng</span>
          </div>
        )}
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.mainColumn}>
          <div className={styles.panel}>
            <h2>Tổng quan phòng</h2>
            <div className={styles.factGrid}>
              <FactItem icon={MapPin} label="Địa chỉ" value={address} />
              <FactItem icon={Users} label="Sức chứa" value={`${room.max_people || room.capacity || 1} người`} />
              <FactItem icon={Wallet} label="Loại phòng" value={room.room_type || 'Phòng trọ'} />
              <FactItem icon={Share2} label="Mã phòng" value={room.room_code || room.code || `#${room.id}`} />
            </div>
          </div>

          <div className={styles.panel}>
            <h2>Mô tả</h2>
            <p className={styles.description}>{room.description || 'Chưa có mô tả cho phòng này.'}</p>
          </div>

          <div className={styles.panel}>
            <h2>Tiện ích</h2>
            {room.amenities?.length ? (
              <div className={styles.amenities}>
                {room.amenities.map((item) => <span key={item}>{item}</span>)}
              </div>
            ) : (
              <p className={styles.description}>Chưa có tiện ích được cập nhật.</p>
            )}
          </div>
        </section>

        <aside className={styles.sideColumn}>
          <div className={styles.panel}>
            <h2>Chi phí</h2>
            <div className={styles.costList}>
              <CostItem label="Giá phòng" value={formatMoney(room.price)} />
              <CostItem label="Tiền cọc" value={formatMoney(room.deposit)} />
              <CostItem label="Tiền điện" value={formatMoney(room.electricity_price)} />
              <CostItem label="Tiền nước" value={formatMoney(room.water_price)} />
              <CostItem label="Wifi" value={formatMoney(room.internet_price)} />
              <CostItem label="Gửi xe" value={formatMoney(room.parking_price)} />
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Xác nhận xóa phòng trọ"
        message={`Bạn có chắc muốn xóa phòng "${name}"?`}
        confirmText="Xóa phòng"
        cancelText="Hủy"
        onCancel={() => setConfirmDelete(false)}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteRoom({ id: room.id }).unwrap();
          navigate('/landlord/rooms');
        }}
      />
    </div>
  );
};

export default LandlordRoomDetailPage;
