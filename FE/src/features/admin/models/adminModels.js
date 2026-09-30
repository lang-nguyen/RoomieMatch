export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Tổng quan',
    items: [
      { id: 'dashboard', label: 'Trang chủ', icon: 'layout-dashboard' },
      { id: 'analytics', label: 'Báo cáo', icon: 'activity' },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      { id: 'users', label: 'Người dùng', icon: 'users' },
      { id: 'posts', label: 'Bài đăng', icon: 'file-text', badge: '8', badgeTone: 'danger' },
      { id: 'rooms', label: 'Phòng trọ', icon: 'building' },
      { id: 'packages', label: 'Gói dịch vụ', icon: 'package' },
      { id: 'role-features', label: 'Tính năng gói', icon: 'list' },
      { id: 'categories', label: 'Quản lý danh mục', icon: 'tags' },
      { id: 'orders', label: 'Đơn hàng', icon: 'shopping-cart' },
    ],
  },
];

export const ADMIN_ROLE_TONES = {
  manager: 'manager',
  support: 'support',
  editor: 'editor',
};

export const ADMIN_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
};
