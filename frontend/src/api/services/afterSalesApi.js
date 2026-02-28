/**
 * After Sales API - used by AfterSales page only.
 */

import axiosInstance from '../axiosInstance';

export const afterSalesApi = {
  getAll: () => axiosInstance.get('/after-sales'),
};
