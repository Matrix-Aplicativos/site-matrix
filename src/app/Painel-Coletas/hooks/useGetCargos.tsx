import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

/**
 * @interface Cargo
 * @description Define a estrutura de um objeto de Cargo retornado pela API.
 * @property {number} codCargo - O código identificador único do cargo.
 * @property {string} nomeCargo - O nome descritivo do cargo.
 */
export interface Cargo {
  codCargo: number;
  nomeCargo: string;
}

/**
 * @interface UseGetCargosResult
 * @description Define o objeto de retorno do hook useGetCargos.
 * @property {Cargo[]} cargos - Um array com a lista de cargos.
 * @property {boolean} loading - Um booleano que indica se a busca está em andamento.
 * @property {string | null} error - Uma mensagem de erro, caso ocorra, ou nulo.
 */
interface UseGetCargosResult {
  cargos: Cargo[];
  loading: boolean;
  error: string | null;
}

/**
 * @hook useGetCargos
 * @description Hook customizado para buscar e gerenciar a lista de cargos da API.
 * @returns {UseGetCargosResult} Um objeto contendo a lista de cargos, o estado de carregamento e possíveis erros.
 */
const useGetCargos = (): UseGetCargosResult => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCargos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Faz a requisição para o endpoint que retorna a lista de cargos
      const response = await axiosInstance.get<Cargo[]>("/usuario/cargos");

      // A resposta da API já é o array de cargos, que é atribuído ao estado
      setCargos(response.data || []);
    } catch (err) {
      setError("Não foi possível carregar a lista de cargos.");
      console.error("Erro ao buscar cargos:", err);
    } finally {
      setLoading(false);
    }
  }, []); // O array de dependências está vazio pois a busca não depende de parâmetros

  useEffect(() => {
    // A função de busca é chamada assim que o hook é utilizado
    fetchCargos();
  }, [fetchCargos]);

  return { cargos, loading, error };
};

export default useGetCargos;
