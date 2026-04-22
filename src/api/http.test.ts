import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { http, request, type ApiError } from "./http";
import { authStorage } from "./storage";

type AdapterFn = NonNullable<InternalAxiosRequestConfig["adapter"]>;
const originalAdapter = http.defaults.adapter;
const setAdapter = (a: AdapterFn) => { http.defaults.adapter = a; };
const restoreAdapter = () => { http.defaults.adapter = originalAdapter; };

// Monta um AxiosError simulando uma resposta HTTP com status/data customizados
function axiosResponseError(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown = {},
) {
  const err = new Error("request failed") as AxiosError;
  err.isAxiosError = true;
  err.config = config;
  err.response = { status, statusText: "", headers: {}, config, data };
  return err;
}

describe("http interceptors", () => {
  const originalLocation = window.location;
  let assignSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.clear();
    assignSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, pathname: "/dashboard", assign: assignSpy },
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    restoreAdapter();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  // Se houver token salvo, toda requisição sai com "Authorization: Bearer <token>".
  // Se não houver, o header não é setado.
  it("attaches Bearer token to the Authorization header when present", async () => {
    const headers: (string | undefined)[] = [];
    setAdapter(async (config) => {
      headers.push(config.headers?.get?.("Authorization") as string | undefined);
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    });

    await request({ method: "GET", url: "/anon" });
    authStorage.setToken("my-token");
    await request({ method: "GET", url: "/auth" });

    expect(headers).toEqual([undefined, "Bearer my-token"]);
  });

  // Erro com response do servidor vira ApiError com todos os campos preservados
  it("transforms a server error into ApiError with status/code/details", async () => {
    setAdapter(async (config) =>
      Promise.reject(axiosResponseError(config, 422, {
        message: "Campo inválido",
        code: "VALIDATION",
        details: { field: "email" },
      }))
    );

    await expect(request({ method: "POST", url: "/foo" })).rejects.toMatchObject({
      message: "Campo inválido",
      status: 422,
      code: "VALIDATION",
      details: { field: "email" },
    } satisfies Partial<ApiError>);
  });

  // Erros sem response (timeout, rede, desconhecido) viram mensagens amigáveis
  it.each([
    ["ECONNABORTED", undefined,         "Tempo de resposta esgotado"],
    [undefined,     "Network Error",    "Erro de conexão com o servidor"],
    [undefined,     "something weird",  "Erro inesperado"],
  ])("maps code=%s message=%s to '%s'", async (code, message, expected) => {
    setAdapter(async () => {
      const err = new Error(message ?? "") as AxiosError;
      err.isAxiosError = true;
      if (code) err.code = code;
      throw err;
    });

    await expect(request({ method: "GET", url: "/x" })).rejects.toMatchObject({
      message: expected,
    } satisfies Partial<ApiError>);
  });

  // 401 em rota protegida → limpa token e redireciona pra /login
  it("on 401 from a protected route, clears the token and redirects to /login", async () => {
    authStorage.setToken("expired-token");
    setAdapter(async (config) => Promise.reject(axiosResponseError(config, 401)));

    await expect(request({ method: "GET", url: "/me" })).rejects.toBeDefined();

    expect(authStorage.getToken()).toBeNull();
    expect(assignSpy).toHaveBeenCalledWith("/login");
  });

  // 401 estando em /login → limpa token mas NÃO redireciona (evita loop infinito)
  it("on 401 while already on /login, clears the token but does not redirect", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, pathname: "/login", assign: assignSpy },
    });
    authStorage.setToken("bad-token");
    setAdapter(async (config) => Promise.reject(axiosResponseError(config, 401)));

    await expect(request({ method: "POST", url: "/user/login" })).rejects.toBeDefined();

    expect(authStorage.getToken()).toBeNull();
    expect(assignSpy).not.toHaveBeenCalled();
  });
});
