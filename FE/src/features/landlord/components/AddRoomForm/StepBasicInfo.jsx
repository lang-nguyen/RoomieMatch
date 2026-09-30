import { ChevronRight } from 'lucide-react';
import { useAddRoomForm } from '../../hooks/useAddRoomForm';
import { useGetPublicCategoriesQuery } from '../../api/landlordApi';
import styles from './StepForm.module.css';

const StepBasicInfo = () => {
  const { draft, updateDraft, goNext } = useAddRoomForm();
  const { data } = useGetPublicCategoriesQuery();
  const roomTypes = data?.room_types || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateDraft({ [name]: value });
  };

  const handleNext = (event) => {
    event.preventDefault();
    goNext();
  };

  return (
    <form className={styles.formContainer} onSubmit={handleNext}>
      <h2 className={styles.sectionTitle}>Thông tin cơ bản</h2>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tên phòng trọ <span className={styles.required}>*</span></label>
        <input required name="name" value={draft.name || ''} onChange={handleChange} placeholder="VD: Phòng trọ Lê Lợi, Mini studio Nguyễn Trãi..." className={styles.input} />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Loại phòng <span className={styles.required}>*</span></label>
          <select required name="room_type" value={draft.room_type || ''} onChange={handleChange} className={styles.select}>
            <option value="">Chọn loại phòng</option>
            {roomTypes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Diện tích (m²) <span className={styles.required}>*</span></label>
          <input required type="number" name="area" value={draft.area || ''} onChange={handleChange} placeholder="VD: 25" className={styles.input} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Số người tối đa</label>
          <input type="number" name="capacity" value={draft.capacity || ''} onChange={handleChange} placeholder="2 người" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tầng</label>
          <input name="floor" value={draft.floor || ''} onChange={handleChange} placeholder="VD: 2" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Số phòng ngủ</label>
          <select name="bedroom_count" value={draft.bedroom_count || '1'} onChange={handleChange} className={styles.select}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
            <option value="Studio">Studio</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Mô tả phòng</label>
        <textarea name="description" value={draft.description || ''} onChange={handleChange} placeholder="Mô tả chi tiết về phòng trọ, không gian, đặc điểm nổi bật..." className={styles.textarea} rows={4} />
      </div>

      <div className={styles.footer}>
        <button type="submit" className={styles.nextBtn}>Tiếp theo <ChevronRight size={15} /></button>
      </div>
    </form>
  );
};

export default StepBasicInfo;
