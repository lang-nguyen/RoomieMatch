import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './PostFormModal.module.css';

const PostFormModal = ({ open, onClose, onSubmit, isSaving = false, rooms = [] }) => {
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!roomId) {
      setError('Vui long chon phong de dang bai.');
      return;
    }

    setError('');
    await onSubmit?.({
      room_id: Number(roomId),
      ...(title.trim() ? { title: title.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    });
    setRoomId('');
    setTitle('');
    setDescription('');
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.head}>
          <div>
            <h2>Thêm bài đăng</h2>
            <p>Chọn phòng trọ đã tạo và nhập nội dung hiển thị cho khách thuê.</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng">
            <X size={17} />
          </button>
        </div>

        <label className={styles.field}>
          <span>Phòng trọ</span>
          <select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
            <option value="">Chọn phòng trọ</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {(room.room_code || room.code || `TRO-${String(room.id).padStart(6, '0')}`)} - {room.title || room.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Tiêu đề bài đăng</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Để trống sẽ dùng tiêu đề phòng"
          />
        </label>

        <label className={styles.field}>
          <span>Nội dung bài đăng</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Để trống sẽ dùng mô tả phòng"
          />
        </label>

        {rooms.length === 0 ? (
          <div className={styles.error}>Chưa có phòng nào để đăng bài. Hãy tạo phòng trước.</div>
        ) : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className={styles.submit} disabled={isSaving || rooms.length === 0}>
            {isSaving ? 'Đang lưu...' : 'Tạo bài'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostFormModal;
