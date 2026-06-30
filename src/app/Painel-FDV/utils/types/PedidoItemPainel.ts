export interface PedidoItemEmpresaApi {
  codEmpresa: number;
  codItemEmpresa: number;
  codItem?: number;
  codItemErp?: string;
  descricaoItem?: string;
  descricaoMarca?: string;
  codBarra?: string;
  unidade?: string;
  item?: {
    codItem: number;
    codItemErp: string;
    descricaoItem: string;
    descricaoMarca: string;
    codBarra: string;
    unidade?: string;
  };
}

export interface PedidoItemPainelApi {
  pedidoItem: {
    itemEmpresa: PedidoItemEmpresaApi;
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

function resolveItemEmpresaFields(itemEmpresa: PedidoItemEmpresaApi) {
  const nested = itemEmpresa.item;

  return {
    codItemErp: nested?.codItemErp ?? itemEmpresa.codItemErp,
    descricaoItem: nested?.descricaoItem ?? itemEmpresa.descricaoItem,
    descricaoMarca: nested?.descricaoMarca ?? itemEmpresa.descricaoMarca,
    codBarra: nested?.codBarra ?? itemEmpresa.codBarra,
    unidade: nested?.unidade ?? itemEmpresa.unidade,
  };
}

export function mapPedidoItemPainel(
  raw: PedidoItemPainelApi
): ItemPedidoDetalhado | null {
  const pedidoItem = raw?.pedidoItem;
  const itemEmpresa = pedidoItem?.itemEmpresa;

  if (!pedidoItem || !itemEmpresa) {
    return null;
  }

  const fields = resolveItemEmpresaFields(itemEmpresa);

  if (!fields.codItemErp && !fields.descricaoItem) {
    return null;
  }

  const qtdItem = Number(pedidoItem.qtdItem ?? 0);
  const precoUnitario = Number(pedidoItem.precoUnitario ?? 0);

  return {
    codItem: itemEmpresa.codItemEmpresa,
    codItemErp: fields.codItemErp ?? "—",
    descricaoItem: fields.descricaoItem ?? "—",
    descricaoMarca: fields.descricaoMarca ?? "—",
    codBarra: fields.codBarra ?? "N/A",
    unidade: fields.unidade ?? "—",
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
