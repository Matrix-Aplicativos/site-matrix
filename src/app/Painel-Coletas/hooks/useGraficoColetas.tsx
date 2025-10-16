// Em: hooks/useGetGraficoColetas.ts

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

// Interface para a resposta da nova API
export interface DadosGraficoColeta {
  periodo: string;
  totalColetas: number;
  contagemPorTipo: {
    tipo: string;
    quantidade: number;
  }[];
}

export default function useGetGraficoColetas(
  codEmpresa: number | undefined,
  dataInicio: string | null,
  dataFim: string | null,
  agrupamento: "DIA" | "MES"
) {
  const [dados, setDados] = useState<DadosGraficoColeta[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Não faz a chamada se os parâmetros essenciais não estiverem presentes
    if (!codEmpresa || !dataInicio || !dataFim) {
      setDados(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("dataInicio", dataInicio);
        params.append("dataFim", dataFim);
        params.append("agrupamento", agrupamento);

        const response = await axiosInstance.get<DadosGraficoColeta[]>(
          `/coleta/grafico/${codEmpresa}`,
          { params }
        );

        setDados(response.data);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message || err.message
            : "Ocorreu um erro ao buscar os dados do gráfico.";
        setError(errorMessage);
        setDados(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codEmpresa, dataInicio, dataFim, agrupamento]);

  return { dados, loading, error };
}
