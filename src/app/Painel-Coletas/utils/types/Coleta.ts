interface Coleta {
  codConferencia: number;
  codIntegracao: number;
  codEmpresa: number;
  codConferenciaErp: string;
  origem: string;
  status: string;
  tipo: number;
  descricao: string;
  codUsuario: number;
  dataInicio: string;
  dataFim: string;
  alocOrigem: Alocacao;
  alocDestino: Alocacao;
  itens: ItemConferencia[];
}