import { Cargo } from "./Cargo";
import { Dispositivo } from "./Dispositivo";
import { Empresa } from "./Empresa";

export interface Usuario {
  codUsuario: number;
    nome: string;
    cnpjcpf: string;
    email: string;
    login: string;
    cargo: Cargo;
    ativo: boolean,
    dispositivos : Dispositivo[],
    empresas: Empresa[]
  }