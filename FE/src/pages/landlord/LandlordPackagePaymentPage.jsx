import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, WalletCards } from 'lucide-react';
import { useCreateLandlordVnpayPaymentMutation, useGetLandlordPackageByIdQuery } from '../../features/landlord/api/landlordApi';
import { getApiErrorMessage } from '../../shared/utils/getApiErrorMessage';
import LandlordPageHeader from '../../features/landlord/components/LandlordPageHeader';
import styles from './LandlordPackagePaymentPage.module.css';

const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

const LandlordPackagePaymentPage = () => {
  const { packageId } = useParams();
  const { data, isLoading, isError } = useGetLandlordPackageByIdQuery({ packageId });
  const [createPayment, paymentState] = useCreateLandlordVnpayPaymentMutation();
  const pkg = data?.package;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payment = await createPayment({ packageId: pkg.id }).unwrap();
      window.location.assign(payment.payment_url);
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Không thể tạo giao dịch VNPAY.'));
    }
  };

  if (isLoading) return <div className={styles.loading}>Đang tải thông tin gói...</div>;
  if (isError || !pkg) {
    return (
      <div className={styles.loading}>
        Không tìm thấy gói. <Link to="/landlord/packages">Quay lại danh sách gói</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <LandlordPageHeader
        title="Thanh toán gói"
        subtitle="Giao dịch chỉ được kích hoạt sau khi VNPAY xác nhận thành công"
      />

      <div className={styles.breadcrumb}>
        <Link to="/landlord/packages">
          <ArrowLeft size={14} />
          Quay lại
        </Link>
        <span>Danh sách gói › Thanh toán › {pkg.name}</span>
      </div>

      <div className={styles.checkoutStack}>
        <aside className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Gói bạn chọn</h2>
              <p>Xem nhanh quyền lợi trước khi thực hiện thanh toán.</p>
            </div>
            <span className={styles.planBadge}>{pkg.durationLabel}</span>
          </div>

          <div className={styles.packageSummary}>
            <span>Gói {pkg.name}</span>
            <strong>{formatMoney(pkg.price)}đ</strong>
            <em>{pkg.durationLabel}</em>
          </div>

          <div className={styles.summaryBody}>
            <div className={styles.benefitsBlock}>
              <h3>Quyền lợi bao gồm</h3>
              <ul>
                {pkg.features
                  .filter((feature) => feature.included)
                  .map((feature) => (
                    <li key={feature.label}>
                      <Check size={16} />
                      {feature.label}
                    </li>
                  ))}
              </ul>
            </div>

            <div className={styles.totalRow}>
              <strong>Tổng cộng</strong>
              <span>{formatMoney(pkg.price)} VND</span>
            </div>
          </div>
        </aside>

        <form className={styles.paymentCard} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Thanh toán</h2>
              <p>Chọn phương thức và tiếp tục sang cổng thanh toán an toàn.</p>
            </div>
          </div>

          <section className={styles.methodList}>
            <div className={`${styles.methodItem} ${styles.methodActive}`}>
              <WalletCards size={22} />
              <span>
                <strong>VNPAY Sandbox</strong>
                <small>Thanh toán an toàn qua cổng VNPAY</small>
              </span>
            </div>
          </section>

          <div className={styles.cardNotice}>
            Bạn sẽ được chuyển tới VNPAY. Hệ thống chỉ cấp quyền lợi sau khi chữ ký, số tiền và trạng thái giao dịch
            được backend xác thực.
          </div>

          <div className={styles.paymentFooter}>
            <div className={styles.inlineTotal}>
              <span>Số tiền thanh toán</span>
              <strong>{formatMoney(pkg.price)}đ</strong>
            </div>

            <button className={styles.submitBtn} type="submit" disabled={paymentState.isLoading}>
              {paymentState.isLoading ? 'Đang tạo giao dịch...' : 'Thanh toán qua VNPAY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandlordPackagePaymentPage;
