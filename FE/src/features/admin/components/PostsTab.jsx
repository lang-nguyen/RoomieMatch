import { useEffect, useMemo, useState } from 'react';
import { useDeletePostMutation, useLazyGetAdminPostsQuery, useUpdatePostStatusMutation } from '../api/adminApi';
import { AdminIcon } from './adminIconMap';
import { formatNumber, normalizeText, paginate, toArray } from './adminFeatureUtils';
import styles from './AdminDashboard.module.css';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'featured', label: 'Nổi bật' },
  { id: 'rejected', label: 'Từ chối' },
];

const statusLabel = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
  closed: 'Đã đóng',
};

const getPostScore = (post) => (post.views || 0) + (post.likes || 0) * 5 + (post.comments || 0) * 8;

const formatPostDate = (value) => {
  if (!value) return 'Chưa có ngày';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date);
};

const fallbackDate = (index) => {
  const day = String(Math.max(1, 12 - index)).padStart(2, '0');
  return `${day}/06/2026`;
};

const normalizePostStatus = (value) => {
  const status = normalizeText(value);

  if (['approved', 'approve', 'accepted', 'active', 'published', 'public'].includes(status) || status.includes('duyệt')) {
    return 'approved';
  }

  if (['pending', 'waiting', 'reviewing', 'draft'].includes(status) || status.includes('chờ')) {
    return 'pending';
  }

  if (['rejected', 'reject', 'declined', 'blocked', 'inactive'].includes(status) || status.includes('từ chối')) {
    return 'rejected';
  }

  if (['closed', 'archived'].includes(status) || status.includes('đóng')) {
    return 'closed';
  }

  return 'pending';
};

const readNumber = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null && item !== '');
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const hasValue = (...values) => values.some((item) => item !== undefined && item !== null && item !== '');

const readAuthor = (post) =>
  post.author ||
  post.authorName ||
  post.owner ||
  post.ownerName ||
  post.landlord ||
  post.landlordName ||
  post.posterName ||
  post.createdBy ||
  post.user?.username ||
  post.user?.full_name ||
  post.user?.fullName ||
  post.account?.username ||
  post.account?.email ||
  `Chưa có tác giả`;

const normalizePost = (post, index) => {
  const status = normalizePostStatus(
    post.status || post.status_code || post.statusCode || post.postStatus || post.approvalStatus || post.approval_status
  );
  const hasViewData = hasValue(post.views, post.viewCount, post.view_count, post.totalViews, post.stats?.views, post.metrics?.views);
  const hasLikeData = hasValue(post.likes, post.likeCount, post.like_count, post.totalLikes, post.stats?.likes, post.metrics?.likes);
  const hasCommentData = hasValue(post.comments, post.commentCount, post.comment_count, post.totalComments, post.stats?.comments, post.metrics?.comments);

  return {
    ...post,
    id: post.id || post.postId || post.post_id || post.code || `P${String(index + 1).padStart(3, '0')}`,
    title: post.roomTitle || post.title || post.postTitle || post.name || 'Bài đăng chưa có tiêu đề',
    author: readAuthor(post),
    authorUsername: post.author_username || post.authorUsername || post.username || null,
    authorEmail: post.author_email || post.authorEmail || post.email || null,
    authorAccountId: post.author_account_id || post.authorAccountId || post.account_id || null,
    date: formatPostDate(post.date || post.createdAt || post.created_at || post.postedAt || post.posted_at || post.publishedAt || post.updatedAt || fallbackDate(index)),
    status,
    statusLabel: post.statusLabel || post.status_label || statusLabel[status],
    views: hasViewData ? readNumber(post.views, post.viewCount, post.view_count, post.totalViews, post.stats?.views, post.metrics?.views) : 80 + index * 37,
    likes: hasLikeData ? readNumber(post.likes, post.likeCount, post.like_count, post.totalLikes, post.stats?.likes, post.metrics?.likes) : 6 + index * 4,
    comments: hasCommentData ? readNumber(post.comments, post.commentCount, post.comment_count, post.totalComments, post.stats?.comments, post.metrics?.comments) : 1 + (index % 6),
    isFeatured: Boolean(post.isFeatured || post.is_featured || post.featured || post.priority === 'featured'),
    description: post.description || post.content || post.body || post.detail || post.note || 'Bài đăng chưa có nội dung mô tả chi tiết.',
  };
};

export const PostsTab = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [page, setPage] = useState(1);
  const [viewingPost, setViewingPost] = useState(null);
  const [rejectingPostId, setRejectingPostId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const visibleStatus = activeTab === 'all' ? 'all' : activeTab;
  const [loadAllPosts, allPostsQuery] = useLazyGetAdminPostsQuery();
  const [loadVisiblePosts, visiblePostsQuery] = useLazyGetAdminPostsQuery();
  const [updatePostStatus] = useUpdatePostStatusMutation();
  const [deletePost] = useDeletePostMutation();
  const allPosts = useMemo(() => toArray(allPostsQuery.data).map(normalizePost), [allPostsQuery.data]);
  const visiblePosts = useMemo(() => toArray(visiblePostsQuery.data).map(normalizePost), [visiblePostsQuery.data]);
  const isLoading = allPostsQuery.isLoading || allPostsQuery.isFetching || visiblePostsQuery.isLoading || visiblePostsQuery.isFetching;

  useEffect(() => {
    loadAllPosts({ status: 'all' }, true);
  }, [loadAllPosts]);

  useEffect(() => {
    loadVisiblePosts({ status: visibleStatus }, true);
  }, [loadVisiblePosts, visibleStatus]);

  const filteredPosts = useMemo(() => {
    let result = visiblePosts;
    const keyword = normalizeText(search);
    if (keyword) {
      result = result.filter((post) =>
        [post.title, post.author, post.authorUsername, post.authorEmail, post.authorAccountId, post.id, post.statusLabel].some((value) =>
          normalizeText(value).includes(keyword)
        )
      );
    }
    if (searchDate) {
      // searchDate is YYYY-MM-DD. post.date is typically DD/MM/YYYY
      const [year, month, day] = searchDate.split('-');
      const formattedSearchDate = `${day}/${month}/${year}`;
      result = result.filter(post => post.date === formattedSearchDate);
    }
    return result;
  }, [visiblePosts, search, searchDate]);
  const paged = paginate(filteredPosts, page, 5);

  const stats = useMemo(
    () => [
      { label: 'Tổng bài', value: allPosts.length, icon: 'file-text' },
      { label: 'Chờ duyệt', value: allPosts.filter((post) => post.status === 'pending').length, icon: 'activity' },
      { label: 'Đã duyệt', value: allPosts.filter((post) => post.status === 'approved').length, icon: 'check' },
      { label: 'Nổi bật', value: allPosts.filter((post) => post.isFeatured).length, icon: 'star' },
    ],
    [allPosts]
  );
  const pendingPosts = useMemo(() => allPosts.filter((post) => post.status === 'pending'), [allPosts]);
  const topPost = useMemo(() => [...allPosts].sort((first, second) => getPostScore(second) - getPostScore(first))[0], [allPosts]);

  const handlePostChange = async (id, changes) => {
    if (!changes.status && changes.isFeatured === undefined) return;
    if (changes.status === 'rejected' && !changes.reason) {
      setRejectingPostId(id);
      setRejectReason('');
      return;
    }
    await updatePostStatus({ id, ...changes }).unwrap();
    await loadAllPosts({ status: 'all' }, false);
    await loadVisiblePosts({ status: visibleStatus }, false);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    await handlePostChange(rejectingPostId, { status: 'rejected', reason: rejectReason });
    setRejectingPostId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá bài đăng này?')) return;
    await deletePost(id).unwrap();
    await loadAllPosts({ status: 'all' }, false);
    await loadVisiblePosts({ status: visibleStatus }, false);
  };

  return (
    <div className={styles.featureStack}>
      <section className={styles.featureStatsGrid}>
        {stats.map((item) => (
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

      <section className={styles.insightGrid}>
        <article className={`${styles.insightCard} ${styles.insightCardAccent}`}>
          <div>
            <span className={styles.insightLabel}>Hàng chờ duyệt</span>
            <strong>{formatNumber(pendingPosts.length)} bài</strong>
            <p>{pendingPosts[0]?.title || 'Không có bài đang chờ'}</p>
          </div>
          <span className={styles.insightIcon}>
            <AdminIcon name="activity" size={20} />
          </span>
        </article>
        <article className={styles.insightCard}>
          <div>
            <span className={styles.insightLabel}>Bài có sức hút cao</span>
            <strong>{topPost ? formatNumber(topPost.views) : 0} lượt xem</strong>
            <p>{topPost?.title || 'Chưa có dữ liệu'}</p>
          </div>
          <span className={styles.insightIcon}>
            <AdminIcon name="star" size={20} />
          </span>
        </article>
      </section>

      <section className={styles.featurePanel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>Kiểm duyệt bài đăng</h2>
            <p>Duyệt, từ chối, xóa hoặc theo dõi bài nổi bật</p>
          </div>
          <div className={styles.tabGroup}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.controlWithIcon}>
            <AdminIcon name="search" size={15} />
            <input
              type="search"
              placeholder="Tìm tiêu đề, tác giả hoặc mã bài..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className={styles.controlWithIcon}>
            <input
              type="date"
              value={searchDate}
              onChange={(event) => {
                setSearchDate(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <span className={styles.toolbarHint}>
            Hiển thị {formatNumber(filteredPosts.length)} / {formatNumber(visiblePosts.length)} bài
          </span>
        </div>

        <div className={styles.tableScroller}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Bài đăng</th>
                <th>Tác giả</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Chỉ số</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6">Đang tải bài đăng...</td>
                </tr>
              ) : !paged.items.length ? (
                <tr>
                  <td colSpan="6">Không có bài đăng phù hợp trong tab này.</td>
                </tr>
              ) : (
                paged.items.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className={styles.postCell}>
                        <div className={styles.postThumb}>{post.title.slice(0, 1)}</div>
                        <div>
                          <strong>{post.title}</strong>
                          <span>{post.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{post.author}</strong>
                      {(post.authorUsername || post.authorEmail || post.authorAccountId) && (
                        <span className={styles.subText}>
                          {post.authorUsername || post.authorEmail || `ID ${post.authorAccountId}`}
                        </span>
                      )}
                    </td>
                    <td>{post.date}</td>
                    <td>
                      <span
                        className={`${styles.dataBadge} ${
                          post.status === 'approved'
                            ? styles.badgeSuccess
                            : post.status === 'pending'
                              ? styles.badgeWarning
                              : styles.badgeDanger
                        }`}
                      >
                        {post.isFeatured && <AdminIcon name="star" size={12} />}
                        {post.statusLabel}
                      </span>
                    </td>
                    <td>
                      <button type="button" className={styles.metricInline} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => alert('Tính năng đang được phát triển')}>{formatNumber(post.views)} xem</button>
                      <button type="button" className={styles.metricInline} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => alert('Tính năng đang được phát triển')}>{formatNumber(post.likes)} thích</button>
                      <button type="button" className={styles.metricInline} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => alert('Tính năng đang được phát triển')}>{formatNumber(post.comments)} BL</button>
                      <div className={styles.scoreBar} title="Mức độ tương tác">
                        <span style={{ width: `${Math.min(100, Math.round(getPostScore(post) / 8))}%` }} />
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.actionButton} title="Xem chi tiết" onClick={() => setViewingPost(post)}>
                          <AdminIcon name="eye" size={14} />
                        </button>
                        {post.status !== 'approved' && (
                          <button type="button" className={styles.actionButton} title="Duyệt" onClick={() => handlePostChange(post.id, { status: 'approved' })}>
                            <AdminIcon name="check" size={14} />
                          </button>
                        )}
                        <button type="button" className={styles.actionButton} title="Từ chối" onClick={() => handlePostChange(post.id, { status: 'rejected' })}>
                          <AdminIcon name="x-circle" size={14} />
                        </button>
                        <button type="button" className={styles.actionButton} title="Nổi bật" onClick={() => handlePostChange(post.id, { isFeatured: !post.isFeatured })}>
                          <AdminIcon name="star" size={14} />
                        </button>
                        <button type="button" className={styles.actionButton} title="Xóa" onClick={() => handleDelete(post.id)}>
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

      {viewingPost && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setViewingPost(null)}>
          <section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Chi tiết bài đăng</h2>
                <p>Mã bài viết: {viewingPost.id}</p>
              </div>
              <button type="button" className={styles.actionButton} onClick={() => setViewingPost(null)}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>

            <div className={styles.detailGrid}>
              <article className={styles.formWide}>
                <span>Tiêu đề</span>
                <strong>{viewingPost.title}</strong>
              </article>
              <article>
                <span>Tác giả</span>
                <strong>{viewingPost.author}</strong>
                <p style={{ fontSize: '12px', color: 'var(--admin-text-3)', lineHeight: '1.5', margin: '6px 0 0' }}>
                  {[viewingPost.authorUsername, viewingPost.authorEmail, viewingPost.authorAccountId ? `ID ${viewingPost.authorAccountId}` : null]
                    .filter(Boolean)
                    .join(' - ') || 'Không có thêm thông tin tài khoản'}
                </p>
              </article>
              <article>
                <span>Ngày đăng</span>
                <strong>{viewingPost.date}</strong>
              </article>
              <article>
                <span>Trạng thái</span>
                <div style={{ marginTop: '4px' }}>
                  <span
                    className={`${styles.dataBadge} ${
                      viewingPost.status === 'approved'
                        ? styles.badgeSuccess
                        : viewingPost.status === 'pending'
                          ? styles.badgeWarning
                          : styles.badgeDanger
                    }`}
                  >
                    {viewingPost.isFeatured && <AdminIcon name="star" size={12} style={{ marginRight: '4px' }} />}
                    {viewingPost.statusLabel}
                  </span>
                </div>
              </article>
              <article>
                <span>Chỉ số tương tác</span>
                <strong>
                  {formatNumber(viewingPost.views)} lượt xem - {formatNumber(viewingPost.likes)} lượt thích - {formatNumber(viewingPost.comments)} bình luận
                </strong>
              </article>
              <article className={styles.formWide}>
                <span>Nội dung mô tả</span>
                <p style={{ fontSize: '13px', color: 'var(--admin-text-2)', lineHeight: '1.6', margin: '6px 0 0' }}>
                  {viewingPost.description}
                </p>
              </article>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.buttonSmall}
                onClick={async () => {
                  await handlePostChange(viewingPost.id, { status: 'rejected' });
                  setViewingPost(null);
                }}
              >
                <AdminIcon name="x-circle" size={13} />
                Từ chối
              </button>
              <button
                type="button"
                className={`${styles.buttonSmall} ${styles.buttonPrimary}`}
                onClick={async () => {
                  await handlePostChange(viewingPost.id, { status: 'approved' });
                  setViewingPost(null);
                }}
              >
                <AdminIcon name="check" size={13} />
                Duyệt bài đăng
              </button>
            </div>
          </section>
        </div>
      )}

      {rejectingPostId && (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={() => setRejectingPostId(null)}>
          <section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Từ chối bài đăng</h2>
              </div>
              <button type="button" className={styles.actionButton} onClick={() => setRejectingPostId(null)}>
                <AdminIcon name="close" size={15} />
              </button>
            </div>
            <div className={styles.detailGrid}>
              <article className={styles.formWide}>
                <span>Lý do từ chối</span>
                <textarea 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                  placeholder="Nhập lý do từ chối..."
                  style={{ width: '100%', padding: '8px', minHeight: '80px', marginTop: '8px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                />
              </article>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.buttonSmall} onClick={() => setRejectingPostId(null)}>
                Hủy
              </button>
              <button type="button" className={`${styles.buttonSmall} ${styles.buttonDanger}`} onClick={submitReject} disabled={!rejectReason.trim()}>
                Xác nhận từ chối
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
