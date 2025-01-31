import { Cargo } from "./Cargo";
import { Dispositivo } from "./Dispositivo";
import { Empresa } from "./Empresa";

export interface Usuario {
  codUsuario: number;
  codUsuarioErp: string;
    nome: string;
    cnpjcpf: string;
    email: string;
    login: string;
    cargo: Cargo;
    ativo: boolean,
    dispositivos : Dispositivo[],
    codEmpresa: number,
  }