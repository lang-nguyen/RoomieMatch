import {
  currentUserContact,
  matchHistory,
  matchingUsers,
  skippedUsers,
} from '../data/matchingMockData';

const wait = (value, delay = 120) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });

export const matchingRepositoryMock = {
  getBootstrap: async () =>
    wait({
      hasProfile: false,
      hasContactInfo: false,
      currentUserContact,
      matchingUsers,
      matchHistory,
      skippedUsers,
    }),

  saveProfile: async (profile) =>
    wait({
      success: true,
      profile,
    }),

  saveContactInfo: async (contactInfo) =>
    wait({
      success: true,
      contactInfo,
    }),

  skipUser: async (user) =>
    wait({
      success: true,
      skippedUser: user,
    }),
};
