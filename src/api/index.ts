/**
 * Arquivo de entrada da API
 * Exporta as classes e tipos para fácil importação
 */

export { API, api } from './api';
export { ApiClient, client } from './client';

export type {
  ApiError,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateBillRequest,
  Bill,
  BillListResponse,
  PaginationParams,
} from './client';

