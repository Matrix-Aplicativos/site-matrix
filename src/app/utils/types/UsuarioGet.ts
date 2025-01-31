import { Cargo } from "./Cargo";
import { Empresa } from "./Empresa";

export type UsuarioGet = {
      codUsuario: number;
      codUsuarioErp: string;
        nome: string;
        cnpjcpf: string;
        email: string;
        login: string;
        cargo: Cargo;
        ativo: boolean,
        dispositivos : {
            id: {codDispositivo: string;
            };
            nomeDispositivo: string;
            ativo: boolean
        }[],
}