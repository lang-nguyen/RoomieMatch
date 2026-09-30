import { useState, useMemo } from 'react';
import { Search, ArrowLeft, Zap, Star, Package as PackageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetPackageHistoryQuery, useGetAllPackagesQuery } from '../api/userApi';
import styles from './PackageHistory.module.css';

const formatCurrency = (cents) => {
  if (!cents && cents !== 0) return '0 VND';
  return `${cents.toLocaleString('vi-VN')} VND`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const translateStatus = (status) => {
  const lower = String(status).toLowerCase();
  if (lower === 'paid') return 'Đã thanh toán';
  if (lower === 'pending') return 'Đang chờ thanh toán';
  if (lower === 'failed') return 'Thanh toán thất bại';
  return status;
};

const getStatusClass = (status) => {
  const translated = translateStatus(status);
  switch (translated) {
    case 'Đã thanh toán': return styles.statusActive;
    case 'Đang chờ thanh toán': return styles.statusPending;
    case 'Thanh toán thất bại': return styles.statusExpired;
    default: return '';
  }
};

const PackageHistory = () => {
  const navigate = useNavigate();
  const { data: packages = [], isLoading, isError } = useGetPackageHistoryQuery();
  const { data: allPackages = [] } = useGetAllPackagesQuery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const mappedPackages = useMemo(() => {
    return packages.map(pkg => {
      const packageInfo = allPackages.find(p => p.id === pkg.package_id) || {};
      return {
        ...pkg,
        name: packageInfo.name || `Gói dịch vụ #${pkg.package_id}`,
        slug: packageInfo.slug || 'free-tier'
      };
    });
  }, [packages, allPackages]);

  const filteredAndSortedPackages = useMemo(() => {
    let result = [...mappedPackages];

    // Filter by name
    if (searchTerm) {
      result = result.filter(pkg =>
        (pkg.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [mappedPackages, searchTerm, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <button 
            className={styles.backBtn}
            onClick={() => navigate('/user/package-management')}
          >
            <ArrowLeft className={styles.backIcon} />
          </button>
          <h1 className={styles.pageTitle}>Lịch sử mua gói</h1>
        </div>
      </div>

      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {isLoading ? (
        <div>Đang tải lịch sử gói...</div>
      ) : isError ? (
        <div>Đã có lỗi xảy ra khi tải dữ liệu.</div>
      ) : (
        <div className={styles.packagesList}>
          {filteredAndSortedPackages.map(pkg => (
            <div key={pkg.id} className={styles.card}>
              <div className={styles.packageInfo}>
                <div
                  className={`${styles.iconBox} ${pkg.slug === 'pro-vip-tier' ? styles.iconVip : pkg.slug === 'basic-tier' ? styles.iconBasic : styles.iconFree}`}
                >
                  {pkg.slug === 'pro-vip-tier' ? <Zap size={32} /> : pkg.slug === 'basic-tier' ? <Star size={32} /> : <PackageIcon size={32} />}
                </div>

                <div className={styles.namePrice}>
                  <h3 className={styles.name}>{pkg.name}</h3>
                  <div className={styles.price}>{formatCurrency(pkg.amount_cents)}</div>
                </div>
              </div>

              <div className={styles.dates}>
                <div className={styles.dateRow}>
                  <span className={styles.dateLabel}>Ngày mua:</span>
                  <span className={styles.dateValue}>{formatDate(pkg.created_at)}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <div className={`${styles.statusTag} ${getStatusClass(pkg.status)}`}>
                  {translateStatus(pkg.status)}
                </div>
              </div>
            </div>
          ))}
          {filteredAndSortedPackages.length === 0 && <div>Chưa có lịch sử mua gói.</div>}
        </div>
      )}
    </div>
  );
};

export default PackageHistory;
