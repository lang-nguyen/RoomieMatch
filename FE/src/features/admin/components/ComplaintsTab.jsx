import { useMemo, useState } from 'react';
import { useGetComplaintsQuery, useUpdateComplaintStatusMutation } from '../api/adminApi';
import { AdminIcon } from './adminIconMap';
import { formatNumber, paginate } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const complaintTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'processing', label: 'Đang xử lý' },
  { id: 'resolved', label: 'Đã giải quyết' },
  { id: 'rejected', label: 'Từ chối' },
];

const priorityLabels = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

const statusText = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  rejected: 'Từ chối',
};

export const ComplaintsTab = () => {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { data: complaints = [], isLoading, refetch } = useGetComplaintsQuery({ status, search });
  const { data: allComplaints = [] } = useGetComplaintsQuery({ status: 'all' });
  const [updateComplaintStatus] = useUpdateComplaintStatusMutation();
  const paged = paginate(complaints, page, 6);

  const summary = useMemo(
    () => [
      { label: 'Chờ xử lý', value: allComplaints.filter((item) => item.status === 'pending').length, icon: 'activity' },
      { label: 'Đang xử lý', value: allComplaints.filter((item) => item.status === 'processing').length, icon: 'eye' },
      { label: 'Đã giải quyết', value: allComplaints.filter((item) => item.status === 'resolved').length, icon: 'check' },
      { label: 'Từ chối', value: allComplaints.filter((item) => item.status === 'rejected').length, icon: 'x-circle' },
    ],
    [allComplaints]
  );
  const priorityLanes = useMemo(
    () =>
      ['high', 'medium', 'low'].map((priority) => ({
        priority,
        label: priorityLabels[priority],
        items: allComplaints.filter((item) => item.priority === priority && item.status !== 'resolved' && item.status !== 'rejected'),
      })),
    [allComplaints]
  );

  const handleStatus = async (id, nextStatus) => {
    await updateComplaintStatus({ id, status: nextStatus });
    refetch();
  };

  const handleView = async (item) => {
    setSelectedComplaint(item);
    if (item.status === 'pending') {
      await updateComplaintStatus({ id: item.id, status: 'processing' });
      refetch();
    }
  };

  return (
    <div className={styles.featureStack}>
      <section className={styles.featureStatsGrid}>
        {summary.map((item) => (
          <article key={item.label} className={styles.featureStatCard}>
            <span className={styles.featureStatIcon}>
              <AdminIcon name={item.icon} size={18} />
            </span>
            <div>
              <p>{item.label}</p>
              <strong>{formatNumber(item.value)}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.priorityLaneGrid}>
        {priorityLanes.map((lane) => (
          <article key={lane.priority} className={`${styles.priorityLane} ${styles[`priority${lane.priority}`]}`}>
            <div>
              <span>{lane.label}</span>
              <strong>{formatNumber(lane.items.length)}</strong>
            </div>
            <p>{lane.items[0]?.type || 'Không có khiếu nại cần ưu tiên'}</p>
          </article>
        ))}
      </section>

      <section className={styles.featurePanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Xử lý khiếu nại</h2>
            <p>Ưu tiên các phản ánh rủi ro cao và theo dõi người phụ trách</p>
          </div>
          <label className={styles.controlWithIcon}>
            <AdminIcon name="search" size={15} />
            <input
              type="search"
              placeholder="Tìm người gửi hoặc nội dung..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        <div className={styles.tabGroup}>
          {complaintTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabButton} ${status === tab.id ? styles.tabButtonActive : ''}`}
              onClick={() => {
                setStatus(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tableScroller}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Người gửi</th>
                <th>Loại khiếu nại</th>
                <th>Ưu tiên</th>
                <th>Trạng thái</th>
                <th>Phụ trách</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8">Đang tải khiếu nại...</td>
                </tr>
              ) : (
                paged.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className={styles.strongCell}>{item.sender}</td>
                    <td>{item.type}</td>
                    <td>
                      <span
                        className={`${styles.dataBadge} ${
                          item.priority === 'high' ? styles.badgeDanger : item.priority === 'medium' ? styles.badgeWarning : styles.badgeInfo
                        }`}
                      >
                        {item.priorityLabel}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.dataBadge} ${
                          item.status === 'resolved'
                            ? styles.badgeSuccess
                            : item.status === 'pending'
                              ? styles.badgeWarning
                              : item.status === 'rejected'
                                ? styles.badgeDanger
                                : styles.badgeInfo
                        }`}
                      >
                        {item.statusLabel || statusText[item.status]}
                      </span>
                    </td>
                    <td>{item.assignee}</td>
                    <td>{item.date}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.actionButton} title="Xem chi tiết" onClick={() => handleView(item)}>
                          <AdminIcon name="eye" size={14} />
                        </button>
                        <button type="button" className={styles.actionButton} title="Đóng" onClick={() => handleStatus(item.id, 'resolved')}>
                          <AdminIcon name="check" size={14} />
                        </button>
                        <button type="button" className={styles.actionButton} title="Từ chối" onClick={() => handleStatus(item.id, 'rejected')}>
                          <AdminIcon name="x-circle" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginationWrap}>
          <span>
            Trang {paged.page}/{paged.totalPages}
          </span>
          <div>
            <button type="button" disabled={paged.page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Trước
            </button>
            <button
              type="button"
              disabled={paged.page === paged.totalPages}
              onClick={() => setPage((value) => Math.min(paged.totalPages, value + 1))}
            >
              Sau
            </button>
          </div>
        </div>
      </section>

      {selectedComplaint && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setSelectedComplaint(null)}>
          <section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Chi tiết khiếu nại</h2>
                <p>{selectedComplaint.id} từ {selectedComplaint.sender}</p>
              </div>
              <button type="button" className={styles.actionButton} onClick={() => setSelectedComplaint(null)}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <article>
                <span>Loại khiếu nại</span>
                <strong>{selectedComplaint.type}</strong>
              </article>
              <article>
                <span>Mức ưu tiên</span>
                <strong>{selectedComplaint.priorityLabel}</strong>
              </article>
              <article>
                <span>Phụ trách</span>
                <strong>{selectedComplaint.assignee}</strong>
              </article>
              <article>
                <span>Ngày gửi</span>
                <strong>{selectedComplaint.date}</strong>
              </article>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.buttonSmall} onClick={() => handleStatus(selectedComplaint.id, 'rejected')}>
                <AdminIcon name="x-circle" size={13} />
                Từ chối
              </button>
              <button type="button" className={`${styles.buttonSmall} ${styles.buttonPrimary}`} onClick={() => handleStatus(selectedComplaint.id, 'resolved')}>
                <AdminIcon name="check" size={13} />
                Đóng khiếu nại
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

