import { useState } from 'react';
import {
  useGetRoleFeaturesQuery,
  useCreateRoleFeatureMutation,
  useUpdateRoleFeatureMutation,
  useDeleteRoleFeatureMutation,
} from '../api/adminApi';
import { AdminIcon } from './adminIconMap';
import { normalizeText, paginate } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const emptyFeature = {
  target_role: 'landlord',
  feature_key: '',
  feature_name: '',
  description: '',
  active: true,
};

export const RoleFeaturesTab = () => {
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingFeature, setEditingFeature] = useState(undefined);
  const [form, setForm] = useState(emptyFeature);
  
  const { data: responseData, isLoading } = useGetRoleFeaturesQuery();
  const allFeatures = responseData?.items || responseData || [];
  
  const [createRoleFeature] = useCreateRoleFeatureMutation();
  const [updateRoleFeature] = useUpdateRoleFeatureMutation();
  const [deleteRoleFeature] = useDeleteRoleFeatureMutation();

  const filteredFeatures = allFeatures.filter((f) => {
    if (activeTab && f.target_role !== activeTab) return false;
    const keyword = normalizeText(search);
    if (keyword) {
      if (![f.feature_key, f.feature_name].some(v => normalizeText(v).includes(keyword))) return false;
    }
    return true;
  });

  const paged = paginate(filteredFeatures, page, 10);

  const openCreate = () => {
    setEditingFeature(null);
    setForm(emptyFeature);
  };

  const openEdit = (item) => {
    setEditingFeature(item);
    setForm({
      target_role: item.target_role,
      feature_key: item.feature_key,
      feature_name: item.feature_name,
      description: item.description || '',
      active: item.active,
    });
  };

  const closeModal = () => {
    setEditingFeature(undefined);
    setForm(emptyFeature);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      if (editingFeature) {
        await updateRoleFeature({ id: editingFeature.id, ...form }).unwrap();
      } else {
        await createRoleFeature(form).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save feature", error);
      alert(error.data?.detail || "Có lỗi xảy ra khi lưu tính năng.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tính năng này? Điều này có thể ảnh hưởng đến các gói đang sử dụng.")) return;
    try {
      await deleteRoleFeature(id).unwrap();
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa tính năng.");
    }
  };

  const handleToggleStatus = async (item) => {
    await updateRoleFeature({ id: item.id, active: !item.active }).unwrap();
  };

  return (
    <div className={styles.featureStack}>
      <section className={styles.featurePanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Tính năng gói</h2>
            <p>Quản lý các loại định mức và chức năng cho gói dịch vụ</p>
          </div>
          <button type="button" className={`${styles.buttonSmall} ${styles.buttonPrimary}`} onClick={openCreate}>
            <AdminIcon name="plus" size={14} />
            Thêm tính năng
          </button>
        </div>

        <div className={`${styles.toolbar} ${styles.roomToolbar}`}>
          <label className={`${styles.controlWithIcon} ${styles.roomSearchControl}`}>
            <AdminIcon name="search" size={15} />
            <input
              type="search"
              placeholder="Tìm mã tính năng, tên hiển thị..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <select
            value={activeTab}
            aria-label="Lọc đối tượng"
            onChange={(event) => {
              setActiveTab(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả khách hàng</option>
            <option value="landlord">Chủ trọ</option>
            <option value="tenant">Khách thuê</option>
          </select>
        </div>

        <div className={styles.tableScroller}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Đối tượng</th>
                <th>Mã tính năng (Key)</th>
                <th>Tên hiển thị</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5">Đang tải...</td>
                </tr>
              ) : paged.items.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyState}>Chưa có tính năng nào</td>
                </tr>
              ) : (
                paged.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={`${styles.dataBadge} ${item.target_role === 'landlord' ? styles.badgeInfo : styles.badgeSuccess}`}>
                        {item.target_role === 'landlord' ? 'Chủ trọ' : 'Khách thuê'}
                      </span>
                    </td>
                    <td><strong>{item.feature_key}</strong></td>
                    <td>{item.feature_name}</td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.dataBadge} ${styles.statusFilterBadge} ${item.active ? styles.badgeSuccess : styles.badgeDanger}`}
                        onClick={() => handleToggleStatus(item)}
                        title="Đổi trạng thái"
                      >
                        {item.active ? 'Hoạt động' : 'Đã tắt'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.actionButton} onClick={() => openEdit(item)} title="Sửa">
                          <AdminIcon name="edit" size={14} />
                        </button>
                        <button type="button" className={styles.actionButton} onClick={() => handleDelete(item.id)} title="Xóa">
                          <AdminIcon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {paged.totalPages > 1 && (
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
        )}
      </section>

      {editingFeature !== undefined && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={closeModal}>
          <form className={styles.modalCard} onSubmit={handleSave} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>{editingFeature ? 'Sửa tính năng' : 'Thêm tính năng'}</h2>
                <p>Định nghĩa tính năng để gán vào các gói dịch vụ</p>
              </div>
              <button type="button" className={styles.actionButton} onClick={closeModal}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>
            <div className={styles.formGrid}>
              <label>
                Khách hàng
                <select 
                  value={form.target_role} 
                  onChange={(event) => setForm((value) => ({ ...value, target_role: event.target.value }))}
                  disabled={!!editingFeature} // Key and Role shouldn't be easily changed to avoid orphan data
                >
                  <option value="landlord">Chủ trọ</option>
                  <option value="tenant">Khách thuê</option>
                </select>
              </label>
              <label>
                Mã tính năng (Key)
                <input 
                  placeholder="VD: posts_limit, chatbot_credits..."
                  value={form.feature_key} 
                  onChange={(event) => setForm((value) => ({ ...value, feature_key: event.target.value }))} 
                  required 
                  disabled={!!editingFeature}
                />
              </label>
              <label className={styles.formWide}>
                Tên hiển thị
                <input 
                  placeholder="VD: Giới hạn bài đăng"
                  value={form.feature_name} 
                  onChange={(event) => setForm((value) => ({ ...value, feature_name: event.target.value }))} 
                  required 
                />
              </label>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.buttonSmall} onClick={closeModal}>
                Hủy
              </button>
              <button type="submit" className={`${styles.buttonSmall} ${styles.buttonPrimary}`}>
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
