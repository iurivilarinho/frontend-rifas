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

export interface ClientRegistrationRequest {
  name: string;
  email: string;
  password: string;
  cpf: string;
  personalPhone?: string;
}
