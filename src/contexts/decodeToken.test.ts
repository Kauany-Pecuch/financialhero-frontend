import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeToken } from "./decodeToken";

function base64url(v: string) {
  return Buffer.from(v, "utf-8").toString("base64")
    .replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function makeJwt(payload: Record<string, unknown>) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

const baseUser = {
  id: "user-1",
  email: "gustavo@example.com",
  firstName: "Gustavo",
  lastName: "Silles",
  wage: 5000,
};

describe("decodeToken", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  // Caminho feliz: token válido com exp futuro devolve todos os campos do usuário
  it("decodes a valid, non-expired token", () => {
    const token = makeJwt({ ...baseUser, exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(decodeToken(token)).toEqual(baseUser);
  });

  // Proteção crítica: token vencido é rejeitado → app desloga o usuário
  it("returns null when the token is expired", () => {
    const token = makeJwt({ ...baseUser, exp: Math.floor(Date.now() / 1000) - 60 });
    expect(decodeToken(token)).toBeNull();
  });

  // Normalização do campo wage: string vira número, ausência vira 0
  it("normalizes wage (missing → 0, string → number)", () => {
    const semWage = makeJwt({ ...baseUser, wage: undefined });
    expect(decodeToken(semWage)?.wage).toBe(0);

    const wageString = makeJwt({ ...baseUser, wage: "1234.50" });
    expect(decodeToken(wageString)?.wage).toBe(1234.5);
  });

  // Robustez: token quebrado não pode derrubar o app — devolve null em silêncio
  it("returns null for a malformed token", () => {
    expect(decodeToken("not-a-jwt")).toBeNull();
    expect(decodeToken("")).toBeNull();
  });
});
