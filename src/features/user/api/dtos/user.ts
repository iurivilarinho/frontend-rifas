export interface UserAddress {
  cep: string;
  estado: string;
  cidade: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
}

export interface UserApiDto {
  id: number;
  login: string;
  name: string;
  cpf: string;
  rg?: string;
  dateOfBirth?: string;
  personalPhone: string;
  email: string;
  status: boolean;
  companyId: number | null;
  roles: unknown[];
  address?: UserAddress;
}
