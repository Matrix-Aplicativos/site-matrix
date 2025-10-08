import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// --- Interfaces de Tipagem (sem alterações) ---
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
  codColeta: number; // Adicionado para consistência com a ordenação
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

// --- Hook Atualizado ---
const useGetColetas = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 100,
  orderBy?: string,
  sortDirection?: "asc" | "desc",
  tipo?: string | string[],
  integradoErp?: boolean,
  // --- NOVOS PARÂMETROS PARA BUSCA NA API ---
  filtro?: string, // Ex: 'descricao', 'status'
  valor?: string, // Ex: 'minha busca', '1'
  dataInicial?: string, // Ex: '2025-10-01'
  dataFinal?: string, // Ex: '2025-10-08'
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

      // Parâmetros existentes
      if (orderBy) queryParams.append("orderBy", orderBy);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);
      if (integradoErp !== undefined)
        queryParams.append("integradoErp", integradoErp.toString());
      // Tratamento para 'tipo' (individual ou array)
      if (tipo) {
        if (Array.isArray(tipo)) {
          tipo.forEach((t) => queryParams.append("tipo", t));
        } else {
          queryParams.append("tipo", tipo);
        }
      }

      // --- Adiciona os novos parâmetros de filtro à query da API ---
      if (filtro && valor) {
        queryParams.append(filtro, valor);
      }
      if (dataInicial) {
        queryParams.append("dataInicial", dataInicial);
      }
      if (dataFinal) {
        queryParams.append("dataFinal", dataFinal);
      }

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
    sortDirection,
    tipo,
    integradoErp,
    filtro, // <-- Nova dependência
    valor, // <-- Nova dependência
    dataInicial, // <-- Nova dependência
    dataFinal, // <-- Nova dependência
    enabled,
  ]);

  useEffect(() => {
    if (enabled) {
      fetchColetas();
    }
  }, [fetchColetas]);

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
