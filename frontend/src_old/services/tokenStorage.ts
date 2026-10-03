import { User } from '@/types/auth';
import { Cooperative } from '@/types/tenant';

const TOKEN_KEY = 'htx_ocop_token';
const USER_KEY = 'htx_ocop_user';
const COOP_KEY = 'htx_ocop_cooperative';

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  getCooperative(): Cooperative | null {
    const data = localStorage.getItem(COOP_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCooperative(cooperative: Cooperative): void {
    localStorage.setItem(COOP_KEY, JSON.stringify(cooperative));
  },

  removeCooperative(): void {
    localStorage.removeItem(COOP_KEY);
  },

  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(COOP_KEY);
  },
};
