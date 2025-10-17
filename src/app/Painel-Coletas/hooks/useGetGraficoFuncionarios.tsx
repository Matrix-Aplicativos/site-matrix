import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

export interface DadosFuncionario {
  codUsuario: number;
  codErpFuncionario: string;
  nomeFuncionario: string;
  coletasRealizadas: number;
  itensDistintosBipados: number;
  volumeTotalBipado: number;
}

export default function useGetGraficoFuncionarios(
  codEmpresa: number | undefined,
  dataInicio: string | null,
  dataFim: string | null,
  tipos: number[] | undefined,
  refreshTrigger: number // 1. Adiciona o refreshTrigger como parâmetro
) {
  const [dados, setDados] = useState<DadosFuncionario[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usamos JSON.stringify para que o useEffect não entre em loop infinito
  // devido à recriação do array 'tipos' a cada renderização.
  const tiposString = JSON.stringify(tipos);

  useEffect(() => {
    if (!codEmpresa || !dataInicio || !dataFim) {
      setDados([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      // Adiciona 1 dia ao final para incluir a data final na contagem
      const diffDias =
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24) + 1;

      if (diffDias > 90) {
        setError("O período selecionado não pode ultrapassar 90 dias.");
        setLoading(false);
        setDados(null);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append("dataInicio", dataInicio);
        params.append("dataFim", dataFim);

        const tiposParsed = tiposString ? JSON.parse(tiposString) : [];
        if (tiposParsed && tiposParsed.length > 0) {
          tiposParsed.forEach((tipo: number) => {
            params.append("tipo", tipo.toString());
          });
        }

        const response = await axiosInstance.get<DadosFuncionario[]>(
          `/usuario/grafico/${codEmpresa}`,
          { params }
        );

        const dadosAjustados = response.data.map((func) => ({
          ...func,
          nomeFuncionario:
            func.nomeFuncionario.length > 12
              ? func.nomeFuncionario.slice(0, 12) + "..."
              : func.nomeFuncionario,
        }));

        setDados(dadosAjustados);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message || err.message
            : "Ocorreu um erro ao buscar o desempenho dos funcionários.";
        setError(errorMessage);
        setDados(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codEmpresa, dataInicio, dataFim, tiposString, refreshTrigger]); // 2. Adiciona o refreshTrigger à lista de dependências

  return { dados, loading, error };
}
