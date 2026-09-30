import { baseApi } from '../../../shared/api/baseApi';
import { adminDashboardMockData } from './adminMockData';

const wait = (value, delay = 160) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });

// Local mutable mock state (simulate a real database)
let mockUsers = [...adminDashboardMockData.users];
let mockPosts = [...adminDashboardMockData.posts];
let mockRooms = [...adminDashboardMockData.rooms];
let mockPackages = [...adminDashboardMockData.packages];
let mockCategories = { ...adminDashboardMockData.categories };
let mockOrders = [...adminDashboardMockData.orders];
let mockComplaints = [...adminDashboardMockData.complaints];

const postStatusLabels = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
};

const roomStatusLabels = {
  available: 'Trống',
  renting: 'Đang thuê',
  pending: 'Chờ duyệt',
  inactive: 'Tạm ngưng',
};

const orderStatusLabels = {
  success: 'Thành công',
  pending: 'Chờ thanh toán',
  failed: 'Thất bại',
};

const complaintStatusLabels = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  rejected: 'Từ chối',
};

export const adminApiMock = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── DASHBOARD ───
    getAdminDashboard: builder.query({
      queryFn: async () => ({ data: await wait(adminDashboardMockData) }),
    }),

    // ─── ANALYTICS ───
    getAnalytics: builder.query({
      queryFn: async () => ({ data: await wait(adminDashboardMockData.analytics) }),
    }),

    // ─── USERS ───
    getUsers: builder.query({
      queryFn: async ({ search = '', role = '', status = '' } = {}) => {
        let result = [...mockUsers];
        if (search) result = result.filter(u => u.username.includes(search) || u.email.includes(search));
        if (role) result = result.filter(u => u.role === role);
        if (status) result = result.filter(u => u.status === status);
        return { data: await wait(result) };
      },
    }),
    createUser: builder.mutation({
      queryFn: async (body) => {
        const newUser = { ...body, id: `U${String(mockUsers.length + 1).padStart(3, '0')}` };
        mockUsers.push(newUser);
        return { data: await wait(newUser) };
      },
    }),
    updateUser: builder.mutation({
      queryFn: async ({ id, ...changes }) => {
        mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...changes } : u);
        return { data: await wait({ id, ...changes }) };
      },
    }),
    deleteUser: builder.mutation({
      queryFn: async (id) => {
        mockUsers = mockUsers.filter(u => u.id !== id);
        return { data: await wait({ id }) };
      },
    }),

    // ─── POSTS ───
    getAdminPosts: builder.query({
      queryFn: async ({ status = '' } = {}) => {
        let result = [...mockPosts];
        if (status && status !== 'all') result = result.filter(p => {
          if (status === 'featured') return p.isFeatured;
          return p.status === status;
        });
        return { data: await wait(result) };
      },
    }),
    updatePostStatus: builder.mutation({
      queryFn: async ({ id, ...changes }) => {
        const nextChanges = {
          ...changes,
          ...(changes.status ? { statusLabel: postStatusLabels[changes.status] } : {}),
        };
        mockPosts = mockPosts.map(p => p.id === id ? { ...p, ...nextChanges } : p);
        return { data: await wait({ id, ...nextChanges }) };
      },
    }),
    deletePost: builder.mutation({
      queryFn: async (id) => {
        mockPosts = mockPosts.filter(p => p.id !== id);
        return { data: await wait({ id }) };
      },
    }),

    // ─── ROOMS ───
    getRooms: builder.query({
      queryFn: async ({ area = '', roomType = '', status = '' } = {}) => {
        let result = [...mockRooms];
        if (area) result = result.filter(r => r.area.includes(area));
        if (roomType) result = result.filter(r => r.roomType === roomType);
        if (status) result = result.filter(r => r.status === status);
        return { data: await wait(result) };
      },
    }),
    updateRoomStatus: builder.mutation({
      queryFn: async ({ id, status }) => {
        mockRooms = mockRooms.map(r => r.id === id ? { ...r, status, statusLabel: roomStatusLabels[status] } : r);
        return { data: await wait({ id, status, statusLabel: roomStatusLabels[status] }) };
      },
    }),

    // ─── PACKAGES ───
    // getPackages: builder.query({
    //   queryFn: async ({ targetCustomer = '' } = {}) => {
    //     let result = [...mockPackages];
    //     if (targetCustomer && targetCustomer !== 'all') result = result.filter(p => {
    //       if (targetCustomer === 'suspended') return p.status === 'suspended';
    //       return p.targetCustomer === targetCustomer;
    //     });
    //     return { data: await wait(result) };
    //   },
    // }),
    // createPackage: builder.mutation({
    //   queryFn: async (body) => {
    //     const newPkg = { ...body, id: `PKG${String(mockPackages.length + 1).padStart(3, '0')}`, totalPurchased: 0 };
    //     mockPackages.push(newPkg);
    //     return { data: await wait(newPkg) };
    //   },
    // }),
    // updatePackage: builder.mutation({
    //   queryFn: async ({ id, ...changes }) => {
    //     mockPackages = mockPackages.map(p => p.id === id ? { ...p, ...changes } : p);
    //     return { data: await wait({ id, ...changes }) };
    //   },
    // }),
    // deletePackage: builder.mutation({
    //   queryFn: async (id) => {
    //     mockPackages = mockPackages.filter(p => p.id !== id);
    //     return { data: await wait({ id }) };
    //   },
    // }),

    // ─── CATEGORIES ───
    getCategories: builder.query({
      queryFn: async (tab = 'area') => ({
        data: await wait({ tab, items: mockCategories[tab] || [] }),
      }),
    }),
    createCategory: builder.mutation({
      queryFn: async (body) => {
        const { tab, ...rest } = body;
        const newCat = { ...rest, id: `CAT_${tab.toUpperCase()}_${Date.now()}` };
        mockCategories[tab] = [...(mockCategories[tab] || []), newCat];
        return { data: await wait(newCat) };
      },
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      queryFn: async (id) => {
        for (const tab of Object.keys(mockCategories)) {
          mockCategories[tab] = mockCategories[tab].filter(c => c.id !== id);
        }
        return { data: await wait({ id }) };
      },
      invalidatesTags: ['Categories'],
    }),

    // ─── ORDERS ───
    getOrders: builder.query({
      queryFn: async ({ status = '' } = {}) => {
        let result = [...mockOrders];
        if (status) result = result.filter(o => o.status === status);
        return { data: await wait(result) };
      },
    }),
    updateOrderStatus: builder.mutation({
      queryFn: async ({ id, status }) => {
        mockOrders = mockOrders.map(o => o.id === id ? { ...o, status, statusLabel: orderStatusLabels[status] } : o);
        return { data: await wait({ id, status, statusLabel: orderStatusLabels[status] }) };
      },
    }),
    deleteOrder: builder.mutation({
      queryFn: async (id) => {
        mockOrders = mockOrders.filter(o => o.id !== id);
        return { data: await wait({ id }) };
      },
    }),

    // ─── COMPLAINTS ───
    getComplaints: builder.query({
      queryFn: async ({ status = '', search = '' } = {}) => {
        let result = [...mockComplaints];
        if (status && status !== 'all') result = result.filter(c => c.status === status);
        if (search) result = result.filter(c => c.sender.includes(search) || c.type.includes(search));
        return { data: await wait(result) };
      },
    }),
    updateComplaintStatus: builder.mutation({
      queryFn: async ({ id, status }) => {
        mockComplaints = mockComplaints.map(c => c.id === id ? { ...c, status, statusLabel: complaintStatusLabels[status] } : c);
        return { data: await wait({ id, status, statusLabel: complaintStatusLabels[status] }) };
      },
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAnalyticsQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAdminPostsQuery,
  useUpdatePostStatusMutation,
  useDeletePostMutation,
  useGetRoomsQuery,
  useUpdateRoomStatusMutation,
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useGetComplaintsQuery,
  useUpdateComplaintStatusMutation,
} = adminApiMock;
