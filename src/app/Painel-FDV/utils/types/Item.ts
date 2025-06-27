import { ItemId } from "./ItemId";

export interface Item {
    id: ItemId;
    ordemInsercao: number;
    qtdItem: number;
    descontoUnitario: number;
    porcentagemDescontoUnitario: number;
    precoUnitario: number;
    dataCadastro: string; // ISO date string
    dataultimaAlteracao: string; // ISO date string
    procentagemDescontoUnitario: number;
  }