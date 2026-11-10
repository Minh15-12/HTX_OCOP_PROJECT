export interface UserRole {
  id?: string;
  code?: string;
  name?: string;
  display_name?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  cooperative_id?: string | null;
  cooperative_name?: string | null;
  member_id?: string | null;
  member_code?: string | null;
  status: string;
  roles: any[];
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponseData {
  user: User;
  token: string;
  cooperative?: {
    id: string;
    cooperative_code: string;
    legal_name: string;
  } | null;
}
