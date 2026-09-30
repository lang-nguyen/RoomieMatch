import { baseApi } from '../../../shared/api/baseApi';

export const landlordApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLandlordRooms: builder.query({
      query: ({ page = 1, pageSize = 6, search = '', status = '', area = '', roomType = '', postedDate = '' } = {}) => ({
        url: '/landlord/rooms',
        params: {
          page,
          page_size: pageSize,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(area ? { area, city: area, district: area } : {}),
          ...(roomType ? { room_type: roomType } : {}),
          ...(postedDate ? { posted_date: postedDate } : {}),
        },
      }),
      providesTags: ['LandlordRooms'],
    }),

    getLandlordRoomById: builder.query({
      query: ({ id }) => `/landlord/rooms/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: 'LandlordRooms', id }],
    }),

    addRoom: builder.mutation({
      query: ({ payload, images = [], publish = false }) => {
        const body = new FormData();
        body.append('payload', JSON.stringify(payload));
        body.append('publish', String(publish));
        images.forEach((file) => body.append('images', file));
        return { url: '/landlord/rooms', method: 'POST', body };
      },
      invalidatesTags: ['LandlordRooms', 'LandlordPosts', 'LandlordStats', 'Posts', 'Packages'],
    }),

    updateRoom: builder.mutation({
      query: ({ id, payload, images = [] }) => {
        const body = new FormData();
        body.append('payload', JSON.stringify(payload));
        images.forEach((file) => body.append('images', file));
        return { url: `/landlord/rooms/${id}`, method: 'PUT', body };
      },
      invalidatesTags: ['LandlordRooms', 'LandlordStats', 'Posts', 'Packages'],
    }),

    deleteRoom: builder.mutation({
      query: ({ id }) => ({ url: `/landlord/rooms/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LandlordRooms', 'LandlordPosts', 'LandlordStats', 'Posts'],
    }),
    deleteLandlordRoomImage: builder.mutation({
      query: ({ roomId, imageId }) => ({ url: `/landlord/rooms/${roomId}/images/${imageId}`, method: 'DELETE' }),
      invalidatesTags: ['LandlordRooms'],
    }),

    getLandlordPosts: builder.query({
      query: ({ page = 1, pageSize = 8, search = '', status = '', boostedOnly = false } = {}) => ({
        url: '/landlord/posts',
        params: {
          page,
          page_size: pageSize,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(boostedOnly ? { boostedOnly: true } : {}),
        },
      }),
      providesTags: ['LandlordPosts'],
    }),

    getLandlordStats: builder.query({
      query: ({ range = '30d', date = '' } = {}) => ({
        url: '/landlord/stats',
        params: {
          range,
          ...(date ? { date } : {}),
        },
      }),
      providesTags: ['LandlordStats'],
    }),

    getLandlordPostDetail: builder.query({
      query: ({ id }) => `/landlord/posts/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: 'LandlordPosts', id }],
    }),

    createLandlordPost: builder.mutation({
      query: ({ room_id, roomId, is_vip = false, title, description }) => ({
        url: '/landlord/posts',
        method: 'POST',
        body: {
          room_id: Number(room_id || roomId),
          is_vip,
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      }),
      invalidatesTags: ['LandlordPosts', 'LandlordStats', 'Posts', 'Packages'],
    }),

    updateLandlordPost: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/landlord/posts/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['LandlordPosts', 'LandlordStats', 'Posts', 'Packages'],
    }),

    deleteLandlordPost: builder.mutation({
      query: ({ id }) => ({ url: `/landlord/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LandlordPosts', 'LandlordStats', 'Posts', 'Packages'],
    }),

    boostLandlordPost: builder.mutation({
      query: ({ id }) => ({
        url: `/landlord/posts/${id}`,
        method: 'PATCH',
        body: { status: 'boosted' },
      }),
      invalidatesTags: ['LandlordPosts', 'LandlordStats', 'Posts', 'Packages'],
    }),

    cancelPostBoost: builder.mutation({
      query: ({ id }) => ({
        url: `/landlord/posts/${id}`,
        method: 'PATCH',
        body: { status: 'approved' },
      }),
      invalidatesTags: ['LandlordPosts', 'LandlordStats', 'Posts'],
    }),

    getLandlordPackages: builder.query({
      query: () => ({ url: '/packages/', method: 'GET', params: { target_role: 'landlord' } }),
      transformResponse: (response) => ({
        items: (Array.isArray(response) ? response : []).map(mapPackageFromApi),
      }),
      providesTags: ['Packages'],
    }),

    getLandlordPackageById: builder.query({
      query: () => ({ url: '/packages/', method: 'GET', params: { target_role: 'landlord' } }),
      transformResponse: (response, _meta, { packageId }) => ({
        package: (Array.isArray(response) ? response : [])
          .map(mapPackageFromApi)
          .find((pkg) => String(pkg.id) === String(packageId)) || null,
      }),
      providesTags: ['Packages'],
    }),

    purchaseLandlordPackage: builder.mutation({
      query: ({ packageId }) => ({
        url: '/packages/purchase',
        method: 'POST',
        body: { package_id: Number(packageId) },
      }),
      invalidatesTags: ['Packages'],
    }),

    getLandlordPackageHistory: builder.query({
      async queryFn(_args, _queryApi, _extraOptions, baseQuery) {
        const [purchasesResult, packagesResult, entitlementsResult] = await Promise.all([
          baseQuery({ url: '/packages/me/purchases', method: 'GET' }),
          baseQuery({ url: '/packages/', method: 'GET', params: { target_role: 'landlord' } }),
          baseQuery({ url: '/packages/me/entitlements', method: 'GET' }),
        ]);

        const error = purchasesResult.error || packagesResult.error || entitlementsResult.error;
        if (error) return { error };

        return {
          data: {
            items: mapLandlordPurchaseHistory(
              purchasesResult.data || [],
              packagesResult.data || [],
              entitlementsResult.data || [],
            ),
          },
        };
      },
      providesTags: ['Packages'],
    }),

    getLandlordPackageUsageDetail: builder.query({
      async queryFn({ id }, _queryApi, _extraOptions, baseQuery) {
        const [purchasesResult, packagesResult, entitlementsResult] = await Promise.all([
          baseQuery({ url: '/packages/me/purchases', method: 'GET' }),
          baseQuery({ url: '/packages/', method: 'GET', params: { target_role: 'landlord' } }),
          baseQuery({ url: '/packages/me/entitlements', method: 'GET' }),
        ]);

        const error = purchasesResult.error || packagesResult.error || entitlementsResult.error;
        if (error) return { error };

        const items = mapLandlordPurchaseHistory(
          purchasesResult.data || [],
          packagesResult.data || [],
          entitlementsResult.data || [],
        );

        return { data: { detail: items.find((item) => String(item.id) === String(id)) || null } };
      },
      providesTags: ['Packages'],
    }),

    getLandlordProfile: builder.query({
      query: () => '/users/me/profile',
      transformResponse: (response) => ({
        profile: {
          ...response.profile,
          id: response.account.id,
          display_name: response.profile.full_name || response.account.username,
          nickname: response.profile.full_name || response.account.username,
          avatar: response.profile.avatar_url,
          dob: response.profile.date_of_birth,
          location: response.profile.address,
          role: response.account.account_type === 'landlord' ? 'Chủ trọ' : response.account.account_type,
          status: response.account.status,
          cccd_verified: false,
        },
      }),
      providesTags: ['LandlordProfile'],
    }),
    updateLandlordProfile: builder.mutation({
      query: (body) => ({ url: '/users/me/profile', method: 'PATCH', body }),
      invalidatesTags: ['LandlordProfile', 'User'],
    }),
    uploadLandlordAvatar: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/users/me/avatar',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['LandlordProfile'],
    }),
    getLandlordNotifications: builder.query({
      query: ({ page = 1, pageSize = 20 } = {}) => ({ url: '/landlord/notifications', params: { limit: pageSize, offset: (page - 1) * pageSize } }),
      transformResponse: (response) => ({ ...response, items: response.items.map((item) => ({ ...item, createdAt: item.created_at })) }),
      providesTags: ['LandlordNotifications'],
    }),
    markLandlordNotificationRead: builder.mutation({
      query: ({ id }) => ({ url: `/landlord/notifications/${id}`, method: 'PATCH' }),
      invalidatesTags: ['LandlordNotifications'],
    }),
    getPublicCategories: builder.query({
      query: () => '/metadata/categories',
    }),
    getLandlordVerification: builder.query({
      query: () => '/landlord/verification',
      providesTags: ['Verification'],
    }),
    submitLandlordVerification: builder.mutation({
      query: ({ legalName, identityNumber, issuedDate, issuedPlace, frontImage, backImage }) => {
        const body = new FormData();
        body.append('legal_name', legalName);
        body.append('identity_number', identityNumber);
        body.append('issued_date', issuedDate);
        body.append('issued_place', issuedPlace);
        body.append('front_image', frontImage);
        body.append('back_image', backImage);
        return { url: '/landlord/verification', method: 'POST', body };
      },
      invalidatesTags: ['Verification', 'LandlordNotifications'],
    }),
    getLandlordRentalRequests: builder.query({
      query: ({ status = '', search = '' } = {}) => ({
        url: '/landlord/rental-requests',
        params: {
          ...(status ? { status } : {}),
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ['RentalRequests'],
    }),
    decideLandlordRentalRequest: builder.mutation({
      query: ({ id, decision, reason }) => ({ url: `/landlord/rental-requests/${id}`, method: 'PATCH', body: { decision, reason } }),
      invalidatesTags: ['RentalRequests', 'LandlordRooms', 'LandlordPosts', 'LandlordStats', 'Posts', 'LandlordNotifications'],
    }),
    endLandlordRentalRequest: builder.mutation({
      query: ({ id }) => ({ url: `/landlord/rental-requests/${id}/end`, method: 'PATCH' }),
      invalidatesTags: ['RentalRequests', 'LandlordRooms', 'LandlordPosts', 'LandlordStats', 'Posts', 'LandlordNotifications'],
    }),
    createLandlordVnpayPayment: builder.mutation({
      query: ({ packageId }) => ({ url: '/payments/vnpay/create_url', method: 'POST', body: { package_id: Number(packageId) } }),
    }),
  }),
});

export const {
  useGetLandlordRoomsQuery,
  useGetLandlordRoomByIdQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useDeleteLandlordRoomImageMutation,
  useGetLandlordPostsQuery,
  useGetLandlordPostDetailQuery,
  useGetLandlordStatsQuery,
  useCreateLandlordPostMutation,
  useUpdateLandlordPostMutation,
  useDeleteLandlordPostMutation,
  useBoostLandlordPostMutation,
  useCancelPostBoostMutation,
  useGetLandlordPackagesQuery,
  useGetLandlordPackageByIdQuery,
  usePurchaseLandlordPackageMutation,
  useGetLandlordPackageHistoryQuery,
  useGetLandlordPackageUsageDetailQuery,
  useGetLandlordProfileQuery,
  useUpdateLandlordProfileMutation,
  useUploadLandlordAvatarMutation,
  useGetLandlordNotificationsQuery,
  useMarkLandlordNotificationReadMutation,
  useGetLandlordVerificationQuery,
  useSubmitLandlordVerificationMutation,
  useGetLandlordRentalRequestsQuery,
  useDecideLandlordRentalRequestMutation,
  useEndLandlordRentalRequestMutation,
  useCreateLandlordVnpayPaymentMutation,
  useGetPublicCategoriesQuery,
} = landlordApi;

const tierBySlug = {
  starter: 'basic',
  basic: 'basic',
  plus: 'pro',
  pro: 'pro',
  premium: 'vip',
  vip: 'vip',
  'landlord-basic': 'basic',
  'landlord-pro': 'pro',
  'landlord-vip': 'vip',
};

const parseJsonValue = (value) => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeFeatureLabel = (feature) => {
  if (typeof feature === 'string') return feature;
  if (!feature || typeof feature !== 'object') return '';

  const quantity = feature.quantity ?? feature.value ?? feature.limit;
  const label = feature.label || feature.feature_name || feature.name || feature.title;

  if (quantity !== undefined && label) return `${quantity} ${label}`;
  return label || '';
};

const buildDisplayFeatures = (rawValue) => {
  const rawFeatures = parseJsonValue(rawValue) || {};

  if (Array.isArray(rawFeatures)) {
    return rawFeatures.map(normalizeFeatureLabel).filter(Boolean);
  }

  if (typeof rawFeatures === 'object') {
    const list = rawFeatures.list || rawFeatures.features || rawFeatures.benefits || rawFeatures.items;
    if (Array.isArray(list) && list.length) {
      return list.map(normalizeFeatureLabel).filter(Boolean);
    }

    return [];
  }

  return [];
};


const mapPackageFromApi = (pkg) => {
  const tier = tierBySlug[pkg.slug] || tierBySlug[String(pkg.name || '').toLowerCase()] || 'basic';
  const displayList = buildDisplayFeatures(pkg.features);

  const features = displayList.map((label) => ({
    label,
    included: true,
  }));

  return {
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    tier,
    price: Number(pkg.price_cents) || 0,
    unit: pkg.period === 'annual' ? 'năm' : 'tháng',
    durationLabel: pkg.period === 'annual' ? '1 năm' : '30 ngày',
    description: pkg.description,
    isFeatured: tier === 'pro',
    badge: tier === 'vip' ? 'VIP' : tier === 'pro' ? 'hot' : null,
    features,
    ctaLabel: 'Chọn gói',
    raw: pkg,
  };
};

const addDays = (dateValue, days) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const getEntitlementQuantity = (entitlements, purchaseId, featureKey) => {
  const entitlement = entitlements.find(
    (item) => String(item.source_purchase_id) === String(purchaseId) && item.feature_key === featureKey,
  );
  return entitlement?.quantity ?? 0;
};

const getPackageFeatureLimit = (pkg, featureKey) => {
  const features = parseJsonValue(pkg.raw?.features) || {};
  const value = !Array.isArray(features) && typeof features === 'object' ? features[featureKey] : null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const mapLandlordPurchaseHistory = (purchases, packages, entitlements) => {
  const packageById = new Map(packages.map((pkg) => [Number(pkg.id), mapPackageFromApi(pkg)]));

  return purchases
    .map((purchase) => {
      const pkg = packageById.get(Number(purchase.package_id));
      if (!pkg) return null;

      const expiredDate = entitlements.find(
        (item) => String(item.source_purchase_id) === String(purchase.id) && item.expires_at,
      )?.expires_at || addDays(purchase.created_at, 30);
      const isActive = purchase.status === 'paid' && (!expiredDate || new Date(expiredDate) >= new Date());
      const postsLimit = getPackageFeatureLimit(pkg, 'posts_limit');
      const photoLimit = getPackageFeatureLimit(pkg, 'photo_limit');
      const boostLimit = getPackageFeatureLimit(pkg, 'boost_limit');
      const postsRemaining = getEntitlementQuantity(entitlements, purchase.id, 'posts_limit');
      const photoRemaining = getEntitlementQuantity(entitlements, purchase.id, 'photo_limit');
      const boostRemaining = getEntitlementQuantity(entitlements, purchase.id, 'boost_limit');

      return {
        id: purchase.id,
        packageId: purchase.package_id,
        packageName: pkg.name,
        tier: pkg.tier,
        price: purchase.amount_cents,
        purchaseDate: purchase.created_at,
        expiredDate,
        status: isActive ? 'active' : purchase.status,
        period: pkg.durationLabel,
        paymentMethod: purchase.provider,
        autoRenew: false,
        postsUsed: Math.max(0, postsLimit - postsRemaining),
        postsLimit,
        activePosts: 0,
        boostUsed: Math.max(0, boostLimit - boostRemaining),
        boostLimit,
        boostRemaining,
        photoUsed: Math.max(0, photoLimit - photoRemaining),
        photoLimit,
        photoRemaining,
        postsRemaining,
        roomViews: 0,
        remainingDays: expiredDate
          ? Math.max(0, Math.ceil((new Date(expiredDate) - new Date()) / 86400000))
          : null,
        benefits: pkg.features,
        timeline: [
          {
            id: 1,
            title: `Kích hoạt gói ${pkg.name}`,
            description: new Date(purchase.created_at).toLocaleString('vi-VN'),
            tone: 'success',
          },
          {
            id: 2,
            title: isActive ? 'Gói đang hoạt động' : 'Gói đã hết hiệu lực',
            description: expiredDate ? `Hết hạn: ${new Date(expiredDate).toLocaleDateString('vi-VN')}` : 'Không có ngày hết hạn',
            tone: isActive ? 'success' : 'danger',
          },
        ],
      };
    })
    .filter(Boolean)
    .sort((first, second) => new Date(second.purchaseDate) - new Date(first.purchaseDate));
};
