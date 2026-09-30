import { useMemo, useState } from 'react';
import { useCreateCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery } from '../api/adminApi';
import { AdminIcon, AVAILABLE_ICONS } from './adminIconMap';
import { formatNumber, normalizeText } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const categoryTabs = [
  { id: 'roomType', label: 'Loại phòng', icon: 'building' },
  { id: 'utility', label: 'Tiện ích', icon: 'tags' },
];

const emptyCategory = {
  name: '',
  priceRange: 'N/A',
  creator: 'admin',
  quantity: 0,
  icon: 'tags',
};

export const CategoriesTab = () => {
  const [activeTab, setActiveTab] = useState('roomType');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyCategory);
  const { data = { items: [] }, isLoading, refetch } = useGetCategoriesQuery(activeTab);
  const [createCategory] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const items = useMemo(() => data.items || [], [data.items]);
  const filteredItems = useMemo(() => {
    const keyword = normalizeText(search);
    if (!keyword) return items;

    return items.filter((item) =>
      [item.id, item.name, item.creator, item.priceRange].some((value) => normalizeText(value).includes(keyword))
    );
  }, [items, search]);
  const maxQuantity = Math.max(...items.map((item) => item.quantity), 1);

  const summary = useMemo(
    () => [
      { label: 'Danh mục', value: items.length, icon: 'tags' },
      { label: 'Tổng phòng', value: items.reduce((sum, item) => sum + item.quantity, 0), icon: 'building' },
      { label: 'Người tạo', value: new Set(items.map((item) => item.creator)).size, icon: 'users' },
      { label: 'Đang hiển thị', value: filteredItems.length, icon: 'eye' },
    ],
    [filteredItems.length, items]
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyCategory);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    await createCategory({ tab: activeTab, ...form, quantity: Number(form.quantity) });
    closeModal();
    refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      await deleteCategory(id).unwrap();
      refetch();
    } catch (error) {
      console.error(error);
      alert('Không thể xóa danh mục. Vui lòng thử lại sau.');
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

      <section className={styles.featurePanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Danh mục hệ thống</h2>
            <p>Quản lý khu vực, loại phòng và tiện ích hiển thị trên nền tảng</p>
          </div>
          <button type="button" className={`${styles.buttonSmall} ${styles.buttonPrimary}`} onClick={() => setIsModalOpen(true)}>
            <AdminIcon name="plus" size={14} />
            Thêm danh mục
          </button>
        </div>

        <div className={styles.largeTabGroup}>
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.largeTabButton} ${activeTab === tab.id ? styles.largeTabButtonActive : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
              }}
            >
              <AdminIcon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <label className={styles.controlWithIcon}>
            <AdminIcon name="search" size={15} />
            <input
              type="search"
              placeholder="Tìm tên danh mục, mã hoặc người tạo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <span className={styles.toolbarHint}>{formatNumber(filteredItems.length)} danh mục phù hợp</span>
        </div>

        <div className={styles.categoryPreviewGrid}>
          {filteredItems.slice(0, 4).map((item) => (
            <article key={item.id} className={styles.categoryPreviewCard} style={{ border: 'none', boxShadow: 'none' }}>
              <span className={styles.categoryIcon}>
                <AdminIcon name={item.icon || categoryTabs.find((tab) => tab.id === activeTab)?.icon || 'tags'} size={18} />
              </span>
              <div>
                <strong>{item.name}</strong>
                <div className={styles.scoreBar} style={{ marginTop: '8px' }}>
                  <span style={{ width: `${Math.max(8, Math.round((item.quantity / maxQuantity) * 100))}%` }} />
                </div>
              </div>
              <span className={styles.categoryCount}>{formatNumber(item.quantity)}</span>
            </article>
          ))}
        </div>

        <div className={styles.tableScroller}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Icon</th>
                <th>Người tạo</th>
                <th>ID</th>
                <th>Số phòng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6">Đang tải danh mục...</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.strongCell}>{item.name}</td>
                    <td><AdminIcon name={item.icon || 'tags'} size={16} /></td>
                    <td>{item.creator}</td>
                    <td>{item.id}</td>
                    <td>
                      <span className={styles.metricInline}>{formatNumber(item.quantity)} phòng</span>
                    </td>
                    <td>
                      <button type="button" className={styles.actionButton} title="Xóa" onClick={() => handleDelete(item.id)}>
                        <AdminIcon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={closeModal}>
          <form className={styles.modalCard} onSubmit={handleSave} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Thêm danh mục</h2>
                <p>Danh mục mới sẽ được thêm vào nhóm đang chọn</p>
              </div>
              <button type="button" className={styles.actionButton} onClick={closeModal}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.formWide}>
                Tên {activeTab === 'roomType' ? 'loại phòng' : 'tiện ích'}
                <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} required />
              </label>
              <label className={styles.formWide}>
                Chọn Icon
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
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.buttonSmall} onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className={`${styles.buttonSmall} ${styles.buttonPrimary}`}>
                Thêm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

