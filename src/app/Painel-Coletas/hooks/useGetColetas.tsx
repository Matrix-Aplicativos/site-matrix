import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// Tipagens baseadas na sua descrição
interface Alocacao {
  codAlocacao: number;
  nome: string;
}

interface ItemConferencia {
  codItem: number;
  codConferencia: number;
  codIntegracao: number;
  codEmpresa: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  qtdAConferir: number;
  qtdConferida: number;
}

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

interface UseGetColetasHook {
  coletas: Coleta[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useGetColetas = (
  codEmpresa: number,
  pagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetColetasHook => {
  const [coletas, setColetas] = useState<Coleta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColetas = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=5`,
        sortKey ? `sortKey=${sortKey}` : null,
        sortDirection ? `sortDirection=${sortDirection}` : null,
      ]
        .filter(Boolean)
        .join("&");

      const response = await axiosInstance.get(
        `/coleta/${codEmpresa}?${queryParams}`
      );

      setColetas(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao buscar as coletas."
      );
      setColetas(null);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, sortKey, sortDirection]);

  useEffect(() => {
    if (codEmpresa) {
      fetchColetas();
    }
  }, [codEmpresa, pagina, sortKey, sortDirection, fetchColetas]);

  return { coletas, loading, error, refetch: fetchColetas };
};

export default useGetColetas;
