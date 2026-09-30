import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useGetLandlordPackageHistoryQuery } from '../../features/landlord/api/landlordApi';
import LandlordPageHeader from '../../features/landlord/components/LandlordPageHeader';
import styles from './LandlordPackageManagementPage.module.css';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;
const formatDate = (value) => (value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : 'Chưa cập nhật');
const getStatusLabel = (status) => {
  if (status === 'active') return 'Đang kích hoạt';
  if (status === 'pending') return 'Đang chờ xác nhận';
  if (status === 'failed') return 'Thanh toán thất bại';
  if (status === 'cancelled') return 'Đã hủy';
  if (status === 'paid') return 'Đã thanh toán';
  return status || 'Chưa cập nhật';
};

const getStatusClass = (status) => {
  if (status === 'active') return styles.statusActive;
  if (status === 'pending') return styles.statusPending;
  if (status === 'failed' || status === 'cancelled') return styles.statusFailed;
  if (status === 'paid') return styles.statusPaid;
  return styles.statusDefault;
};

const LandlordPackageManagementPage = () => {
  const { data, isLoading } = useGetLandlordPackageHistoryQuery();
  const history = data?.items ?? [];

  return (
    <div className={styles.page}>
      <LandlordPageHeader
        icon={Package}
        title="Quản lý gói"
        subtitle="Theo dõi lịch sử mua, thời hạn và trạng thái các gói đang sử dụng"
      />

      <section className={styles.section}>
        <h2>Lịch sử mua</h2>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Gói</th>
                <th>Giá</th>
                <th>Ngày mua</th>
                <th>Ngày đến hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className={styles.empty}>Đang tải lịch sử mua...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="6" className={styles.empty}>Chưa có lịch sử mua gói.</td></tr>
              ) : history.map((item) => (
                <tr key={item.id}>
                  <td className={styles.packageName}>{item.packageName}</td>
                  <td>{formatMoney(item.price)}</td>
                  <td className={styles.date}>{formatDate(item.purchaseDate)}</td>
                  <td>{formatDate(item.expiredDate)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <Link className={styles.detailLink} to={`/landlord/package-management/${item.id}`}>
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LandlordPackageManagementPage;
