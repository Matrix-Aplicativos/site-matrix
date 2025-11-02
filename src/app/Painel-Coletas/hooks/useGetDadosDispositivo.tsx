import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

/**
 * @interface DadosDispositivo
 * @description Define a estrutura do objeto de dados de dispositivos retornado pela API.
 * @property {number} totalDispositivos - O número total de dispositivos cadastrados.
 * @property {number} licencasPadrao - O número total de licenças do tipo "Padrão".
 * @property {number} licencasMulti - O número total de licenças do tipo "Multi".
 * @property {number} licencasPadraoUtilizadas - O número de licenças "Padrão" que estão em uso.
 * @property {number} licencasMultiUtilizadas - O número de licenças "Multi" que estão em uso.
 */
export interface DadosDispositivo {
  totalDispositivos: number;
  licencasPadrao: number;
  licencasMulti: number;
  licencasPadraoUtilizadas: number;
  licencasMultiUtilizadas: number; // Corrigido de "licencasMultiUtilizadas"
}

/**
 * @interface UseGetDadosDispositivoResult
 * @description Define o objeto de retorno do hook useGetDadosDispositivo.
 * @property {DadosDispositivo | null} dados - Um objeto com os dados dos dispositivos ou nulo.
 * @property {boolean} loading - Um booleano que indica se a busca está em andamento.
 * @property {string | null} error - Uma mensagem de erro, caso ocorra, ou nulo.
 * @property {() => void} refetch - Uma função para recarregar os dados.
 */
interface UseGetDadosDispositivoResult {
  dados: DadosDispositivo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const initialState: DadosDispositivo = {
  totalDispositivos: 0,
  licencasPadrao: 0,
  licencasMulti: 0,
  licencasPadraoUtilizadas: 0,
  licencasMultiUtilizadas: 0,
};

/**
 * @hook useGetDadosDispositivo
 * @description Hook customizado para buscar os dados consolidados de dispositivos de uma empresa.
 * @param {number} codEmpresa - O código da empresa para a qual os dados serão buscados.
 * @returns {UseGetDadosDispositivoResult} Um objeto contendo os dados, o estado de carregamento, erros e uma função para refazer a busca.
 */
const useGetDadosDispositivo = (
  codEmpresa: number
): UseGetDadosDispositivoResult => {
  const [dados, setDados] = useState<DadosDispositivo | null>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDados = useCallback(async () => {
    // Não prossegue se o código da empresa não for válido
    if (!codEmpresa || codEmpresa === 0) {
      setDados(initialState);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Faz a requisição para o endpoint com o código da empresa
      const response = await axiosInstance.get<DadosDispositivo>(
        `/dispositivo/${codEmpresa}/dados`
      );

      // Atribui os dados da resposta ao estado
      setDados(response.data || initialState);
    } catch (err) {
      setError("Não foi possível carregar os dados dos dispositivos.");
      console.error("Erro ao buscar dados dos dispositivos:", err);
      setDados(initialState); // Reseta para o estado inicial em caso de erro
    } finally {
      setLoading(false);
    }
  }, [codEmpresa]); // A dependência agora é o codEmpresa

  useEffect(() => {
    // A busca é chamada quando o hook é montado ou quando codEmpresa muda
    fetchDados();
  }, [fetchDados]);

  return { dados, loading, error, refetch: fetchDados };
};

export default useGetDadosDispositivo;
