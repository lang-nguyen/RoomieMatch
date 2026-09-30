import { baseApi } from '../../../shared/api/baseApi';

export const matchingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo yêu cầu tìm phòng
    createRoomMatching: builder.mutation({
      query: (data) => ({
        url: '/matching/rooms',
        method: 'POST',
        body: data,
      }),
    }),

    // Lấy danh sách gợi ý roommate
    getRoommateSuggestions: builder.query({
      query: () => ({
        url: '/matching/roommates/suggestions',
        method: 'GET',
      }),
    }),

    // Tạo/Cập nhật hồ sơ matching
    createMatchingProfile: builder.mutation({
      query: (data) => ({
        url: '/matching/profile',
        method: 'POST',
        body: data,
      }),
    }),

    // Lấy thông tin hồ sơ matching hiện tại
    getMatchingProfile: builder.query({
      query: () => ({
        url: '/matching/profile',
        method: 'GET',
      }),
    }),

    // Danh sách roommate đã từ chối
    getRejectedRoommates: builder.query({
      query: () => ({
        url: '/matching/roommates/rejects',
        method: 'GET',
      }),
    }),

    // Lịch sử matching
    getMatchingHistory: builder.query({
      query: () => ({
        url: '/matching/roommates/history',
        method: 'GET',
      }),
    }),

    // Hủy ghép đôi
    unmatchRoommate: builder.mutation({
      query: (targetAccountId) => ({
        url: '/matching/roommates/unmatch',
        method: 'POST',
        body: { target_account_id: targetAccountId },
      }),
    }),

    // Từ chối roommate
    rejectRoommate: builder.mutation({
      query: (targetAccountId) => ({
        url: '/matching/roommates/reject',
        method: 'POST',
        body: { target_account_id: targetAccountId },
      }),
    }),

    // Chấp nhận roommate
    acceptRoommate: builder.mutation({
      query: (targetAccountId) => ({
        url: '/matching/roommates/accept',
        method: 'POST',
        body: { target_account_id: targetAccountId },
      }),
    }),
  }),
});

export const {
  useCreateRoomMatchingMutation,
  useGetRoommateSuggestionsQuery,
  useCreateMatchingProfileMutation,
  useGetMatchingProfileQuery,
  useGetRejectedRoommatesQuery,
  useGetMatchingHistoryQuery,
  useUnmatchRoommateMutation,
  useRejectRoommateMutation,
  useAcceptRoommateMutation,
} = matchingApi;