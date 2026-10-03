import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { tokenStorage } from '@/services/tokenStorage';

export function useAuthStore() {
  const [user, setUserState] = useState<User | null>(() => tokenStorage.getUser());
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.getToken());
  const isAuthenticated = Boolean(token && user);

  const setAuth = (newUser: User, newToken: string) => {
    tokenStorage.setUser(newUser);
    tokenStorage.setToken(newToken);
    setUserState(newUser);
    setTokenState(newToken);
  };

  const logout = () => {
    tokenStorage.clearAll();
    setUserState(null);
    setTokenState(null);
  };

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
  };
}
