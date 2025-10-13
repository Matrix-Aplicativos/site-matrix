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
  tipos: number[] | undefined // O hook ainda recebe um array para simplicidade
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
      const diffDias =
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDias > 90) {
        setError("O período selecionado não pode ultrapassar 90 dias.");
        setLoading(false);
        setDados(null);
        return;
      }

      try {
        // ✅ Constrói os parâmetros da URL usando URLSearchParams
        const params = new URLSearchParams();
        params.append("dataInicio", dataInicio);
        params.append("dataFim", dataFim);

        const tiposParsed = tiposString ? JSON.parse(tiposString) : [];
        if (tiposParsed && tiposParsed.length > 0) {
          tiposParsed.forEach((tipo: number) => {
            // Isso irá gerar &tipo=1&tipo=2 etc.
            params.append("tipo", tipo.toString());
          });
        }

        const response = await axiosInstance.get<DadosFuncionario[]>(
          `/usuario/grafico/${codEmpresa}`,
          { params } // Passa o objeto URLSearchParams para o Axios
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
  }, [codEmpresa, dataInicio, dataFim, tiposString]); // A dependência continua sendo a string

  return { dados, loading, error };
}
