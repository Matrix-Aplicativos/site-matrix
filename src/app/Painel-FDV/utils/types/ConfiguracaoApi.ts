export interface ConfiguracaoApi {
  codEmpresa: number;
  codConfiguracao: number;
  codigo: number;
  descricao: string;
  valor: string;
  ativo: boolean;
}

export function parseConfiguracoesResponse(data: unknown): ConfiguracaoApi[] {
  if (Array.isArray(data)) {
    return data as ConfiguracaoApi[];
  }
  return [];
}

export function isValorSimNao(valor: string): boolean {
  return valor === "S" || valor === "N";
}

export function isValorBoolean(valor: string): boolean {
  const normalized = valor.trim().toLowerCase();
  return normalized === "true" || normalized === "false";
}
