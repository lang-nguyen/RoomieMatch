import { Check, ChevronLeft, Home, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAddRoomForm } from '../../hooks/useAddRoomForm';
import StepBasicInfo from './StepBasicInfo';
import StepAmenities from './StepAmenities';
import StepLocation from './StepLocation';
import StepConfirm from './StepConfirm';
import styles from './AddRoomForm.module.css';

const STEPS = [
  { id: 0, label: 'Thông tin cơ bản' },
  { id: 1, label: 'Hình ảnh & tiện ích' },
  { id: 2, label: 'Vị trí & chi phí' },
  { id: 3, label: 'Xác nhận' },
];

const AddRoomForm = () => {
  const navigate = useNavigate();
  const { currentStep, goToStep, isEditing, handleSubmit, isSubmitting, error, successMessage } = useAddRoomForm();

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepBasicInfo />;
      case 1: return <StepAmenities />;
      case 2: return <StepLocation />;
      case 3: return <StepConfirm />;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.titleIcon}><Home size={19} /></span>
          <div>
            <h1 className={styles.title}>{isEditing ? 'Chỉnh sửa phòng trọ' : 'Thêm trọ mới'}</h1>
            <p className={styles.subtitle}>{isEditing ? 'Cập nhật thông tin và hình ảnh phòng trọ' : 'Điền đầy đủ thông tin để tạo hồ sơ phòng trọ'}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={() => navigate('/landlord/rooms')}>
            <ChevronLeft size={16} /> Quay lại
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={isSubmitting}>
            <Save size={15} /> Lưu phòng trọ
          </button>
        </div>
      </div>

      <div className={styles.stepper}>
        {STEPS.map((step, index) => (
          <div key={step.id} className={styles.stepWrapper}>
            <button
              className={`${styles.stepIndicator} ${currentStep === step.id ? styles.stepActive : ''} ${currentStep > step.id ? styles.stepCompleted : ''}`}
              onClick={() => (isEditing || currentStep > step.id) && goToStep(step.id)}
              disabled={!isEditing && currentStep < step.id}
            >
              <div className={styles.stepCircle}>
                {currentStep > step.id ? <Check size={13} /> : step.id + 1}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${currentStep > step.id ? styles.stepLineActive : ''}`} />
            )}
          </div>
        ))}
      </div>

      {error ? <div className={styles.errorNotice}>{error}</div> : null}
      {successMessage ? <div className={styles.successNotice}>{successMessage}</div> : null}

      <div className={styles.content}>{renderStep()}</div>
    </div>
  );
};

export default AddRoomForm;
