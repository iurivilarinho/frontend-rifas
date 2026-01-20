export interface User {
  id: number;
  login: string;
  name: string;
  cpf: string;
  personalPhone: string;
  email: string;
  status: boolean;
  companyId: number | null;
  roles: any[];
}
