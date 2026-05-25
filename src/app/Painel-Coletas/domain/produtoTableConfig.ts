export interface ProdutoExibido {
  id: number;
  codigoErp: string;
  descricao: string;
  unidade: string;
  marca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
}

export const PRODUTO_SORT_COLUMN_MAP: { [key in keyof ProdutoExibido]?: string } = {
  codigoErp: "cadastroItem.codItemErp",
  descricao: "cadastroItem.descricaoItem",
  unidade: "cadastroItem.unidade",
  marca: "cadastroItem.descricaoMarca",
  codBarra: "cadastroItem.codBarra",
  codReferencia: "cadastroItem.codReferencia",
  codFabricante: "cadastroItem.codFabricante",
};

export const PRODUTO_FILTER_TO_API_PARAM: Record<string, string> = {
  codigoErp: "codErp",
  descricao: "descricao",
  marca: "marca",
  codBarra: "codBarras",
  codReferencia: "codReferencia",
  codFabricante: "codFabricante",
};

export const PRODUTO_COLUMNS: Array<{
  key: keyof ProdutoExibido;
  label: string;
  sortable: boolean;
}> = [
  { key: "codigoErp", label: "Código ERP", sortable: true },
  { key: "descricao", label: "Descrição", sortable: true },
  { key: "unidade", label: "Unidade", sortable: true },
  { key: "marca", label: "Marca", sortable: true },
  { key: "codBarra", label: "Cód. Barras", sortable: true },
  { key: "codReferencia", label: "Cód. Referência", sortable: true },
  { key: "codFabricante", label: "Cód. Fabricante", sortable: true },
];
