import { Cargo } from "./Cargo";

export interface Vendedor {
    codUsuario: number;
    nome: string;
    cnpjcpf: string;
    email: string;
    login: string;
    senha: string;
    cargo: Cargo;
    dataCadastro: string; // ISO date string
    dataUltimaAlteracao: string; // ISO date string
    ativo: boolean;
    primeiroAcesso: boolean;
    password: string;
    enabled: boolean;
    username: string;
    authorities: string[];
    accountNonExpired: boolean;
    credentialsNonExpired: boolean;
    accountNonLocked: boolean;
  }
  