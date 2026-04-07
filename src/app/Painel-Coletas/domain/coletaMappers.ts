export interface UsuarioNaColeta {
  nome?: string;
}

export interface ColetaApi {
  codConferencia: number;
  codColeta?: number;
  descricao: string;
  alocOrigem?: { descricao?: string | null } | null;
  dataCadastro: string;
  dataFim?: string | null;
  origem: string | number;
  tipo: string | number;
  usuario?: UsuarioNaColeta | null;
  respFinalizacao?: UsuarioNaColeta | string | null;
  status: string;
  integradoErp: boolean;
  statusSincronizacao: number;
  obsIntegracao?: string | null;
  qtdItens: number;
  qtdItensConferidos: number;
  volumeTotal: number;
  volumeConferido: number;
}

export interface ColetaExibida {
  id: number;
  codColeta?: number;
  descricao: string;
  estoqueOrigem: string;
  estoqueDestino?: string;
  planoConta?: string;
  data: string;
  dataFim: string | null;
  origem: string;
  tipoMovimento: string;
  usuario: string;
  respFinalizacao: string;
  status: string;
  integradoErp: boolean;
  statusSincronizacao: number;
  obsIntegracao?: string | null;
  qtdItens: number;
  qtdItensConferidos: number;
  volumeTotal: number;
  volumeConferido: number;
}

export function formatRespFinalizacao(
  value: UsuarioNaColeta | string | null | undefined,
): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.nome) return value.nome;
  return "—";
}

export function mapColetaToExibida(coleta: ColetaApi): ColetaExibida {
  return {
    id: coleta.codConferencia,
    codColeta: coleta.codColeta,
    descricao: coleta.descricao,
    estoqueOrigem: coleta.alocOrigem?.descricao || "",
    data: coleta.dataCadastro,
    dataFim: coleta.dataFim ?? null,
    origem: String(coleta.origem),
    tipoMovimento: String(coleta.tipo),
    usuario: coleta.usuario?.nome || "Usuário não informado",
    respFinalizacao: formatRespFinalizacao(coleta.respFinalizacao),
    status: coleta.status,
    integradoErp: coleta.integradoErp,
    statusSincronizacao: coleta.statusSincronizacao,
    obsIntegracao: coleta.obsIntegracao,
    qtdItens: coleta.qtdItens,
    qtdItensConferidos: coleta.qtdItensConferidos,
    volumeTotal: coleta.volumeTotal,
    volumeConferido: coleta.volumeConferido,
  };
}

export function mapColetaToExibidaComExtras(
  coleta: ColetaApi & {
    alocDestino?: { descricao?: string | null } | null;
    planoConta?: { descricao?: string | null } | null;
  },
): ColetaExibida {
  const base = mapColetaToExibida(coleta);
  return {
    ...base,
    estoqueDestino: coleta.alocDestino?.descricao || "-",
    planoConta: coleta.planoConta?.descricao || "-",
  };
}
