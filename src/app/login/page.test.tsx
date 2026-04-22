import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// Mock do useAuth: cada teste decide o estado e o que login() faz
const loginMock = vi.fn();
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock do useRouter do Next: capturamos chamadas de replace()
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

// Mock do ThemeToggle: evita ter que envolver tudo no ThemeProvider
vi.mock("@/components/ThemeToggle", () => ({
  default: () => null,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockReset();
    replaceMock.mockReset();
    mockUseAuth.mockReturnValue({
      login: loginMock,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  afterEach(() => cleanup());

  // Caminho feliz: digita credenciais, submete, login é chamado e vai pro dashboard
  it("submits credentials and redirects to /dashboard on success", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("seu@email.com"), "gustavo@a.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(loginMock).toHaveBeenCalledWith({
      email: "gustavo@a.com",
      password: "123456",
    });
    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });

  // Caminho de erro: API rejeita → mostra a mensagem na tela e NÃO redireciona
  it("shows API error message when login fails", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce({ message: "Credenciais inválidas" });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("seu@email.com"), "x@y.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "errada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/credenciais inválidas/i)).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // Fallback: quando o erro não tem .message, usa a mensagem padrão
  it("falls back to a default message when the error has no message", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce({});

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("seu@email.com"), "x@y.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "qualquer");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/não foi possível entrar/i)).toBeInTheDocument();
  });

  // Se o usuário já está logado ao abrir a página, redireciona direto pro dashboard
  it("redirects to /dashboard if the user is already authenticated", () => {
    mockUseAuth.mockReturnValue({
      login: loginMock,
      isAuthenticated: true,
      isLoading: false,
    });

    render(<LoginPage />);

    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });
});
