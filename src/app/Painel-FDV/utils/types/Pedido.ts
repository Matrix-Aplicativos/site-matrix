export interface CondicaoPagamento {
  codIntegracao: number;
  codEmpresa: number;
  codCondicaoPagamento: number;
  codCondPagamentoErp: string;
  descricao: string;
  desdobramento: string;
  correcao: number;
  valorMinimo: number;
  utilizaPrecoDeCusto: boolean;
  percSobreCusto: number;
  percDescMaxDesconto?: number;
  participaPromocao?: boolean;
  ativo: boolean;
}

export interface VendedorPedido {
  codFuncionario: number;
  codIntegracao: number;
  codEmpresa: number | null;
  codUsuarioErp: string;
  codUsuario: number;
  nome: string;
  cpf: string;
  email: string;
  utilizaApp: boolean;
  ativo: boolean;
}

export interface ClientePedido {
  codCliente: number;
  codEmpresa?: number;
  codIntegracao?: number;
  codClienteErp?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpjCpf?: string;
}

export interface PedidoDetalhe {
  codPedido: number;
  codEmpresa: number;
  codIntegracao: number;
  codPedidoErp: string;
  cliente: ClientePedido | null;
  vendedor: VendedorPedido | null;
  condicaoPagamento: CondicaoPagamento | null;
  observacao: string | null;
  valorTotal: number;
  status: string;
  outrosAcrescimos: number;
  valorFrete: number;
  transportadora: unknown | null;
  numNotaFiscal: string | null;
  identificacaoCliente: string | null;
}

export interface PedidoListItem {
  pedido: PedidoDetalhe;
  subTotal: number;
  qtdItens: number;
  parcelas: unknown[];
  dataCadastro: string;
}

/** @deprecated Use PedidoListItem — mantido para compatibilidade pontual */
export type Pedido = PedidoListItem;

export function getClienteLabel(item: PedidoListItem): string {
  const { pedido } = item;
  if (pedido.cliente?.nomeFantasia) return pedido.cliente.nomeFantasia;
  if (pedido.cliente?.razaoSocial) return pedido.cliente.razaoSocial;
  if (pedido.identificacaoCliente) return pedido.identificacaoCliente;
  return "—";
}

export function getClienteCodigo(item: PedidoListItem): number | string | null {
  if (item.pedido.cliente?.codCliente) return item.pedido.cliente.codCliente;
  if (item.pedido.identificacaoCliente) return item.pedido.identificacaoCliente;
  return null;
}
