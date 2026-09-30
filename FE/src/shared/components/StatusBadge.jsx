const STATUS_CONFIG = {
  available: { label: 'Trống', className: 'available' },
  rented: { label: 'Đã thuê', className: 'rented' },
  negotiating: { label: 'Thương lượng', className: 'negotiating' },
};

/**
 * StatusBadge — hiển thị trạng thái phòng trọ.
 * Dùng plain CSS classes (không dùng CSS Modules) để tái sử dụng linh hoạt.
 */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'available' };
  return (
    <span className={`status-badge status-badge--${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
