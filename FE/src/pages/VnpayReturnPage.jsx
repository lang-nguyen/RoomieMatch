import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { baseApi } from '../shared/api/baseApi';
import { selectCurrentUser } from '../features/auth/slice';
import styles from './VnpayReturnPage.module.css';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null');
  } catch {
    return null;
  }
};

const getAccountType = (user) => user?.account_type || user?.accountType || user?.role || '';

const VnpayReturnPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const queryString = searchParams.toString();
  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef') || '';
  const [status, setStatus] = useState(txnRef ? 'loading' : 'fail');

  useEffect(() => {
    if (!txnRef) return;

    fetch(`/api/v1/payments/vnpay/ipn?${queryString}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const isSuccess = ['00', '02'].includes(data.RspCode) && responseCode === '00';
        if (isSuccess) {
          dispatch(baseApi.util.invalidateTags(['Packages']));
        }
        setStatus(isSuccess ? 'success' : 'fail');
      })
      .catch((error) => {
        console.error('VNPAY verification error:', error);
        setStatus('fail');
      });
  }, [dispatch, queryString, responseCode, txnRef]);

  const amount = searchParams.get('vnp_Amount') ? parseInt(searchParams.get('vnp_Amount'), 10) / 100 : 0;
  const bankCode = searchParams.get('vnp_BankCode') || 'N/A';
  const orderInfo = searchParams.get('vnp_OrderInfo') || '';
  const user = currentUser || getStoredUser();
  const isLandlord = getAccountType(user) === 'landlord' || location.pathname.startsWith('/landlord');
  const benefitsPath = isLandlord ? '/landlord/package-management' : '/user/package-management';
  const homePath = isLandlord ? '/landlord' : '/';
  const successMessage = isLandlord
    ? 'Giao dịch đã được xác nhận. Gói chủ trọ sẽ được cập nhật trong trang quản lý gói.'
    : 'Giao dịch đã được xác nhận. Gói dịch vụ của bạn sẽ được cập nhật trong trang quản lý gói.';
  const failMessage = isLandlord
    ? 'Giao dịch không thành công hoặc đã bị hủy. Bạn có thể quay lại danh sách gói chủ trọ để thanh toán lại.'
    : 'Giao dịch không thành công hoặc đã bị hủy. Hệ thống đã cập nhật lại trạng thái đơn mua để không bị treo chờ xác nhận.';
  const primarySuccessLabel = isLandlord ? 'Xem quản lý gói chủ trọ' : 'Xem quản lý gói';
  const primaryFailLabel = isLandlord ? 'Chọn lại gói chủ trọ' : 'Thử lại ngay';
  const secondaryLabel = isLandlord ? 'Về trang chủ trọ' : 'Về trang chủ';

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <div className={styles.content}>
            <div className={styles.spinner}></div>
            <h2 className={styles.loadingText}>Đang xử lý kết quả...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.content}>
            <div className={styles.iconWrapperSuccess}>
              <CheckCircle className={styles.successIcon} size={56} />
            </div>
            <h1 className={styles.successTitle}>Thanh toán thành công!</h1>
            <p className={styles.message}>{successMessage}</p>

            <div className={styles.receiptBox}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Mã giao dịch:</span>
                <span className={styles.receiptValue}>{txnRef}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Ngân hàng:</span>
                <span className={styles.receiptValue}>{bankCode}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Nội dung:</span>
                <span className={styles.receiptValue}>{orderInfo}</span>
              </div>
              <div className={styles.receiptDivider}></div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Tổng tiền:</span>
                <span className={styles.receiptTotal}>{amount.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.primaryBtn} onClick={() => navigate(benefitsPath)}>
                {primarySuccessLabel}
              </button>
              <button className={styles.secondaryBtn} onClick={() => navigate(homePath)}>
                {secondaryLabel}
              </button>
            </div>
          </div>
        )}

        {status === 'fail' && (
          <div className={styles.content}>
            <div className={styles.iconWrapperFail}>
              <XCircle className={styles.failIcon} size={56} />
            </div>
            <h1 className={styles.failTitle}>Thanh toán thất bại</h1>
            <p className={styles.message}>{failMessage}</p>

            <div className={styles.actionButtons}>
              <button className={styles.primaryBtnFail} onClick={() => navigate(benefitsPath)}>
                {primaryFailLabel}
              </button>
              <button className={styles.secondaryBtn} onClick={() => navigate(homePath)}>
                {secondaryLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VnpayReturnPage;
