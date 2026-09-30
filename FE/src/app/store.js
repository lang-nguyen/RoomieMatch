import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../shared/api/baseApi';
import { provincesApi } from '../shared/api/provincesApi';
import authReducer from '../features/auth/slice';
import landlordReducer from '../features/landlord/slice';

export const store = configureStore({
  reducer: {
    // Thêm reducer của baseApi vào store
    [baseApi.reducerPath]: baseApi.reducer,
    [provincesApi.reducerPath]: provincesApi.reducer,
    // Slice quản lý auth
    auth: authReducer,
    // Slice quản lý landlord dashboard
    landlord: landlordReducer,
  },
  // Thêm middleware của api để hỗ trợ caching, invalidation, polling... của rtk-query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, provincesApi.middleware),
});

// Thiết lập các listener để hỗ trợ các tính năng như refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);
