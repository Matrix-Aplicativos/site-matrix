export interface PedidoItemPainelApi {
  pedidoItem: {
    itemEmpresa: {
      codEmpresa: number;
      codItemEmpresa: number;
      item: {
        codItem: number;
        codItemErp: string;
        descricaoItem: string;
        descricaoMarca: string;
        codBarra: string;
        unidade?: string;
      };
    };
    ordemInsercao: number;
    qtdItem: number;
    descontoUnitario: number;
    porcentagemDescontoUnitario: number;
    precoUnitario: number;
    ativo: boolean;
  };
  precificacao?: {
    precoPraticado: number;
    descontoPraticado: number;
    descontoMax: number;
  };
  imagens?: unknown[];
}

export interface ItemPedidoDetalhado {
  codItem: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  unidade: string;
  qtdItem: number;
  precoUnitario: number;
  descontoUnitario: number;
  porcentagemDescontoUnitario: number;
  subTotal: number;
  ordemInsercao: number;
}

export function mapPedidoItemPainel(
  raw: PedidoItemPainelApi
): ItemPedidoDetalhado | null {
  const pedidoItem = raw?.pedidoItem;
  const itemEmpresa = pedidoItem?.itemEmpresa;
  const item = itemEmpresa?.item;

  if (!pedidoItem || !itemEmpresa || !item) {
    return null;
  }

  const qtdItem = Number(pedidoItem.qtdItem ?? 0);
  const precoUnitario = Number(pedidoItem.precoUnitario ?? 0);

  return {
    codItem: itemEmpresa.codItemEmpresa,
    codItemErp: item.codItemErp ?? "—",
    descricaoItem: item.descricaoItem ?? "—",
    descricaoMarca: item.descricaoMarca ?? "—",
    codBarra: item.codBarra ?? "N/A",
    unidade: item.unidade ?? "—",
    qtdItem,
    precoUnitario,
    descontoUnitario: Number(pedidoItem.descontoUnitario ?? 0),
    porcentagemDescontoUnitario: Number(
      pedidoItem.porcentagemDescontoUnitario ?? 0
    ),
    subTotal: qtdItem * precoUnitario,
    ordemInsercao: Number(pedidoItem.ordemInsercao ?? 0),
  };
}

export function mapPedidoItensPainel(
  conteudo: PedidoItemPainelApi[]
): ItemPedidoDetalhado[] {
  return (conteudo ?? [])
    .map(mapPedidoItemPainel)
    .filter((item): item is ItemPedidoDetalhado => item != null);
}
