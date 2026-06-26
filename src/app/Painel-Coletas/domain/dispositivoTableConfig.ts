export interface UltimoUtilizador {
  codUsuario?: number;
  nome?: string;
  login?: string;
}

export function formatUltimoUtilizador(
  ultimoUtilizador?: UltimoUtilizador | null
): string {
  if (!ultimoUtilizador) return "";
  const nome = ultimoUtilizador.nome?.trim();
  if (nome) return nome;
  return ultimoUtilizador.login?.trim() ?? "";
}

export interface DispositivoExibido {
  nome: string;
  codigo: string;
  tipoLicenca: string;
  ultimoUtilizador: string;
  status: boolean;
}

export const DISPOSITIVO_SORT_COLUMN_MAP: {
  [key in keyof DispositivoExibido]?: string;
} = {
  nome: "nome",
  codigo: "id.codDispositivo",
  tipoLicenca: "tipoLicenca",
  status: "ativo",
};

export const DISPOSITIVO_COLUMNS: Array<{
  key: keyof DispositivoExibido;
  label: string;
  sortable?: boolean;
}> = [
  { key: "ultimoUtilizador", label: "Usuario", sortable: false },
  { key: "nome", label: "Nome" },
  { key: "codigo", label: "Código" },
  { key: "tipoLicenca", label: "Tipo de Licença" },
  { key: "status", label: "Status" },
];
