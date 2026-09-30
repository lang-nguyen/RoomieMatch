import { useNavigate } from 'react-router-dom';
import '../Homepage.css';

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="map-promo">
        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Bản đồ" className="map-image" />
        <div className="map-overlay">
          <button 
            className="view-map-btn" 
            onClick={() => alert('Tính năng bản đồ đang được phát triển.')}
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Xem trên bản đồ (Sắp ra mắt)
          </button>
        </div>
      </div>

      <div className="feature-highlight">
        <h3 className="highlight-title">Trải nghiệm tuyệt vời với RoomieMatch</h3>

        <ul className="feature-list">
          <li className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <span>Tìm bạn đúng yêu cầu</span>
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <span>Không giới hạn tìm bạn</span>
          </li>
          <li className="feature-item">
            <div className="feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <span>Thêm nhiều tính năng nâng cao</span>
          </li>
        </ul>

        <button className="upgrade-btn" onClick={() => navigate('/user/package-management')}>Nâng cấp tài khoản</button>
      </div>
    </aside>
  );
};

export default Sidebar;
