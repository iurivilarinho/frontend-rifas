export interface User {
  id: number;
  foto?: File;
  nome: string;
  dataNascimento: string; // Utilizando string no formato YYYY-MM-DD
  cpf: string;
  rg: string;
  genero: string;
  estadoCivil: string;
  telefoneCelular: string;
  telefoneResidencial?: string;
  email: string;
  endereco: Endereco;
}
