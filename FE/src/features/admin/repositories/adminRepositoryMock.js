import { adminDashboardMockData } from '../api/adminMockData';

const wait = (value, delay = 160) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });

export const adminRepositoryMock = {
  getDashboard: async () => wait(adminDashboardMockData),
};
