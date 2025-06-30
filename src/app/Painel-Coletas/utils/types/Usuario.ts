import { Dispositivo } from "./Dispositivo";
import { Empresa } from "./Empresa";

export interface Usuario {
  primeiroAcesso: any;
  codUsuario: number,
  codUsuarioErp: string,
  nome: string,
  cpf: string,
  email: string,
  login: string,
  tipoUsuario: {
    codTipoUsuario: number,
    nome: string,
    ativo: true
  },
  ativo: true;
}
