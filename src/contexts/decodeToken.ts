import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  wage: number;
}

interface JwtPayload extends AuthUser {
  exp?: number;
  iat?: number;
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      wage: Number(payload.wage ?? 0),
    };
  } catch {
    return null;
  }
}
