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
  dataFim: string | null
) {
  const [dados, setDados] = useState<DadosFuncionario[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codEmpresa || !dataInicio || !dataFim) {
      setDados([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 🔹 Verificação: intervalo de datas não pode ser maior que 90 dias
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      const diffDias =
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDias > 90) {
        setError("O período selecionado não pode ultrapassar 90 dias.");
        setLoading(false);
        setDados(null);
        return;
      }

      try {
        const response = await axiosInstance.get<DadosFuncionario[]>(
          `/usuario/grafico/${codEmpresa}`,
          { params: { dataInicio, dataFim } }
        );

        // 🔹 Truncar nomes longos (máx. 12 caracteres)
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
  }, [codEmpresa, dataInicio, dataFim]);

  return { dados, loading, error };
}
