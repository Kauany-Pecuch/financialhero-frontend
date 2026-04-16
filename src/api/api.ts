/**
 * Classe API para fazer requisições HTTP com o backend
 * Gerencia a comunicação REST com endpoints do servidor
 */

interface ApiError {
  message: string;
  status?: number;
}

interface RequestConfig {
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

export class API {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  /**
   * Define o token JWT para requisições autenticadas
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Remove o token JWT
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Monta a URL completa com query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Monta os headers padrão da requisição
   */
  private buildHeaders(config: RequestConfig = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Realiza uma requisição genérica
   */
  private async request<T>(
    method: string,
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    try {
      const url = this.buildURL(endpoint, config.params);
      const headers = this.buildHeaders(config);

      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (config.body) {
        requestOptions.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Erro de conexão com o servidor',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  /**
   * Requisição GET
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, config);
  }

  /**
   * Requisição POST
   */
  async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, {
      ...config,
      body,
    });
  }

  /**
   * Requisição PUT
   */
  async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, {
      ...config,
      body,
    });
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, config);
  }

  /**
   * Requisição PATCH
   */
  async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, {
      ...config,
      body,
    });
  }
}

// Instância singleton da API
export const api = new API(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080');
