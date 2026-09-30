import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logout } from '../../features/auth/slice';
import { useGetUserProfileQuery } from '../../features/user/api/userApi';
import { baseApi } from '../api/baseApi';
import ConfirmModal from './ConfirmModal';
import './Header.css';

const navItems = [
  { id: 'home', label: 'Trang chủ', path: '/' },
  { id: 'find-room', label: 'Tìm trọ', path: '/find-room' },
  { id: 'find-mate', label: 'Tìm bạn', path: '/find-mate' },
  { id: 'contact', label: 'Liên hệ', path: '/contact' },
];

const Header = ({ initialActiveId = 'home' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const linkRefs = useRef([]);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profile = userProfileData?.profile;
  const account = userProfileData?.account;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    closeDropdown();
  };

  const confirmLogout = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  const initialIndex = navItems.findIndex((item) => item.id === initialActiveId);

  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [visualIndex, setVisualIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isReady, setIsReady] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
    opacity: 0,
  });

  useEffect(() => {
    const normalizedPath =
      location.pathname.length > 1 && location.pathname.endsWith('/')
        ? location.pathname.slice(0, -1)
        : location.pathname;

    const matchedIndex = navItems.findIndex((item) => item.path === normalizedPath);

    if (matchedIndex >= 0) {
      setActiveIndex(matchedIndex);
      setVisualIndex(matchedIndex);
      return;
    }

    const fallbackIndex = navItems.findIndex((item) => item.id === initialActiveId);

    if (fallbackIndex >= 0) {
      setActiveIndex(fallbackIndex);
      setVisualIndex(fallbackIndex);
    }
  }, [location.pathname, initialActiveId]);

  useLayoutEffect(() => {
    let animationFrame;

    const updateIndicator = () => {
      const targetEl = linkRefs.current[visualIndex];
      if (!targetEl) return;

      setIndicatorStyle({
        width: targetEl.offsetWidth,
        left: targetEl.offsetLeft,
        opacity: 1,
      });

      animationFrame = requestAnimationFrame(() => {
        setIsReady(true);
      });
    };

    updateIndicator();

    window.addEventListener('resize', updateIndicator);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [visualIndex]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          <span className="logo-text">RoomieMatch</span>
        </div>

        <nav
          className={`nav-links ${isReady ? 'ready' : ''}`}
          onMouseLeave={() => setVisualIndex(activeIndex)}
        >
          <div
            className="nav-indicator"
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
              opacity: indicatorStyle.opacity,
            }}
          >
            <span className="indicator-curve indicator-curve-left" />
            <span className="indicator-curve indicator-curve-right" />
          </div>

          {navItems.map((item, index) => (
            <NavLink
              key={item.id}
              to={item.path}
              ref={(el) => {
                linkRefs.current[index] = el;
              }}
              className={`nav-link ${visualIndex === index ? 'selected' : ''}`}
              onMouseEnter={() => setVisualIndex(index)}
              onClick={() => {
                setActiveIndex(index);
                setVisualIndex(index);
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <div className="user-profile-trigger" onClick={toggleDropdown}>
                <img
                  src={profile?.avatar_url || profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || account?.username || 'U'}&backgroundColor=e5e7eb&textColor=4b5563`}
                  alt="Avatar"
                  className="user-avatar-img"
                />
                <span className="user-name-text">{profile?.full_name || account?.username || 'Người dùng'}</span>
                <svg className={`dropdown-arrow-icon ${isDropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              {isDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{profile?.full_name || 'Người dùng'}</p>
                    <p className="dropdown-user-email">{account?.email || ''}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <NavLink to="/user/profile" className="dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Hồ sơ cá nhân
                  </NavLink>
                  <NavLink to="/user/saved-rooms" className="dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    Phòng đã lưu
                  </NavLink>
                  <NavLink to="/user/rental-history" className="dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Lịch sử thuê
                  </NavLink>
                  <NavLink to="/user/package-management" className="dropdown-item" onClick={closeDropdown}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    Quản lý gói
                  </NavLink>
                  <div className="dropdown-divider"></div>
                  <div className="logout-confirm-anchor">
                    <button className="dropdown-item logout-btn" onClick={handleLogoutClick} type="button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      Đăng xuất
                    </button>


                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="login-link">
              Đăng nhập
            </NavLink>
          )}

          <NavLink to="/user/saved-rooms" className="icon-btn wishlist-btn" title="Phòng đã lưu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </NavLink>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        type="confirm"
      />
    </header>
  );
};

export default Header;
