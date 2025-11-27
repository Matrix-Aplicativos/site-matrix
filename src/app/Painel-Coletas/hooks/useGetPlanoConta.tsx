import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

export interface PlanoConta {
  codPlanoConta: number;
  codPlanoContaErp: string;
  codClassificacaoErp: string;
  descricao: string;
  ativo: boolean;
}

interface PlanoContaResponse {
  conteudo: PlanoConta[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

interface UseGetPlanoContasResult {
  planosContas: PlanoConta[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
  refetch: () => void;
}

interface FiltrosPlanoConta {
  descricao?: string;
  codErp?: string;
  codClassificacao?: string;
}

const useGetPlanoContas = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 20,
  filtros: FiltrosPlanoConta = {}
): UseGetPlanoContasResult => {
  const [planosContas, setPlanosContas] = useState<PlanoConta[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanoContas = useCallback(async () => {
    if (!codEmpresa) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let queryParams = `?pagina=${pagina}&porPagina=${porPagina}`;

      if (filtros.descricao) {
        queryParams += `&descricao=${encodeURIComponent(filtros.descricao)}`;
      }
      if (filtros.codErp) {
        queryParams += `&codPlanoContaErp=${encodeURIComponent(
          filtros.codErp
        )}`;
      }
      if (filtros.codClassificacao) {
        queryParams += `&codClassificacaoPlanoContaErp=${encodeURIComponent(
          filtros.codClassificacao
        )}`;
      }

      const response = await axiosInstance.get<PlanoContaResponse>(
        `/plano-conta/${codEmpresa}${queryParams}`
      );

      if (response.data && response.data.conteudo) {
        setPlanosContas(response.data.conteudo);
        setTotalPages(response.data.qtdPaginas);
        setTotalElements(response.data.qtdElementos);
      } else {
        setPlanosContas([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      setError("Não foi possível carregar o plano de contas.");
      console.error("Erro ao buscar plano de contas:", err);
      setPlanosContas([]);
    } finally {
      setLoading(false);
    }
  }, [
    codEmpresa,
    pagina,
    porPagina,
    filtros.descricao,
    filtros.codErp,
    filtros.codClassificacao,
  ]);

  useEffect(() => {
    fetchPlanoContas();
  }, [fetchPlanoContas]);

  return {
    planosContas,
    loading,
    error,
    totalPages,
    totalElements,
    refetch: fetchPlanoContas,
  };
};

export default useGetPlanoContas;
