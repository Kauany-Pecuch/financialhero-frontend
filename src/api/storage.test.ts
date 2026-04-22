import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { authStorage } from "./storage";

describe("authStorage", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  // Caminho feliz: salvar, ler, limpar — cobre as 3 operações de uma vez
  it("sets, reads and clears a token", () => {
    authStorage.setToken("abc.def.ghi");
    expect(authStorage.getToken()).toBe("abc.def.ghi");

    authStorage.clear();
    expect(authStorage.getToken()).toBeNull();
  });

  // Garante que fazer login duas vezes não acumula tokens antigos
  it("overwrites an existing token on setToken", () => {
    authStorage.setToken("first");
    authStorage.setToken("second");
    expect(authStorage.getToken()).toBe("second");
  });
});
