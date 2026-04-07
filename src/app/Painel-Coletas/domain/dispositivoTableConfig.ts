export interface DispositivoExibido {
  nome: string;
  codigo: string;
  tipoLicenca: string;
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
}> = [
  { key: "nome", label: "Nome" },
  { key: "codigo", label: "Código" },
  { key: "tipoLicenca", label: "Tipo de Licença" },
  { key: "status", label: "Status" },
];
