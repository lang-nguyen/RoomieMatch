import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetRoomReviewsQuery, useAddRoomReviewMutation, useEditRoomReviewMutation } from '../../homepage/api/postsApi';
import { selectCurrentUser } from '../../auth/slice';

const RoomDetailReviews = ({ roomId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetRoomReviewsQuery({ roomId, page, page_size: 10 });
  const [addReview, { isLoading: isAdding }] = useAddRoomReviewMutation();
  const [editReview, { isLoading: isEditing }] = useEditRoomReviewMutation();

  const user = useSelector(selectCurrentUser);
  const accountId = user?.account_id || user?.id;

  const sectionRef = useRef(null);
  const detectedRef = useRef(false);

  const [reviewsList, setReviewsList] = useState([]);
  const [myExistingReview, setMyExistingReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Scroll to section if navigated with #reviews hash
  useEffect(() => {
    if (window.location.hash === '#reviews' && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, []);

  // Update displayed list as pages load
  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setReviewsList(data.items);
      } else {
        setReviewsList(prev => {
          const newItems = data.items.filter(item => !prev.some(p => p.id === item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data]);

  // Auto-detect if current user already has a review — enter edit mode
  useEffect(() => {
    if (!accountId || detectedRef.current || !data?.items || page !== 1) return;
    detectedRef.current = true;
    const existing = data.items.find(r => r.reviewer?.account_id === accountId);
    if (existing) {
      setMyExistingReview(existing);
      setEditingReviewId(existing.id);
      setReviewRating(existing.rating || 5);
      setReviewComment(existing.comment || '');
    }
  }, [data, accountId, page]);

  const totalPages = data?.total_pages || 1;
  const totalReviews = data?.total || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!user) {
      setSubmitError('Vui lòng đăng nhập để đánh giá!');
      return;
    }
    try {
      if (editingReviewId) {
        await editReview({ roomId, reviewId: editingReviewId, rating: reviewRating, comment: reviewComment }).unwrap();
        setMyExistingReview(prev => prev ? { ...prev, rating: reviewRating, comment: reviewComment } : prev);
      } else {
        await addReview({ roomId, rating: reviewRating, comment: reviewComment }).unwrap();
        detectedRef.current = false; // allow re-detect after first submit
      }
      setPage(1);
    } catch (err) {
      const status = err?.status;
      const detail = err?.data?.detail || '';
      if (status === 403 || detail.toLowerCase().includes('rental')) {
        setSubmitError('Chỉ người đã từng thuê phòng này mới có thể đánh giá.');
      } else if (status === 409 || detail.toLowerCase().includes('already')) {
        setSubmitError('Bạn đã đánh giá phòng này rồi. Hãy chỉnh sửa đánh giá cũ bên dưới.');
      } else if (status === 401) {
        setSubmitError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setSubmitError(detail || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
      }
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment || '');
    setSubmitError('');
    if (sectionRef.current) {
      const formEl = sectionRef.current.querySelector('.room-detail-review-form');
      if (formEl) window.scrollTo({ top: formEl.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const renderStars = (score) => (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= score ? '#fbbf24' : '#e5e7eb', fontSize: '18px' }}>★</span>
      ))}
    </span>
  );

  const averageRating = data?.average_rating || 0;
  const ratingCounts = data?.rating_counts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = ratingCounts[stars] || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { label: `${stars} sao`, value: count, percentage };
  });

  return (
    <section ref={sectionRef} id="reviews" className="room-detail-section">
      <h2 className="room-detail-section-title">Đánh giá</h2>

      {/* Rating overview */}
      <div className="room-detail-card room-detail-rating">
        <div className="room-detail-rating-score">
          <div className="room-detail-rating-value">{averageRating.toFixed(1)}</div>
          <div className="room-detail-rating-max">/5</div>
          <div className="room-detail-rating-stars" style={{ color: '#fbbf24', letterSpacing: '2px' }}>
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="room-detail-rating-count">Từ {totalReviews} đánh giá</p>
        </div>
        <div className="room-detail-rating-bars">
          {ratingBreakdown.map((item) => (
            <div key={item.label} className="room-detail-rating-row">
              <span>{item.label}</span>
              <div className="room-detail-rating-track">
                <div className="room-detail-rating-fill" style={{ width: `${item.percentage}%` }} />
              </div>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="room-detail-review-list">
        {isLoading && page === 1 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Đang tải đánh giá...</p>
        ) : reviewsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        ) : (
          reviewsList.map((review) => {
            const reviewerName = review.reviewer?.display_name || 'Khách';
            const isMyReview = accountId && review.reviewer?.account_id === accountId;
            return (
              <div key={review.id} className="room-detail-review" style={{ position: 'relative', outline: isMyReview ? '2px solid #e0e7ff' : 'none', borderRadius: isMyReview ? '12px' : undefined }}>
                <div className="room-detail-review-header">
                  <div className="room-detail-review-avatar">
                    {review.reviewer?.avatar_url ? (
                      <img src={review.reviewer.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      reviewerName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="room-detail-review-name">
                      {reviewerName}
                      {isMyReview && <span style={{ marginLeft: 8, fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>● Đánh giá của bạn</span>}
                    </p>
                    <p className="room-detail-review-date">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="room-detail-review-stars">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="room-detail-review-text" style={{ marginTop: '12px' }}>{review.comment}</p>
                {isMyReview && (
                  <button
                    onClick={() => handleEditClick(review)}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: '4px 8px', borderRadius: '4px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            );
          })
        )}

        {page < totalPages && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isFetching}
              style={{ padding: '10px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', color: '#475569', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              {isFetching ? 'Đang tải...' : 'Xem thêm đánh giá'}
            </button>
          </div>
        )}
      </div>

      {/* Review form: only show when logged in */}
      {user ? (
        <form className="room-detail-review-form" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
            {myExistingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá của bạn'}
          </h3>
          {myExistingReview && (
            <p style={{ marginBottom: '16px', fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
              Bạn đã đánh giá phòng này vào {new Date(myExistingReview.created_at).toLocaleDateString('vi-VN')}. Cập nhật bên dưới nếu muốn thay đổi.
            </p>
          )}
          <div className="room-detail-review-score" style={{ justifyContent: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <span style={{ fontWeight: '600', color: '#334155' }}>Chất lượng phòng</span>
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{ color: star <= reviewRating ? '#fbbf24' : '#e5e7eb', fontSize: '28px', userSelect: 'none', transition: 'transform 0.1s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            required
          />
          {submitError && (
            <div style={{ marginTop: '12px', padding: '12px 16px', background: '#fff0f2', border: '1px solid #ffc4cf', borderRadius: '8px', color: '#d9364f', fontSize: '13px', fontWeight: '500', lineHeight: '1.5' }}>
              ⚠️ {submitError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="room-detail-submit" disabled={isAdding || isEditing} style={{ flex: 1 }}>
              {isAdding || isEditing ? 'Đang gửi...' : (myExistingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá →')}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '14px' }}>
          🔒 <strong>Hãy đăng nhập</strong> và thuê phòng này để có thể đánh giá.
        </div>
      )}
    </section>
  );
};

export default RoomDetailReviews;
