import { createSlice } from '@reduxjs/toolkit';

const landlordSlice = createSlice({
  name: 'landlord',
  initialState: {
    // Rooms list state
    rooms: {
      items: [],
      total: 0,
      currentPage: 1,
      filters: {
        search: '',
        status: '',
        area: '',
        roomType: '',
        postedDate: '',
      },
    },
    // Current room being viewed/edited
    currentRoom: null,
    // Notifications
    notifications: {
      items: [],
      unread: 0,
    },
    // Packages
    packages: {
      available: [],
      currentTier: null,
    },
    // Add room form step
    addRoomStep: 0,
    addRoomDraft: null,

    // UI states
    error: null,
    loading: false,
  },
  reducers: {
    setRoomFilters: (state, { payload }) => {
      state.rooms.filters = { ...state.rooms.filters, ...payload };
      state.rooms.currentPage = 1;
    },
    setRoomsPage: (state, { payload }) => {
      state.rooms.currentPage = payload;
    },
    setCurrentRoom: (state, { payload }) => {
      state.currentRoom = payload;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    setAddRoomStep: (state, { payload }) => {
      state.addRoomStep = payload;
    },
    setAddRoomDraft: (state, { payload }) => {
      const serializablePayload = { ...(payload || {}) };
      delete serializablePayload.images;
      state.addRoomDraft = { ...(state.addRoomDraft || {}), ...serializablePayload };
    },
    replaceAddRoomDraft: (state, { payload }) => {
      const serializablePayload = { ...(payload || {}) };
      delete serializablePayload.images;
      state.addRoomDraft = serializablePayload;
    },
    clearAddRoomDraft: (state) => {
      state.addRoomDraft = null;
      state.addRoomStep = 0;
    },
    setNotifications: (state, { payload }) => {
      state.notifications = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setRoomFilters,
  setRoomsPage,
  setCurrentRoom,
  clearCurrentRoom,
  setAddRoomStep,
  setAddRoomDraft,
  replaceAddRoomDraft,
  clearAddRoomDraft,
  setNotifications,
  setError,
  clearError,
} = landlordSlice.actions;

export default landlordSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectRoomFilters = (state) => state.landlord.rooms.filters;
export const selectRoomsPage = (state) => state.landlord.rooms.currentPage;
export const selectCurrentRoom = (state) => state.landlord.currentRoom;
export const selectAddRoomStep = (state) => state.landlord.addRoomStep;
export const selectAddRoomDraft = (state) => state.landlord.addRoomDraft;
export const selectLandlordError = (state) => state.landlord.error;
