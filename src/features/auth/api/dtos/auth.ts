export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  login: string;
  name: string;
  email: string;
  roles?: string[];
}
