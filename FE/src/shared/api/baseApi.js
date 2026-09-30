import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { serializeQueryParams } from './serializeQueryParams';
import { getAccessToken } from '../utils/authToken';
import { logout } from '../../features/auth/slice';

const baseQuery = fetchBaseQuery({
  // Trong môi trường dev luôn gọi relative path để đi qua Vite proxy,
  // tránh browser gọi thẳng BE dẫn tới CORS preflight (OPTIONS).
  baseUrl: import.meta.env.DEV
    ? '/api/v1'
    : (import.meta.env.VITE_API_URL || '/api/v1'),
  paramsSerializer: serializeQueryParams,
  prepareHeaders: (headers, { getState }) => {
    // Tự động thêm Token vào Header nếu đã đăng nhập.
    // Ưu tiên lấy từ redux state, fallback sang localStorage helper.
    let token = getState?.().auth?.access_token;
    if (!token) {
      token = getAccessToken();
    }

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

// Shared RTK Query base layer for real API calls.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Room', 'Review', 'LandlordRooms', 'LandlordPosts', 'LandlordStats', 'LandlordProfile', 'LandlordNotifications', 'RentalRequests', 'Verification', 'AdminUsers', 'AdminUserStats', 'AdminUserMeta', 'AdminDashboard', 'Analytics', 'Posts', 'Packages', 'Categories', 'Orders', 'Complaints'],
  endpoints: () => ({}),
});
