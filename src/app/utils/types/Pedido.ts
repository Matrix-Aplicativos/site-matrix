import { Item } from "./Item";
import { Parcela } from "./Parcela";
import { Vendedor } from "./Vendedor";

export interface Pedido {
    codEmpresa: number;
    codPedido: number;
    codCliente: number;
    vendedor: Vendedor;
    codCondicaoPagamento: number;
    observacao: string;
    valorTotal: number;
    status: string;
    itens: Item[];
    parcelas: Parcela[];
    outrosAcrescimos: number;
    valorFrete: number;
    dataCadastro: string;
  }