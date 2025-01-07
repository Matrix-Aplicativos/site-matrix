import { Configuracao } from "./Configuracao";

export interface Empresa{
    codEmpresa : number,
    cnpj: string,
    razaoSocial: string,
    nomeFantasia: string,
    configuracoes: Configuracao[],
    maxUsuarios: number,
    ativo: boolean
}