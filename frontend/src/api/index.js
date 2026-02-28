/**
 * Centralized API exports.
 * Each page imports only the API it needs - no unnecessary global calls.
 */

export { default as axiosInstance } from './axiosInstance';
export { projectsApi } from './services/projectsApi';
export { notificationsApi } from './services/notificationsApi';
export { projectTrackingApi } from './services/projectTrackingApi';
export { productionApi } from './services/productionApi';
export { supplyChainApi } from './services/supplyChainApi';
export { afterSalesApi } from './services/afterSalesApi';
export { collaborationApi } from './services/collaborationApi';
export { qualityApi } from './services/qualityApi';
export { searchApi } from './services/searchApi';
