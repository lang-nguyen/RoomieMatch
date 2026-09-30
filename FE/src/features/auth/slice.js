import { createSlice } from '@reduxjs/toolkit';
import { setAccessToken, getAccessToken, removeAccessToken } from '../../shared/utils/authToken';

const USER_KEY = 'auth_user';

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    return null;
  }
};

const setStoredUser = (user) => {
  try {
    if (!user) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    // ignore
  }
};

const removeStoredUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    // ignore
  }
};

const storedToken = getAccessToken();
const storedUser = getStoredUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    access_token: storedToken || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    // Cập nhật thông tin user và token sau khi đăng nhập thành công
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.access_token = payload.access_token;
      state.isAuthenticated = true;
      state.error = null;
      setAccessToken(payload.access_token);
      setStoredUser(payload.user);
    },
    // Đăng xuất và xóa thông tin khỏi store + localStorage
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.isAuthenticated = false;
      state.error = null;
      removeAccessToken();
      removeStoredUser();
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logout, setError, clearError } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
