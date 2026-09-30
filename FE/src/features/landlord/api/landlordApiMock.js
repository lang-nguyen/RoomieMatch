import { baseApi } from '../../../shared/api/baseApi';
import {
  MOCK_ROOMS,
  MOCK_PACKAGES,
  MOCK_NOTIFICATIONS,
  MOCK_LANDLORD_PROFILE,
  MOCK_LANDLORD_POSTS,
  MOCK_POST_ENGAGEMENT,
  MOCK_PACKAGE_HISTORY,
  MOCK_PACKAGE_USAGE,
  MOCK_LANDLORD_STATS,
  buildRoom,
  findRoomById,
  findPackageById,
  delay,
} from './landlordMockData';

export const landlordApiMock = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getPublicCategories: builder.query({
      queryFn: async () => {
        await delay(200);
        return {
          data: {
            room_types: [
              { id: 'CAT_RT01', name: 'Phòng trọ', icon: 'home' },
              { id: 'CAT_RT02', name: 'Chung cư mini', icon: 'building' },
              { id: 'CAT_RT03', name: 'Ký túc xá', icon: 'users' },
              { id: 'CAT_RT04', name: 'Nhà nguyên căn', icon: 'home' },
              { id: 'CAT_RT05', name: 'Studio', icon: 'layout-dashboard' }
            ],
            amenities: [
              { id: 'CAT_UT01', name: 'Wifi', icon: 'wifi' },
              { id: 'CAT_UT02', name: 'Máy lạnh', icon: 'thermometer' },
              { id: 'CAT_UT03', name: 'Chỗ để xe', icon: 'truck' },
              { id: 'CAT_UT04', name: 'Ban công', icon: 'maximize' },
              { id: 'CAT_UT05', name: 'Thang máy', icon: 'arrow-up' }
            ]
          }
        };
      },
    }),

    // ── Rooms ──────────────────────────────────────────────────────────────
    getLandlordRooms: builder.query({
      queryFn: async ({ page = 1, pageSize = 6, search = '', status = '' } = {}) => {
        await delay(350);
        let filtered = MOCK_ROOMS.map(buildRoom);

        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.code.toLowerCase().includes(q) ||
              r.address.toLowerCase().includes(q),
          );
        }

        if (status) {
          filtered = filtered.filter((r) => r.status === status);
        }

        const total = filtered.length;
        const total_pages = Math.ceil(total / pageSize);
        const items = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data: { items, total, total_pages, page, page_size: pageSize } };
      },
    }),

    getLandlordRoomById: builder.query({
      queryFn: async ({ id }) => {
        await delay(200);
        const room = findRoomById(id);
        if (!room) {
          return { error: { status: 404, data: { message: 'Không tìm thấy phòng trọ' } } };
        }
        return { data: buildRoom(room) };
      },
    }),

    addRoom: builder.mutation({
      queryFn: async (roomData) => {
        await delay(500);
        const newRoom = buildRoom({
          id: Date.now(),
          code: `TRO-${String(MOCK_ROOMS.length + 1).padStart(3, '0')}`,
          ...roomData,
        });
        // Giả lập thêm vào danh sách (trong thực tế sẽ mutation server-side)
        MOCK_ROOMS.push({ ...roomData, id: newRoom.id, code: newRoom.code });
        return { data: newRoom };
      },
    }),

    updateRoom: builder.mutation({
      queryFn: async ({ id, ...data }) => {
        await delay(400);
        const idx = MOCK_ROOMS.findIndex((r) => r.id === Number(id));
        if (idx === -1) {
          return { error: { status: 404, data: { message: 'Không tìm thấy phòng trọ' } } };
        }
        const updated = buildRoom({ ...MOCK_ROOMS[idx], ...data });
        MOCK_ROOMS[idx] = { ...MOCK_ROOMS[idx], ...data };
        return { data: updated };
      },
    }),

    deleteRoom: builder.mutation({
      queryFn: async ({ id }) => {
        await delay(300);
        const idx = MOCK_ROOMS.findIndex((r) => r.id === Number(id));
        if (idx === -1) {
          return { error: { status: 404, data: { message: 'Không tìm thấy phòng trọ' } } };
        }
        MOCK_ROOMS.splice(idx, 1);
        return { data: { success: true } };
      },
    }),

    // ── Packages ───────────────────────────────────────────────────────────
    getPackages: builder.query({
      queryFn: async ({ tier = '', search = '' } = {}) => {
        await delay(250);
        let filtered = [...MOCK_PACKAGES];

        if (tier && tier !== 'all') {
          filtered = filtered.filter((p) => p.tier === tier);
        }

        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
        }

        return { data: { items: filtered } };
      },
    }),

    getPackageById: builder.query({
      queryFn: async ({ packageId }) => {
        await delay(200);
        const pkg = findPackageById(packageId);
        if (!pkg) {
          return { error: { status: 404, data: { message: 'Gói không tồn tại' } } };
        }
        return { data: { package: pkg } };
      },
    }),

    purchasePackage: builder.mutation({
      queryFn: async ({ packageId, paymentMethod = 'bank' }) => {
        await delay(600);
        const pkg = findPackageById(packageId);
        if (!pkg) {
          return { error: { status: 404, data: { message: 'Gói không tồn tại' } } };
        }

        if (paymentMethod === 'wallet') {
          return {
            error: {
              status: 402,
              data: {
                message: 'Ví điện tử tạm thời không xử lý được giao dịch. Vui lòng thử lại.',
              },
            },
          };
        }

        const orderId = `LBD${String(180 + Number(packageId)).padStart(3, '0')}`;
        return {
          data: {
            success: true,
            orderId,
            message: `Khởi tạo thanh toán gói ${pkg.name} thành công`,
            package: pkg,
            paymentMethod,
            amount: pkg.price,
            createdAt: '2026-02-31',
          },
        };
      },
    }),

    // ── Package Management ──────────────────────────────────────────────────
    getLandlordPackageHistory: builder.query({
      queryFn: async () => {
        await delay(250);
        return { data: { items: [...MOCK_PACKAGE_HISTORY] } };
      },
    }),

    getPackageUsageDetail: builder.query({
      queryFn: async ({ id } = {}) => {
        await delay(250);
        const detail = id && id !== MOCK_PACKAGE_USAGE.id
          ? MOCK_PACKAGE_HISTORY.find((item) => item.id === id)
          : null;

        return {
          data: {
            detail: detail
              ? { ...MOCK_PACKAGE_USAGE, ...detail, packageName: detail.packageName.toUpperCase() }
              : { ...MOCK_PACKAGE_USAGE },
          },
        };
      },
    }),

    renewPackage: builder.mutation({
      queryFn: async ({ id }) => {
        await delay(450);
        const target = MOCK_PACKAGE_HISTORY.find((item) => item.id === id);
        if (!target && id !== MOCK_PACKAGE_USAGE.id) {
          return { error: { status: 404, data: { message: 'Không tìm thấy gói' } } };
        }
        return { data: { success: true, message: 'Gia hạn gói thành công' } };
      },
    }),

    // ── Posts ────────────────────────────────────────────────────────────────
    getLandlordPosts: builder.query({
      queryFn: async ({
        page = 1,
        pageSize = 8,
        search = '',
        status = '',
        boostedOnly = false,
      } = {}) => {
        await delay(300);
        let filtered = [...MOCK_LANDLORD_POSTS];

        if (boostedOnly) {
          filtered = filtered.filter((post) => post.status === 'boosted');
        }

        if (status) {
          filtered = filtered.filter((post) => post.status === status);
        }

        if (search) {
          const q = search.trim().toLowerCase();
          filtered = filtered.filter(
            (post) =>
              post.title.toLowerCase().includes(q) ||
              post.code.toLowerCase().includes(q),
          );
        }

        const total = filtered.length;
        const total_pages = Math.max(1, Math.ceil(total / pageSize));
        const items = filtered.slice((page - 1) * pageSize, page * pageSize);

        const counts = MOCK_LANDLORD_POSTS.reduce(
          (acc, post) => {
            acc.total += 1;
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
          },
          { total: 0, pending: 0, approved: 0, boosted: 0, rejected: 0 },
        );

        return {
          data: {
            items,
            total,
            total_pages,
            page,
            page_size: pageSize,
            counts,
            engagement: MOCK_POST_ENGAGEMENT,
          },
        };
      },
    }),

    createLandlordPost: builder.mutation({
      queryFn: async (postData) => {
        await delay(450);
        const created = {
          id: Date.now(),
          code: `P${String(MOCK_LANDLORD_POSTS.length + 1).padStart(3, '0')}`,
          title: postData?.title || 'Bài đăng mới',
          author: postData?.author || 'Hảo',
          publishedAt: new Date().toISOString().slice(0, 10),
          status: 'pending',
          views: 0,
          likes: 0,
          comments: 0,
          boostDaysLeft: 0,
          boostTotalDays: 0,
          badges: [],
        };
        MOCK_LANDLORD_POSTS.unshift(created);
        return { data: created };
      },
    }),

    updateLandlordPost: builder.mutation({
      queryFn: async ({ id, ...updates }) => {
        await delay(350);
        const index = MOCK_LANDLORD_POSTS.findIndex((post) => post.id === Number(id));
        if (index === -1) {
          return { error: { status: 404, data: { message: 'Không tìm thấy bài đăng' } } };
        }
        MOCK_LANDLORD_POSTS[index] = { ...MOCK_LANDLORD_POSTS[index], ...updates };
        return { data: MOCK_LANDLORD_POSTS[index] };
      },
    }),

    deleteLandlordPost: builder.mutation({
      queryFn: async ({ id }) => {
        await delay(300);
        const index = MOCK_LANDLORD_POSTS.findIndex((post) => post.id === Number(id));
        if (index === -1) {
          return { error: { status: 404, data: { message: 'Không tìm thấy bài đăng' } } };
        }
        MOCK_LANDLORD_POSTS.splice(index, 1);
        return { data: { success: true } };
      },
    }),

    boostLandlordPost: builder.mutation({
      queryFn: async ({ id, days = 7 }) => {
        await delay(350);
        const post = MOCK_LANDLORD_POSTS.find((item) => item.id === Number(id));
        if (!post) {
          return { error: { status: 404, data: { message: 'Không tìm thấy bài đăng' } } };
        }
        post.status = 'boosted';
        post.boostDaysLeft = days;
        post.boostTotalDays = days;
        post.badges = post.badges?.length ? post.badges : ['Trang chủ'];
        return { data: post };
      },
    }),

    cancelPostBoost: builder.mutation({
      queryFn: async ({ id }) => {
        await delay(300);
        const post = MOCK_LANDLORD_POSTS.find((item) => item.id === Number(id));
        if (!post) {
          return { error: { status: 404, data: { message: 'Không tìm thấy bài đăng' } } };
        }
        post.status = 'approved';
        post.boostDaysLeft = 0;
        post.boostTotalDays = 0;
        post.badges = [];
        return { data: post };
      },
    }),

    // ── Stats ────────────────────────────────────────────────────────────────
    getLandlordStats: builder.query({
      queryFn: async ({ range = '30d' } = {}) => {
        await delay(300);
        return { data: { range, ...MOCK_LANDLORD_STATS } };
      },
    }),

    // ── Notifications ──────────────────────────────────────────────────────
    getLandlordNotifications: builder.query({
      queryFn: async ({ page = 1, pageSize = 10 } = {}) => {
        await delay(200);
        const total = MOCK_NOTIFICATIONS.length;
        const items = MOCK_NOTIFICATIONS.slice((page - 1) * pageSize, page * pageSize);
        const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
        return { data: { items, total, unread } };
      },
    }),

    // ── Profile ────────────────────────────────────────────────────────────
    getLandlordProfile: builder.query({
      queryFn: async () => {
        await delay(300);
        return { data: { profile: MOCK_LANDLORD_PROFILE } };
      },
    }),

    updateLandlordProfile: builder.mutation({
      queryFn: async (updates) => {
        await delay(400);
        Object.assign(MOCK_LANDLORD_PROFILE, updates);
        return { data: { profile: { ...MOCK_LANDLORD_PROFILE } } };
      },
    }),
  }),
});

export const {
  useGetLandlordRoomsQuery,
  useGetLandlordRoomByIdQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  usePurchasePackageMutation,
  useGetLandlordPackageHistoryQuery,
  useGetPackageUsageDetailQuery,
  useRenewPackageMutation,
  useGetLandlordPostsQuery,
  useCreateLandlordPostMutation,
  useUpdateLandlordPostMutation,
  useDeleteLandlordPostMutation,
  useBoostLandlordPostMutation,
  useCancelPostBoostMutation,
  useGetLandlordStatsQuery,
  useGetLandlordNotificationsQuery,
  useGetLandlordProfileQuery,
  useUpdateLandlordProfileMutation,
  useGetPublicCategoriesQuery,
} = landlordApiMock;
