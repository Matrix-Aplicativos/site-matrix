import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// --- Interfaces de Tipagem ---
interface Alocacao {
  codAlocEstoqueApi: number;
  codIntegracao: number;
  codEmpresaApi: number;
  codAlocEstoqueErp: string;
  descricao: string;
}

interface UsuarioNaColeta {
  codUsuario: number;
  codUsuarioErp: string;
  nome: string;
  cpf: string;
  email: string;
  ativo: boolean;
  utilizaApp: boolean;
}

export interface Coleta {
  codConferencia: number;
  codColeta: number;
  codIntegracao: number;
  codEmpresa: number;
  codConferenciaErp: string;
  origem: string;
  status: string;
  tipo: number;
  descricao: string;
  usuario: UsuarioNaColeta;
  dataInicio: string;
  dataFim: string;
  alocOrigem: Alocacao;
  alocDestino: Alocacao;
  qtdItens: number;
  qtdItensConferidos: number; // <-- CAMPO ADICIONADO
  volumeTotal: number;
  volumeConferido: number;
  origemCadastro: string;
  integradoErp: boolean;
  dataCadastro: string;
}

interface ApiResponse {
  conteudo: Coleta[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

interface UseGetColetasHook {
  coletas: Coleta[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number;
  totalElementos: number;
}

const useGetColetas = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 100,
  orderBy?: string,
  direction?: "asc" | "desc",
  tipo?: string | string[],
  status?: string,
  origem?: string,
  filtro?: string,
  valor?: string,
  dataCadastroIni?: string,
  dataCadastroFim?: string,
  enabled: boolean = true
): UseGetColetasHook => {
  const [coletas, setColetas] = useState<Coleta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0);

  const fetchColetas = useCallback(async () => {
    if (!codEmpresa || !enabled) return;

    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });
      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction);
      if (tipo) {
        if (Array.isArray(tipo)) {
          tipo.forEach((t) => queryParams.append("tipo", t));
        } else {
          queryParams.append("tipo", tipo);
        }
      }
      if (status) queryParams.append("situacao", status);
      if (origem) queryParams.append("origem", origem);
      if (filtro && valor) queryParams.append(filtro, valor);
      if (dataCadastroIni) queryParams.append("dataCadastroIni", dataCadastroIni);
      if (dataCadastroFim) queryParams.append("dataCadastroFim", dataCadastroFim);
      const response = await axiosInstance.get<ApiResponse>(
        `/coleta/empresa/${codEmpresa}?${queryParams}`
      );
      const { conteudo, qtdPaginas, qtdElementos } = response.data;
      setColetas(conteudo || []);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar as conferências.";
      setError(errorMessage);
      setColetas(null);
    } finally {
      setLoading(false);
    }
  }, [
    codEmpresa,
    pagina,
    porPagina,
    orderBy,
    direction,
    tipo,
    status,
    origem,
    filtro,
    valor,
    dataCadastroIni,
    dataCadastroFim,
    enabled,
  ]);

  useEffect(() => {
    if (enabled) {
      fetchColetas();
    }
  }, [fetchColetas, enabled]); // 'enabled' adicionado como dependência

  return {
    coletas,
    loading,
    error,
    refetch: fetchColetas,
    totalPaginas,
    totalElementos,
  };
};

export default useGetColetas;
