import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAddRoomForm } from '../../hooks/useAddRoomForm';
import { useDeleteLandlordRoomImageMutation, useGetPublicCategoriesQuery } from '../../api/landlordApi';
import ConfirmModal from '../../../../shared/components/ConfirmModal';
import { getAddRoomImageFiles, setAddRoomImageFiles } from '../../utils/addRoomImageFiles';
import styles from './StepForm.module.css';



const StepAmenities = () => {
  const { draft, updateDraft, goNext, goBack } = useAddRoomForm();
  const { roomId } = useParams();
  const [deleteRoomImage, deleteImageState] = useDeleteLandlordRoomImageMutation();
  const { data } = useGetPublicCategoriesQuery();
  const [imageError, setImageError] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState(null);
  
  const availableAmenities = data?.amenities?.map(a => a.name) || [];

  const selectedAmenities = useMemo(() => draft.amenities || [], [draft.amenities]);
  const selectedImageMeta = useMemo(() => draft.image_files_meta || [], [draft.image_files_meta]);
  const selectedImages = getAddRoomImageFiles();
  const existingImages = draft.existing_images || [];
  const previews = useMemo(
    () => selectedImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedImageMeta],
  );

  useEffect(() => () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const handleToggle = (item) => {
    const newSelected = selectedAmenities.includes(item)
      ? selectedAmenities.filter((a) => a !== item)
      : [...selectedAmenities, item];
    updateDraft({ amenities: newSelected });
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = [];
    const invalid = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalid.push(`${file.name}: không phải file ảnh`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        invalid.push(`${file.name}: vượt quá 5MB`);
        return;
      }
      validFiles.push(file);
    });

    const nextImages = [...selectedImages, ...validFiles].slice(0, 10);
    setAddRoomImageFiles(nextImages);
    updateDraft({
      image_files_meta: nextImages.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    });
    setImageError(invalid.join('. '));
    event.target.value = '';
  };

  const removeLocalImage = (index) => {
    const nextImages = selectedImages.filter((_, itemIndex) => itemIndex !== index);
    setAddRoomImageFiles(nextImages);
    updateDraft({
      image_files_meta: nextImages.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    });
  };

  const removeExistingImage = async (image) => {
    await deleteRoomImage({ roomId, imageId: image.id }).unwrap();
    updateDraft({ existing_images: existingImages.filter((item) => item.id !== image.id) });
  };

  const handleNext = (e) => {
    e.preventDefault();
    goNext();
  };

  return (
    <form className={styles.formContainer} onSubmit={handleNext}>
      <h2 className={styles.sectionTitle}>Hình ảnh phòng trọ</h2>
      <label className={styles.uploadBox}>
        <Upload className={styles.uploadIcon} size={28} />
        <div className={styles.uploadText}>
          <span>Chọn ảnh phòng</span> để tải lên khi lưu
        </div>
        <div style={{ fontSize: 11, color: '#aaa' }}>PNG, JPG, WEBP - Tối đa 10 ảnh, mỗi ảnh &lt; 5MB</div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className={styles.fileInput}
          onChange={handleImageChange}
        />
      </label>

      {imageError ? <div className={styles.errorText}>{imageError}</div> : null}

      {previews.length > 0 ? (
        <div className={styles.previewGrid}>
          {previews.map((preview, index) => (
            <div key={`${preview.file.name}-${preview.file.size}-${index}`} className={styles.previewItem}>
              <img src={preview.url} alt={preview.file.name} />
              <button type="button" onClick={() => setPendingRemoval({ type: 'local', index })}>Xóa</button>
            </div>
          ))}
        </div>
      ) : null}

      {existingImages.length > 0 && (
        <div className={styles.previewGrid}>
          {existingImages.map((image) => (
            <div key={image.id} className={styles.previewItem}>
              <img src={image.image_url} alt="Ảnh phòng hiện có" />
              <button
                type="button"
                disabled={deleteImageState.isLoading}
                onClick={() => setPendingRemoval({ type: 'existing', image })}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle} style={{ marginTop: 16 }}>Tiện ích phòng</h2>
        <div className={styles.checkboxGrid}>
          {availableAmenities.map((item) => (
            <label key={item} className={styles.checkboxLabel}>
              <input 
                type="checkbox"
                checked={selectedAmenities.includes(item)}
                onChange={() => handleToggle(item)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{item}</span>
            </label>
          ))}
        </div>

      <div className={styles.footer}>
        <button type="button" className={styles.backBtn} onClick={goBack}><ChevronLeft size={15} /> Quay lại</button>
        <button type="submit" className={styles.nextBtn}>Tiếp theo <ChevronRight size={15} /></button>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingRemoval)}
        title="Xác nhận xóa ảnh phòng"
        message="Bạn có chắc muốn xóa ảnh này khỏi phòng trọ?"
        confirmText="Xóa ảnh"
        cancelText="Hủy"
        onCancel={() => setPendingRemoval(null)}
        onClose={() => setPendingRemoval(null)}
        onConfirm={async () => {
          if (pendingRemoval?.type === 'local') {
            removeLocalImage(pendingRemoval.index);
          }
          if (pendingRemoval?.type === 'existing') {
            await removeExistingImage(pendingRemoval.image);
          }
          setPendingRemoval(null);
        }}
      />
    </form>
  );
};

export default StepAmenities;
