import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, Maximize2, Upload } from 'lucide-react';
import {
  useCreateLandlordPostMutation,
  useGetLandlordProfileQuery,
  useGetLandlordRoomByIdQuery,
} from '../../features/landlord/api/landlordApi';
import sharedStyles from './LandlordPageShared.module.css';
import { getApiErrorMessage } from '../../shared/utils/getApiErrorMessage';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  header: { marginBottom: '32px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111827' },
  pageSub: { color: '#6b7280', fontSize: '14px' },
  steps: { display: 'flex', alignItems: 'center', marginBottom: '40px', padding: '0 20px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#9ca3af' },
  stepActive: { color: '#f97316' },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#9ca3af',
  },
  stepCircleActive: { backgroundColor: '#f97316', color: '#fff' },
  stepLine: { flex: 1, height: '2px', backgroundColor: '#e5e7eb', margin: '0 16px' },
  stepLineActive: { backgroundColor: '#f97316' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' },
  sectionDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' },
  fieldGroup: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#4b5563' },
  imagePreview: {
    width: '100%',
    height: '300px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
  },
  imageTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#f97316',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    zIndex: 1,
  },
  statusTag: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    zIndex: 1,
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  input: {
    width: '100%',
    height: '46px',
    padding: '0 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  textarea: {
    width: '100%',
    minHeight: '150px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  btnOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f97316',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
  },
};

const LandlordPostCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');

  const { data: room, isLoading } = useGetLandlordRoomByIdQuery({ id: roomId }, { skip: !roomId });
  const { data: profileData, isError: isProfileError } = useGetLandlordProfileQuery();
  const [createPost, { isLoading: isCreating }] = useCreateLandlordPostMutation();
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);

  if (!roomId) {
    return <div className={sharedStyles.page}>Vui lòng chọn phòng trọ trước.</div>;
  }

  if (isLoading) {
    return <div className={sharedStyles.page}>Đang tải thông tin phòng...</div>;
  }

  const profile = profileData?.profile || null;
  const isProfileReady = Boolean((profile?.full_name || profile?.display_name || '').trim() && (profile?.phone || '').trim());

  const handleCreatePost = async () => {
    if (isCreating || !isProfileReady) return;
    try {
      const titleValue = title ?? room?.title ?? room?.name ?? '';
      const descriptionValue = description ?? room?.description ?? '';
      await createPost({
        room_id: roomId,
        title: titleValue.trim() || undefined,
        description: descriptionValue.trim() || undefined,
      }).unwrap();
      navigate('/landlord/posts/success');
    } catch (err) {
      console.error('Failed to create post:', err);
      alert(getApiErrorMessage(err, 'Đã có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại!'));
    }
  };

  const code = room?.room_code || room?.code || `TRO-${String(room?.id).padStart(3, '0')}`;
  const statusLabel = room?.status === 'available' ? 'Trống' : 'Đã thuê';
  const imageUrl = room?.images?.[0];
  const titleValue = title ?? room?.title ?? room?.name ?? '';
  const descriptionValue = description ?? room?.description ?? '';

  return (
    <div className={sharedStyles.page}>
      <div style={styles.header}>
        <div style={{ color: '#f97316', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
          Quản lý bài đăng &gt; Thêm bài đăng mới
        </div>
        <h1 style={styles.pageTitle}>Nhập nội dung bài đăng</h1>
        <p style={styles.pageSub}>Nội dung này hiển thị cho khách thuê, không làm thay đổi mô tả gốc của phòng.</p>
      </div>

      <div style={styles.steps}>
        <div style={{ ...styles.stepItem, ...styles.stepActive }}>
          <div style={{ ...styles.stepCircle, ...styles.stepCircleActive }}><Check size={14} /></div>
          Chọn phòng trọ
        </div>
        <div style={{ ...styles.stepLine, ...styles.stepLineActive }} />
        <div style={{ ...styles.stepItem, ...styles.stepActive }}>
          <div style={{ ...styles.stepCircle, ...styles.stepCircleActive }}>2</div>
          Nhập nội dung bài đăng
        </div>
        <div style={styles.stepLine} />
        <div style={styles.stepItem}>
          <div style={styles.stepCircle}>3</div>
          Chờ phê duyệt
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.sectionTitle}>
          <div style={styles.sectionDot} />
          Thông tin cơ bản
        </div>

        {!isProfileReady && (
          <div style={{ marginBottom: '24px', padding: '14px 16px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', fontSize: '14px', lineHeight: '1.6' }}>
            {isProfileError
              ? 'Không tải được hồ sơ cá nhân. Vui lòng cập nhật họ tên và số điện thoại trước khi đăng bài.'
              : 'Vui lòng cập nhật họ tên và số điện thoại trong hồ sơ cá nhân trước khi đăng bài.'}
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Phòng trọ đã chọn: <span style={{ color: '#ef4444' }}>*</span></label>
          <div style={styles.imagePreview}>
            <div style={styles.imageTag}>{code}</div>
            <div style={styles.statusTag}>{statusLabel}</div>
            {imageUrl ? (
              <img src={imageUrl} alt="Room" style={styles.image} />
            ) : (
              <Maximize2 size={48} color="#d1d5db" />
            )}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Tiêu đề bài đăng</label>
          <input
            style={styles.input}
            placeholder="Để trống sẽ dùng tiêu đề phòng"
            value={titleValue}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Nội dung bài đăng</label>
          <textarea
            style={styles.textarea}
            placeholder="Nhập nội dung chi tiết bài đăng. Để trống sẽ dùng mô tả phòng."
            value={descriptionValue}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div style={styles.actions}>
          <button style={styles.btnOutline} onClick={() => navigate('/landlord/rooms?mode=select-for-post')}>
            <ChevronLeft size={16} />
            Quay lại chọn phòng
          </button>
          <button style={styles.btnPrimary} onClick={handleCreatePost} disabled={isCreating || !isProfileReady}>
            <Upload size={16} />
            {isCreating ? 'Đang tạo...' : 'Đăng bài ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordPostCreatePage;
