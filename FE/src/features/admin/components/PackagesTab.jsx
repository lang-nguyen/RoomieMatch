import { useMemo, useState } from 'react';
import {
  useCreatePackageMutation,
  useDeletePackageMutation,
  useGetPackagesQuery,
  useGetRoleFeaturesQuery,
  useUpdatePackageMutation,
  useUpdatePackageStatusMutation,
} from '../api/adminApi';
import { AdminIcon, AVAILABLE_ICONS } from './adminIconMap';
import { formatCurrency, formatNumber, labelFromOptions, normalizeText } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const packageTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'landlord', label: 'Chủ trọ' },
  { id: 'tenant', label: 'Khách thuê' },
  { id: 'suspended', label: 'Tạm ngưng' },
];

const targetOptions = [
  { value: 'landlord', label: 'Chủ trọ' },
  { value: 'tenant', label: 'Khách thuê' },
];

const statusOptions = [
  { value: 'active', label: 'Đang bán' },
  { value: 'suspended', label: 'Tạm ngưng' },
];



const emptyPackage = {
  name: '',
  description: '',
  icon: 'package',
  target_role: 'landlord',
  pricePerMonth: 99000,
  duration: '30 ngày',
  features: [],
  status: 'active',
};

const getPackageRevenue = (item) => item.totalPurchased * item.pricePerMonth;
const getNumericId = (id) => Number.parseInt(String(id).replace(/\D/g, ''), 10);

export const PackagesTab = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [editingPackage, setEditingPackage] = useState(undefined);
  const [form, setForm] = useState(emptyPackage);
  const { data: responseData, isLoading, refetch } = useGetPackagesQuery();
  const allPackages = responseData?.items || responseData || [];
  
  const { data: roleFeaturesData } = useGetRoleFeaturesQuery();
  const allRoleFeatures = roleFeaturesData?.items || roleFeaturesData || [];

  const featureDefinitions = useMemo(() => {
    const defs = { tenant: [], landlord: [], all: [] };
    allRoleFeatures.forEach(rf => {
      if (rf.active) {
        if (!defs[rf.target_role]) defs[rf.target_role] = [];
        defs[rf.target_role].push({ key: rf.feature_key, label: rf.feature_name });
      }
    });
    return defs;
  }, [allRoleFeatures]);

  const [createPackage] = useCreatePackageMutation();
  const [updatePackage] = useUpdatePackageMutation();
  const [updatePackageStatus] = useUpdatePackageStatusMutation();
  const [deletePackage] = useDeletePackageMutation();

  const filteredPackages = useMemo(() => {
    let result = allPackages;
    
    if (activeTab !== 'all') {
      result = result.filter(p => p.status === activeTab || p.target_role === activeTab);
    }

    const keyword = normalizeText(search);
    if (!keyword) return result;

    return result.filter((item) =>
      [item.name, item.id, item.target_role === 'landlord' ? 'Chủ trọ' : 'Khách thuê', item.statusLabel].some((value) => normalizeText(value).includes(keyword))
    );
  }, [allPackages, search, activeTab]);

  const summary = useMemo(
    () => [
      { label: 'Tổng gói', value: allPackages.length, icon: 'package' },
      { label: 'Đang bán', value: allPackages.filter((item) => item.status === 'active').length, icon: 'check' },
      { label: 'Lượt mua', value: allPackages.reduce((sum, item) => sum + item.totalPurchased, 0), icon: 'shopping-cart' },
      { label: 'Doanh thu ước tính', value: allPackages.reduce((sum, item) => sum + getPackageRevenue(item), 0), icon: 'dollar-sign', currency: true },
    ],
    [allPackages]
  );
  const bestSeller = useMemo(
    () => [...allPackages].sort((first, second) => second.totalPurchased - first.totalPurchased)[0],
    [allPackages]
  );
  const maxPurchased = Math.max(...allPackages.map((item) => item.totalPurchased), 1);

  const openCreate = () => {
    setEditingPackage(null);
    setForm(emptyPackage);
  };

  const openEdit = (item) => {
    setEditingPackage(item);
    
    const reconstructedFeatures = [];
    const role = item.target_role || 'landlord';
    const defs = featureDefinitions[role] || [];
    
    defs.forEach(def => {
       if (item.feature_quotas && item.feature_quotas[def.key] && item.feature_quotas[def.key] > 0) {
           reconstructedFeatures.push({ key: def.key, quantity: item.feature_quotas[def.key] });
       }
    });

    setForm({
      name: item.name,
      description: item.description || '',
      icon: item.icon,
      target_role: role,
      pricePerMonth: item.pricePerMonth,
      duration: item.duration,
      features: reconstructedFeatures,
      status: item.status,
    });
  };

  const closeModal = () => {
    setEditingPackage(undefined);
    setForm(emptyPackage);
  };

  const handleAddFeature = () => {
    const role = form.target_role || 'landlord';
    const availableFeatures = featureDefinitions[role] || [];
    if (availableFeatures.length > 0) {
      const existingKeys = form.features.map(f => f.key);
      const nextFeature = availableFeatures.find(f => !existingKeys.includes(f.key)) || availableFeatures[0];
      setForm(prev => ({ ...prev, features: [...prev.features, { key: nextFeature.key, quantity: 1 }] }));
    }
  };

  const handleUpdateFeature = (index, field, value) => {
    const newFeatures = [...form.features];
    newFeatures[index][field] = value;
    setForm(prev => ({ ...prev, features: newFeatures }));
  };

  const handleRemoveFeature = (index) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const durationNum = form.duration.replace(/\D/g, '') || 30;
    
    // Generate a simple slug from name to satisfy BE validation
    const makeSlug = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    const payload = {
      name: form.name,
      description: form.description,
      icon: form.icon,
      target_role: form.target_role,
      price_cents: Number(form.pricePerMonth),
      period: `${durationNum}_days`,
      active: form.status === 'active',
    };

    const feature_quotas = {};

    const displayFeatures = [];
    const roleDefs = featureDefinitions[form.target_role] || [];

    form.features.forEach(f => {
       feature_quotas[f.key] = f.quantity;
       const labelDef = roleDefs.find(def => def.key === f.key);
       if (labelDef) {
           displayFeatures.push(`${f.quantity} ${labelDef.label}`);
       }
    });
    
    payload.feature_quotas = feature_quotas;
    payload.features_list = displayFeatures;

    try {
      if (editingPackage) {
        const id = getNumericId(editingPackage.id);
        await updatePackage({ id, ...payload });
      } else {
        payload.slug = makeSlug(form.name) + '-' + Date.now();
        await createPackage(payload);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save package", error);
      alert("Có lỗi xảy ra khi lưu gói dịch vụ.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa gói này?")) return;
    try {
      const numericId = getNumericId(id);
      await deletePackage(numericId).unwrap();
    } catch (error) {
      if (error.status === 400) {
        alert(error.data?.detail || "Không thể xóa gói đã có người mua. Vui lòng Tạm ngưng thay vì xóa.");
      } else {
        alert("Có lỗi xảy ra khi xóa gói.");
      }
    }
  };

  const handleToggleStatus = async (item) => {
    const numericId = getNumericId(item.id);
    const isActive = item.status === 'active';
    await updatePackageStatus({
      id: numericId,
      active: !isActive
    });
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
              <strong>{item.currency ? formatCurrency(item.value) : formatNumber(item.value)}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.insightGrid}>
        <article className={`${styles.insightCard} ${styles.insightCardAccent}`}>
          <div>
            <span className={styles.insightLabel}>Gói bán chạy</span>
            <strong>{bestSeller?.name || 'Chưa có dữ liệu'}</strong>
            <p>{bestSeller ? `${formatNumber(bestSeller.totalPurchased)} lượt mua` : 'Thêm gói để bắt đầu kinh doanh'}</p>
          </div>
          <span className={styles.insightIcon}>
            <AdminIcon name="shopping-cart" size={20} />
          </span>
        </article>
        <article className={styles.insightCard}>
          <div>
            <span className={styles.insightLabel}>Tỷ trọng khách hàng</span>
            <strong>{formatNumber(allPackages.filter((item) => item.target_role === 'landlord').length)} gói chủ trọ</strong>
            <p>{formatNumber(allPackages.filter((item) => item.target_role === 'tenant').length)} gói dành cho khách thuê</p>
          </div>
          <span className={styles.insightIcon}>
            <AdminIcon name="users" size={20} />
          </span>
        </article>
      </section>

      <section className={styles.featurePanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Gói dịch vụ</h2>
            <p>Thiết lập gói cho chủ trọ và khách thuê</p>
          </div>
          <button type="button" className={`${styles.buttonSmall} ${styles.buttonPrimary}`} onClick={openCreate}>
            <AdminIcon name="plus" size={14} />
            Thêm gói
          </button>
        </div>

        <div className={styles.tabGroup}>
          {packageTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <label className={styles.controlWithIcon}>
            <AdminIcon name="search" size={15} />
            <input
              type="search"
              placeholder="Tìm tên gói, mã gói hoặc nhóm khách..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <span className={styles.toolbarHint}>{formatNumber(filteredPackages.length)} gói phù hợp</span>
        </div>

        <div className={styles.packageGrid}>
          {isLoading ? (
            <div className={styles.loadingState}>Đang tải gói dịch vụ...</div>
          ) : (
            filteredPackages.map((item) => (
              <article key={item.id} className={`${styles.packageCard} ${item.status === 'suspended' ? styles.packageCardMuted : ''}`}>
                <div className={styles.packageCardTop}>
                  <span className={styles.packageIcon}>
                    <AdminIcon name={item.icon} size={19} />
                  </span>
                  <span className={`${styles.dataBadge} ${item.target_role === 'landlord' ? styles.badgeInfo : styles.badgeSuccess}`}>
                    {item.target_role === 'landlord' ? 'Chủ trọ' : 'Khách thuê'}
                  </span>
                </div>
                <h3>{item.name}</h3>
                <div className={styles.packagePrice}>
                  {formatCurrency(item.pricePerMonth)}
                  <span>/{item.duration}</span>
                </div>
                <div className={styles.packageMeter}>
                  <span style={{ width: `${Math.max(8, Math.round((item.totalPurchased / maxPurchased) * 100))}%` }} />
                </div>
                <ul>
                  {item.features.map((feature) => {
                    const featureTranslations = {
                      matching: 'Kết nối phòng',
                      chatbot: 'Hỗ trợ Chatbot AI',
                      priority_match: 'Ưu tiên ghép phòng',
                      vip_listing: 'Đăng tin nổi bật',
                    };
                    const displayFeature = featureTranslations[feature] || feature;
                    return (
                      <li key={feature}>
                        <AdminIcon name="check" size={14} />
                        {displayFeature}
                      </li>
                    );
                  })}
                </ul>
                <div className={styles.packageFooter}>
                  <div>
                    <span>{formatNumber(item.totalPurchased)}</span>
                    lượt mua
                  </div>
                  <div>
                    <span>{formatCurrency(getPackageRevenue(item))}</span>
                    doanh thu
                  </div>
                  <span className={`${styles.dataBadge} ${item.status === 'active' ? styles.badgeSuccess : styles.badgeDanger}`}>
                    {item.statusLabel}
                  </span>
                </div>
                <div className={styles.cardActionBar}>
                  <button type="button" className={styles.buttonSmall} onClick={() => openEdit(item)}>
                    <AdminIcon name="edit" size={13} />
                    Sửa
                  </button>
                  <button type="button" className={styles.buttonSmall} onClick={() => handleToggleStatus(item)}>
                    <AdminIcon name={item.status === 'active' ? 'x-circle' : 'check'} size={13} />
                    {item.status === 'active' ? 'Tạm ngưng' : 'Bật bán'}
                  </button>
                  <button type="button" className={styles.buttonSmall} onClick={() => handleDelete(item.id)}>
                    <AdminIcon name="trash" size={13} />
                    Xóa
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {editingPackage !== undefined && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={closeModal}>
          <form className={styles.modalCard} onSubmit={handleSave} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>{editingPackage ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ'}</h2>
                <p>Mỗi dòng tính năng sẽ hiển thị thành một bullet trong card</p>
              </div>
              <button type="button" className={styles.actionButton} onClick={closeModal}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>
            <div className={styles.formGrid}>
              <label>
                Tên gói
                <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} required />
              </label>
              <label className={styles.formWide}>
                Icon
                <div className={styles.iconGrid}>
                  {AVAILABLE_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      className={`${styles.iconButton} ${form.icon === iconName ? styles.iconButtonSelected : ''}`}
                      onClick={() => setForm((value) => ({ ...value, icon: iconName }))}
                      title={iconName}
                    >
                      <AdminIcon name={iconName} size={20} />
                    </button>
                  ))}
                </div>
              </label>
              <label className={styles.formWide}>
                Mô tả gói
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))}
                  placeholder="VD: Gói Pro giúp chủ trọ đăng nhiều bài, upload thêm ảnh và đẩy tin nổi bật."
                  rows={3}
                />
              </label>
              <label>
                Khách hàng
                <select 
                  value={form.target_role} 
                  onChange={(event) => setForm((value) => ({ ...value, target_role: event.target.value, features: [] }))}
                >
                  {targetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Giá / tháng
                <input
                  type="number"
                  min="0"
                  value={form.pricePerMonth}
                  onChange={(event) => setForm((value) => ({ ...value, pricePerMonth: event.target.value }))}
                />
              </label>
              <label>
                Thời hạn
                <input value={form.duration} onChange={(event) => setForm((value) => ({ ...value, duration: event.target.value }))} />
              </label>
              <label>
                Trạng thái
                <select value={form.status} onChange={(event) => setForm((value) => ({ ...value, status: event.target.value }))}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.formWide}>
                Tính năng
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {form.features.map((feat, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select 
                        value={feat.key} 
                        onChange={(e) => handleUpdateFeature(index, 'key', e.target.value)}
                        style={{ flex: 1, margin: 0, padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      >
                        {(featureDefinitions[form.target_role] || []).map(def => (
                          <option key={def.key} value={def.key}>{def.label}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        min="1" 
                        value={feat.quantity} 
                        onChange={(e) => handleUpdateFeature(index, 'quantity', parseInt(e.target.value, 10) || 1)} 
                        style={{ width: '80px', margin: 0, padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      />
                      <button type="button" onClick={() => handleRemoveFeature(index)} className={styles.actionButton} style={{ margin: 0, padding: '8px' }}>
                         <AdminIcon name="trash" size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddFeature} className={styles.buttonSmall} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                    <AdminIcon name="plus" size={14} /> Thêm tính năng
                  </button>
                </div>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.buttonSmall} onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className={`${styles.buttonSmall} ${styles.buttonPrimary}`}>
                Lưu gói
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

