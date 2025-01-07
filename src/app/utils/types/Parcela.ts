import { ParcelaId } from "./ParcelaId";

export interface Parcela {
    id: ParcelaId;
    valor: number;
    dataCadastro: string; // ISO date string
    dataUltimaAlteracao: string; // ISO date string
  }