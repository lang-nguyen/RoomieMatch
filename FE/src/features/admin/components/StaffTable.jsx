import { AdminIcon } from './adminIconMap';
import { DashboardCard } from './DashboardCard';
import styles from './AdminDashboard.module.css';

const roleClassByTone = {
  manager: styles.roleManager,
  support: styles.roleSupport,
  editor: styles.roleEditor,
};

export const StaffTable = ({ staff }) => {
  const action = (
    <button type="button" className={`${styles.buttonSmall} ${styles.buttonPrimary}`}>
      <AdminIcon name="plus" size={13} strokeWidth={2.5} />
      Thêm
    </button>
  );

  return (
    <DashboardCard title="Nhân viên đang hoạt động" icon="users" action={action}>
      <div className={styles.staffTableWrap}>
        <table className={styles.staffTable}>
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hoạt động</th>
              <th aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td>
                  <span className={styles.staffName}>{member.username}</span>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${roleClassByTone[member.roleTone] || ''}`}>{member.role}</span>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      member.status === 'online' ? styles.statusOnline : styles.statusOffline
                    }`}
                  >
                    <span className={styles.statusDot} />
                    {member.statusLabel}
                  </span>
                </td>
                <td className={member.isMuted ? styles.mutedText : ''}>{member.activity}</td>
                <td>
                  <button type="button" className={styles.actionButton} aria-label={`Mở ${member.username}`}>
                    <AdminIcon name="external" size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
};
