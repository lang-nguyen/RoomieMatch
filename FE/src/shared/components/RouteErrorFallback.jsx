import { Link, useRouteError } from 'react-router-dom';

const fallbackStyles = {
  page: {
    minHeight: '60vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    textAlign: 'center',
  },
  title: {
    margin: '0 0 8px',
    fontSize: 28,
  },
  text: {
    margin: '0 0 18px',
    color: '#6b7280',
  },
  link: {
    color: '#c1440e',
    fontWeight: 700,
  },
};

export const NotFoundPage = () => (
  <div style={fallbackStyles.page}>
    <div>
      <h1 style={fallbackStyles.title}>Không tìm thấy nội dung</h1>
      <p style={fallbackStyles.text}>Trang hoặc bài đăng này không còn khả dụng.</p>
      <Link to="/find-room" style={fallbackStyles.link}>Quay lại danh sách phòng</Link>
    </div>
  </div>
);

const RouteErrorFallback = () => {
  const error = useRouteError();
  const status = error?.status || error?.response?.status;
  const message = status === 404
    ? 'Trang hoặc bài đăng này không còn khả dụng.'
    : 'Đã có lỗi xảy ra khi tải trang.';

  return (
    <div style={fallbackStyles.page}>
      <div>
        <h1 style={fallbackStyles.title}>{status === 404 ? 'Không tìm thấy nội dung' : 'Không thể tải trang'}</h1>
        <p style={fallbackStyles.text}>{message}</p>
        <Link to="/find-room" style={fallbackStyles.link}>Quay lại danh sách phòng</Link>
      </div>
    </div>
  );
};

export default RouteErrorFallback;
