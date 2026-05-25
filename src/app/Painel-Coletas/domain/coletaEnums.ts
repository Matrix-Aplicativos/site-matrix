import { ColetaExibida } from "./coletaMappers";

export const OPCOES_STATUS = {
  "Não Iniciada": "1",
  "Em Andamento": "4",
  "Finalizada Parcialmente": "2",
  "Finalizada Completa": "3",
} as const;

export const OPCOES_ORIGEM = {
  "Sob Demanda": "1",
  Avulsa: "2",
} as const;

export const SORT_COLUMN_MAP: Partial<Record<keyof ColetaExibida, string>> = {
  id: "codColeta",
  descricao: "descricao",
  data: "dataCadastro",
  origem: "origem",
  tipoMovimento: "tipo",
  status: "situacao",
  usuario: "funcionario",
  volumeTotal: "volumeTotal",
  volumeConferido: "volumeConferido",
} as const;

export const getOrigemText = (origem: string) =>
  origem === "1" ? "Sob Demanda" : origem === "2" ? "Avulsa" : origem;

export const getTipoMovimentoText = (tipo: string) =>
  tipo === "1"
    ? "Inventário"
    : tipo === "2"
      ? "Transferência"
      : tipo === "3"
        ? "Conf. Venda"
        : tipo === "4"
          ? "Conf. Compra"
          : tipo === "5"
            ? "Ajuste Entrada"
            : tipo === "6"
              ? "Ajuste Saída"
              : tipo === "7"
                ? "Romaneio"
                : tipo;

export const getStatusText = (status: string) => {
  switch (status) {
    case "1":
      return "Não Iniciada";
    case "2":
      return "Finalizada Parcialmente";
    case "3":
      return "Finalizada Completa";
    case "4":
      return "Em Andamento";
    default:
      return status;
  }
};

interface StatusClassNames {
  statusNotStarted?: string;
  statusPartial?: string;
  statusCompleted?: string;
  statusInProgress?: string;
}

export const getStatusClassName = (
  status: string,
  classes: StatusClassNames,
) => {
  switch (status) {
    case "1":
      return classes.statusNotStarted ?? "";
    case "2":
      return classes.statusPartial ?? "";
    case "3":
      return classes.statusCompleted ?? "";
    case "4":
      return classes.statusInProgress ?? "";
    default:
      return "";
  }
};
