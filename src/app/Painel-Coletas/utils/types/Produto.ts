// src/app/inventarios/utils/types/Produto.ts

// Tipos auxiliares baseados no seu JSON
export interface Multiplicador {
  qtdMultiplicador: number;
  codBarras: string;
}

export interface Lote {
  numLote: string;
  dataValidade: string;
  dataFabricacao: string;
  qtdItens: number;
}

// Interface principal do Produto, agora correspondendo 100% à sua API
export interface Produto {
  codItemApi: number;
  codIntegracao: number;
  codEmpresaApi: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  grupo: string;
  subGrupo: string;
  familia: string;
  departamento: string;
  unidade: string;
  multiplicadores: Multiplicador[];
  utilizaLote: boolean;
  utilizaNumSerie: boolean;
  qtdConferida: number;
  lotes: Lote[];
  numerosSerie: string[];
  // O campo qtdEstoque não existe no novo JSON, então foi removido.
}
