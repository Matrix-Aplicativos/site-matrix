export interface UltimoUtilizador {
  codUsuario?: number;
  nome?: string;
  login?: string;
}

export interface Dispositivo {
  codDispositivo: string;
  nomeDispositivo: string;
  codEmpresaApi: number;
  ativo: boolean;
  ultimoUtilizador?: UltimoUtilizador | null;
}