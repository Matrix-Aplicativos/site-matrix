import { ConfiguracaoId } from "./ConfiguracaoId";

export interface Configuracao{
    id: ConfiguracaoId,
    descricao: string,
    valor: number,
    ativo: boolean
}