import { Cargo } from "./Cargo";
import { Empresa } from "./Empresa";

export type UsuarioGet = {
  codUsuario: string;
  codUsuarioErp: string;
  nome: string;
  cpf: string;
  email: string;
  login: string;
  tipoUsuario: {
    codTipoUsuario: number;
    nome: string;
    ativo: true;
  };
  ativo: true;
};
