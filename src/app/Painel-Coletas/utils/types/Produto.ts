// utils/types/Produto.ts

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
  saldoDisponivel: number;
  ativo: boolean;
  multiplicadores: Multiplicador[];
  utilizaLote: boolean;
  utilizaNumSerie: boolean;
  qtdConferida: number;
  lotes: Lote[];
  numerosSerie: string[];
}
