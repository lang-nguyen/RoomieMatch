import { baseApi } from '../../../shared/api/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── DASHBOARD ───
    getAdminDashboard: builder.query({
      query: () => ({ url: '/admin/dashboard', method: 'GET' }),
      providesTags: ['AdminDashboard'],
    }),

    getAnalytics: builder.query({
      query: (year = 2026) => ({ url: `/admin/analytics?year=${year}`, method: 'GET' }),
      providesTags: ['Analytics'],
    }),

    // ─── USERS ───
    getUserMeta: builder.query({
      query: () => ({ url: '/admin/users/meta', method: 'GET' }),
      providesTags: ['AdminUserMeta'],
    }),
    getAdminUserStats: builder.query({
      query: () => ({ url: '/admin/users/stats', method: 'GET' }),
      providesTags: ['AdminUserStats'],
    }),
    getAdminUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        method: 'GET',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),
    getAdminUserById: builder.query({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'AdminUsers', id }],
    }),
    createAdminUser: builder.mutation({
      query: (body) => ({ url: '/admin/users', method: 'POST', body }),
      invalidatesTags: ['AdminUsers', 'AdminUserStats'],
    }),
    updateAdminUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => ['AdminUsers', 'AdminUserStats', { type: 'AdminUsers', id }],
    }),
    updateAdminUserStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => ['AdminUsers', 'AdminUserStats', { type: 'AdminUsers', id }],
    }),
    deleteAdminUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers', 'AdminUserStats'],
    }),
    getLandlordVerifications: builder.query({
      query: (params = {}) => ({ url: '/admin/landlord-verifications', params }),
      providesTags: ['Verification'],
    }),
    updateLandlordVerification: builder.mutation({
      query: ({ id, status, reason }) => ({ url: `/admin/landlord-verifications/${id}`, method: 'PATCH', body: { status, reason } }),
      invalidatesTags: ['Verification'],
    }),

    // ─── POSTS ───
    getAdminPosts: builder.query({
      query: (params) => ({ url: '/admin/posts', method: 'GET', params }),
      providesTags: ['Posts'],
    }),
    updatePostStatus: builder.mutation({
      query: ({ id, status, reason }) => ({ url: `/admin/posts/${id}/status`, method: 'PATCH', body: { status, reason } }),
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({ url: `/admin/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Posts'],
    }),

    // ─── ROOMS ───
    getRooms: builder.query({
      query: (params) => ({ url: '/admin/rooms', method: 'GET', params }),
      providesTags: ['Rooms'],
    }),
    updateRoomStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/rooms/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Rooms'],
    }),

    // ─── PACKAGES ───
    getPackages: builder.query({
      query: (params) => ({ url: '/admin/packages', method: 'GET', params }),
      providesTags: ['Packages'],
    }),
    createPackage: builder.mutation({
      query: (body) => ({ url: '/admin/packages', method: 'POST', body }),
      invalidatesTags: ['Packages'],
    }),
    updatePackage: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/packages/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Packages'],
    }),
    updatePackageStatus: builder.mutation({
      query: ({ id, active }) => ({ url: `/admin/packages/${id}/status`, method: 'PATCH', body: { active } }),
      invalidatesTags: ['Packages'],
    }),
    deletePackage: builder.mutation({
      query: (id) => ({ url: `/admin/packages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Packages'],
    }),

    // ─── CATEGORIES ───
    getCategories: builder.query({
      query: (tab) => ({ url: `/admin/categories?tab=${tab}`, method: 'GET' }),
      providesTags: ['Categories'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/admin/categories', method: 'POST', body }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Categories'],
    }),

    // ─── ROLE FEATURES ───
    getRoleFeatures: builder.query({
      query: (target_role) => {
        let url = '/admin/role-features';
        if (target_role && target_role !== 'all') url += `?target_role=${target_role}`;
        return { url, method: 'GET' };
      },
      providesTags: ['RoleFeatures'],
    }),
    createRoleFeature: builder.mutation({
      query: (body) => ({ url: '/admin/role-features', method: 'POST', body }),
      invalidatesTags: ['RoleFeatures'],
    }),
    updateRoleFeature: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/role-features/${id}`, method: 'PUT', body }),
      invalidatesTags: ['RoleFeatures'],
    }),
    deleteRoleFeature: builder.mutation({
      query: (id) => ({ url: `/admin/role-features/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RoleFeatures'],
    }),

    // ─── ORDERS ───
    getOrders: builder.query({
      query: (params) => ({ url: '/admin/orders', method: 'GET', params }),
      providesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Orders'],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({ url: `/admin/orders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Orders'],
    }),

    // ─── COMPLAINTS ───
    getComplaints: builder.query({
      query: (params) => ({ url: '/admin/complaints', method: 'GET', params }),
      providesTags: ['Complaints'],
    }),
    updateComplaintStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/complaints/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Complaints'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAnalyticsQuery,
  useGetUserMetaQuery,
  useGetAdminUserStatsQuery,
  useGetAdminUsersQuery,
  useLazyGetAdminUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminUserStatusMutation,
  useDeleteAdminUserMutation,
  useGetLandlordVerificationsQuery,
  useUpdateLandlordVerificationMutation,
  useGetAdminPostsQuery,
  useLazyGetAdminPostsQuery,
  useUpdatePostStatusMutation,
  useDeletePostMutation,
  useGetRoomsQuery,
  useUpdateRoomStatusMutation,
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useUpdatePackageStatusMutation,
  useDeletePackageMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetRoleFeaturesQuery,
  useCreateRoleFeatureMutation,
  useUpdateRoleFeatureMutation,
  useDeleteRoleFeatureMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetComplaintsQuery,
  useUpdateComplaintStatusMutation,
} = adminApi;
