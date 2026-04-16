/**
 * Cliente da API - Camada de negócio
 * Abstrai as chamadas da API fornecendo métodos específicos para cada recurso
 */

import { api } from './api';

// ===== TIPOS =====
export interface ApiError {
  message: string;
  status?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  token: string;
}

export interface CreateBillRequest {
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  paid: boolean;
}

export interface Bill {
  id: string;
  userId: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillListResponse {
  content: Bill[];
  totalItems: number;
  itemCount: number;
  sort: {
    property?: string;
    direction?: string;
  }[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export class ApiClient {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse>('/user/register', data);
  }

  /**
   * Realiza login do usuário
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/user/login', data);
  }

  /**
   * Define o token JWT para requisições autenticadas
   */
  setAuthToken(token: string): void {
    api.setToken(token);
  }

  /**
   * Remove o token JWT
   */
  clearAuthToken(): void {
    api.clearToken();
  }

  // ========== BILLS ==========

  /**
   * Cria uma nova conta bancária
   */
  async createBill(userId: string, data: CreateBillRequest): Promise<Bill> {
    return api.post<Bill>(`/bill/${userId}/create`, data);
  }

  /**
   * Lista as contas bancárias do usuário com paginação
   */
  async listBills(
    userId: string,
    pagination?: PaginationParams
  ): Promise<BillListResponse> {
    return api.get<BillListResponse>(`/bill/${userId}/list`, {
      params: pagination ? {
        page: pagination.page || 0,
        size: pagination.size || 10,
        ...(pagination.sort && { sort: pagination.sort }),
      } : undefined,
    });
  }

  /**
   * Lista todas as contas sem paginação
   */
  async getAllBills(userId: string): Promise<Bill[]> {
    const response = await this.listBills(userId, { size: 1000 });
    return response.content;
  }
}

// Instância singleton do cliente
export const client = new ApiClient();
