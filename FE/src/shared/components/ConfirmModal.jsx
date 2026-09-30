import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, Check, CheckCircle, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'confirm',
}) => {
  const handleClose = onClose || onCancel;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isAlert = type === 'alert';
  const isSuccess = type === 'success';

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose} aria-label="Đóng">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className={`modal-icon ${type}`}>
            {isAlert && <AlertCircle size={28} />}
            {isSuccess && <CheckCircle size={28} />}
            {type === 'confirm' && <AlertTriangle size={28} />}
          </div>
          <h3 className="modal-title">{title}</h3>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          {type === 'confirm' && (
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              <X size={15} />
              {cancelText}
            </button>
          )}
          <button
            className={`modal-btn modal-btn-confirm ${(isAlert || isSuccess) ? 'modal-btn-full' : ''}`}
            onClick={onConfirm || onCancel}
          >
            <Check size={15} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
