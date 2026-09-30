import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h2 className="footer-logo">SmartRoom</h2>
          <p className="footer-desc">Nền tảng tìm kiếm phòng trọ và người ở ghép số 1 Việt Nam, giúp bạn tìm được không gian sống lý tưởng.</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Liên hệ</h3>
          <ul className="footer-links">
            <li><strong>Hotline:</strong> 1900 1224</li>
            <li><strong>Email:</strong> support@smartroom.com</li>
            <li><strong>Địa chỉ:</strong> 16 Quốc lộ 1A, P. Linh Trung, TP. Thủ Đức, TP.HCM</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Về chúng tôi</h3>
          <ul className="footer-links">
            <li><a href="#">Quy chế hoạt động</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Kết nối với chúng tôi</h3>
          <div className="social-links">
            <a href="#" className="social-icon">FB</a>
            <a href="#" className="social-icon">ZL</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 SmartRoom. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
