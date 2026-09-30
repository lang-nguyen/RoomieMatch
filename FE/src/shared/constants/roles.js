// Hằng số loại tài khoản — phải khớp với account_type từ API/mock
export const ACCOUNT_TYPES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  ADMIN: 'admin',
};

// Route mặc định sau khi đăng nhập theo từng role
export const ROLE_DEFAULT_ROUTES = {
  [ACCOUNT_TYPES.TENANT]: '/',
  [ACCOUNT_TYPES.LANDLORD]: '/landlord',
  [ACCOUNT_TYPES.ADMIN]: '/admin',
};

// Label hiển thị cho từng role
export const ROLE_LABELS = {
  [ACCOUNT_TYPES.TENANT]: 'Khách thuê',
  [ACCOUNT_TYPES.LANDLORD]: 'Chủ trọ',
  [ACCOUNT_TYPES.ADMIN]: 'Quản trị viên',
};
