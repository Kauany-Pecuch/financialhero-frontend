import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AuthGuard from "./AuthGuard";

// Mock do useRouter do Next: capturamos chamadas em replaceMock
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

// Mock do useAuth: cada teste decide o que o hook devolve
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    mockUseAuth.mockReset();
  });

  // Limpa o DOM entre testes pra um teste não enxergar render do anterior
  afterEach(() => cleanup());

  // Caminho feliz: usuário autenticado → vê o conteúdo protegido, sem redirect
  it("renders children when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    render(
      <AuthGuard>
        <div>Conteúdo protegido</div>
      </AuthGuard>
    );

    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // Sutileza crítica: enquanto carrega, NÃO pode redirecionar
  // (sem isso, o usuário veria flash da tela de login antes do dashboard)
  it("shows loading and does not redirect while loading", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    render(
      <AuthGuard>
        <div>Conteúdo protegido</div>
      </AuthGuard>
    );

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // Bloqueio: terminou o loading e não está autenticado → redireciona
  it("redirects to /login when not authenticated and not loading", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    render(
      <AuthGuard>
        <div>Conteúdo protegido</div>
      </AuthGuard>
    );

    expect(replaceMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument();
  });
});
