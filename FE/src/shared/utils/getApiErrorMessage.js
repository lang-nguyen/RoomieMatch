export const getApiErrorMessage = (error, fallback = 'Đã có lỗi xảy ra') => {
  if (!error) return fallback;

  const payload = error.data;

  let msg = '';

  if (typeof payload === 'string' && payload.trim()) {
    msg = payload;
  } else if (payload?.message && typeof payload.message === 'string') {
    msg = payload.message;
  } else if (payload?.detail) {
    if (typeof payload.detail === 'string') {
      msg = payload.detail;
    } else if (Array.isArray(payload.detail) && payload.detail.length > 0) {
      const firstDetail = payload.detail[0];
      if (typeof firstDetail === 'string') {
        msg = firstDetail;
      } else if (firstDetail?.msg) {
        msg = firstDetail.msg;
      }
    }
  } else if (error.error && typeof error.error === 'string') {
    msg = error.error;
  }

  const translations = {
    "Invalid credentials": "Email hoặc mật khẩu không chính xác",
    "Incorrect email or password": "Email hoặc mật khẩu không chính xác",
    "Email not found": "Không tìm thấy tài khoản với email này",
    "Email already registered": "Email này đã được đăng ký",
    "User not found": "Tài khoản không tồn tại",
    "Invalid token": "Phiên đăng nhập đã hết hạn",
    "Not authenticated": "Vui lòng đăng nhập để tiếp tục",
    "Not enough credit": "Bạn đã hết lượt sử dụng",
    "User is inactive": "Tài khoản đã bị vô hiệu hóa"
  };

  if (translations[msg]) {
    return translations[msg];
  }

  return msg || fallback;
};