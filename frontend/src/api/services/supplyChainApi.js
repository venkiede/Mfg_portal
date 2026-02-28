/**
 * Supply Chain API - used by SupplyChain page only.
 */

import axiosInstance from '../axiosInstance';

export const supplyChainApi = {
  getAll: () => axiosInstance.get('/supply-chain'),
};
