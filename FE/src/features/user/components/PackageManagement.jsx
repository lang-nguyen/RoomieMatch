import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './PackageManagement.module.css';
import { useState } from 'react';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import { useGetAllPackagesQuery, useGetPackageEntitlementsQuery, useGetPackageHistoryQuery, useCreateVnpayPaymentMutation } from '../api/userApi';

const translateFeatureKey = (key) => {
  const map = {
    'post_limit': 'Giới hạn bài đăng',
    'push_to_top': 'Đẩy tin lên top',
    'contact_views': 'Lượt xem liên hệ',
    'support_priority': 'Ưu tiên hỗ trợ',
    'chatbot': 'Sử dụng Chatbot AI',
    'match': 'Lượt ghép phòng',
    'active_subscription': 'Thời hạn gói dịch vụ'
  };
  return map[key] || key;
};

const getPackageDisplayFeatures = (pkg) => {
  let rawFeatures;
  try {
    rawFeatures = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : (pkg.features || {});
  } catch {
    rawFeatures = {};
  }

  if (Array.isArray(rawFeatures)) {
    return rawFeatures.filter(Boolean);
  }

  if (rawFeatures && typeof rawFeatures === 'object') {
    const list = rawFeatures.list || rawFeatures.features || rawFeatures.benefits || rawFeatures.items;
    if (Array.isArray(list) && list.length) {
      return list.filter(Boolean);
    }
  }

  return [];
};

const PackageManagement = () => {
  const navigate = useNavigate();
  const { data: packages, isLoading: isLoadingPackages } = useGetAllPackagesQuery();
  const { data: entitlements, isLoading: isLoadingEntitlements } = useGetPackageEntitlementsQuery();
  const { data: purchaseHistory = [], isLoading: isLoadingHistory } = useGetPackageHistoryQuery();
  const [createVnpayPayment, { isLoading: isPurchasing }] = useCreateVnpayPaymentMutation();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'alert', message: '', title: 'Thông báo' });

  const handlePurchaseClick = (pkgId) => {
    setSelectedPkgId(pkgId);
    setShowConfirmModal(true);
  };

  const handlePurchase = async () => {
    setShowConfirmModal(false);
    if (!selectedPkgId) return;

    try {
      const response = await createVnpayPayment({ package_id: selectedPkgId }).unwrap();
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        throw new Error('No payment url returned');
      }
    } catch {
      setAlertModal({ isOpen: true, type: 'alert', message: 'Tạo thanh toán VNPAY thất bại. Xin vui lòng thử lại.', title: 'Lỗi' });
    }
    setSelectedPkgId(null);
  };

  if (isLoadingPackages || isLoadingEntitlements || isLoadingHistory) {
    return <div className={styles.container}>Đang tải...</div>;
  }

  // Find active entitlements
  const hasEntitlements = entitlements && entitlements.length > 0;
  
  // Identify the currently owned package
  const activePurchase = purchaseHistory.find(p => p.status && p.status.toLowerCase() === 'paid');
  const activePackageInfo = packages && activePurchase ? packages.find(pkg => pkg.id === activePurchase.package_id) : null;
  const activePackageName = activePackageInfo ? activePackageInfo.name : (hasEntitlements ? 'Gói Hiện Tại' : 'Chưa có gói');
  
  const activeSubEntitlement = entitlements?.find(e => e.feature_key === 'active_subscription');
  const expirationDate = activeSubEntitlement?.expires_at 
    ? new Date(activeSubEntitlement.expires_at).toLocaleDateString('vi-VN') 
    : 'Không giới hạn';
    
  const handleCancelPackage = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy gói dịch vụ hiện tại không? Quyền lợi của bạn sẽ bị mất ngay lập tức.')) {
      window.alert('Tính năng Hủy gói đang được phát triển (Cần Backend cung cấp API hủy). Vui lòng liên hệ CSKH!');
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>Quản lý gói dịch vụ</h1>
          <button 
            className={styles.historyBtn}
            onClick={() => navigate('/user/package-history')}
          >
            Lịch sử giao dịch <ArrowRight size={18} />
          </button>
        </div>
        <p className={styles.pageSubtitle}>
          Xem thông tin chi tiết và quyền lợi các gói dịch vụ của bạn.
        </p>
      </div>

      {!hasEntitlements && (
        <div className={styles.mainCard} style={{marginBottom: '40px'}}>
          <div className={styles.emptyState}>
            Bạn hiện chưa có quyền lợi gói dịch vụ nào đang kích hoạt. Hãy chọn mua một gói dịch vụ bên dưới nhé.
          </div>
        </div>
      )}

      {hasEntitlements && (
        <div className={styles.mainCard} style={{marginBottom: '40px'}}>
          <div className={styles.mainCardHeader}>
            <div>
              <div className={styles.activeTag}>
                <Check className={styles.checkIcon} />
                Đang kích hoạt
              </div>
              <h2 className={styles.packageName}>{activePackageName}</h2>
              <div className={styles.packageStatus}>Trạng thái: Hoạt động tốt</div>
            </div>
            <div className={styles.nextRenewal}>
              <div className={styles.renewalLabel}>Ngày hết hạn chung</div>
              <div className={styles.renewalDate}>{expirationDate}</div>
              <button className={styles.cancelBtn} onClick={handleCancelPackage}>
                Hủy gói
              </button>
            </div>
          </div>
          
          <div className={styles.entitlementsSection}>
            <h3 className={styles.entitlementsTitle}>Quyền lợi khả dụng:</h3>
            <div className={styles.entitlementsGrid}>
              {entitlements.filter(e => e.feature_key !== 'active_subscription').map(ent => (
                <div key={ent.id} className={styles.entitlementItem}>
                  <div className={styles.entIcon}><Check size={16} /></div>
                  <div className={styles.entDetails}>
                    <span className={styles.entName}>{translateFeatureKey(ent.feature_key)}</span>
                    <span className={styles.entQty}>
                      {ent.quantity == null || ent.quantity > 1000 ? 'Không giới hạn' : `Còn lại: ${ent.quantity} lượt`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.bottomSection}>
        <div className={styles.actionCard} style={{ width: '100%', border: 'none', boxShadow: 'none', padding: 0, background: 'transparent' }}>
          <h3 className={styles.cardTitle}>Mua gói dịch vụ mới</h3>
          <div className={styles.packageGrid}>
            {packages && packages.map(pkg => {
              const isFreePackage = !pkg.price_cents || pkg.price_cents === 0;
              const isActivePaidPackage = activePurchase && activePurchase.package_id === pkg.id;
              const isCurrentlyOwned = isActivePaidPackage || (!activePurchase && isFreePackage);

              return (
                <div key={pkg.id} className={`${styles.pricingCard} ${pkg.slug === 'pro-vip-tier' ? styles.pricingCardVip : ''}`}>
                  <div className={styles.pricingHeader}>
                    <h3 className={styles.pricingName}>{pkg.name}</h3>
                    <div className={styles.pricingPrice}>
                      {pkg.price_cents ? pkg.price_cents.toLocaleString('vi-VN') : '0'}
                      <span className={styles.pricingCurrency}>VND</span>
                    </div>
                    <p className={styles.pricingDesc}>{pkg.description}</p>
                  </div>
                  
                  <ul className={styles.pricingFeatures}>
                    {(() => {
                      const displayList = getPackageDisplayFeatures(pkg);
                      const fallbackList = displayList.length ? displayList : ['Nâng cấp trải nghiệm', 'Hỗ trợ ưu tiên'];

                      return fallbackList.map((feature, idx) => (
                        <li key={idx} className={styles.pricingFeature}>
                          <Check className={styles.featureIcon} size={18} />
                          <span>{feature}</span>
                        </li>
                      ));
                    })()}
                  </ul>

                  {isCurrentlyOwned ? (
                    <button className={styles.pricingBtnOwned} disabled>
                      Đang sở hữu
                    </button>
                  ) : (
                    <button 
                      className={styles.pricingBtn} 
                      onClick={() => handlePurchaseClick(pkg.id)}
                      disabled={isPurchasing}
                    >
                      Mua gói ngay
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Xác nhận mua gói"
        message="Bạn có chắc chắn muốn mua gói dịch vụ này không?"
        confirmText="Mua ngay"
        cancelText="Hủy"
        onConfirm={handlePurchase}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedPkgId(null);
        }}
      />

      <ConfirmModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Đóng"
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
        onCancel={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};

export default PackageManagement;
