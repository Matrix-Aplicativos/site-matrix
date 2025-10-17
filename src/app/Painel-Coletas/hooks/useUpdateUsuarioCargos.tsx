import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

/**
 * @interface UpdateCargosResult
 * @description Define o objeto de retorno do hook useUpdateUsuarioCargos.
 */
interface UpdateCargosResult {
  /**
   * @function updateCargos
   * @description Função para executar a requisição PUT e atualizar os cargos de um usuário.
   * @param {number} codUsuario - O ID do usuário a ser atualizado.
   * @param {number[]} codCargos - Um array contendo os IDs de todos os cargos a serem atribuídos.
   * @returns {Promise<boolean>} Retorna `true` em caso de sucesso e `false` em caso de falha.
   */
  updateCargos: (codUsuario: number, codCargos: number[]) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * @hook useUpdateUsuarioCargos
 * @description Hook customizado para atualizar a lista de cargos de um usuário específico.
 * @returns {UpdateCargosResult} Um objeto contendo a função de atualização, o estado de carregamento e possíveis erros.
 */
const useUpdateUsuarioCargos = (): UpdateCargosResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCargos = useCallback(
    async (codUsuario: number, codCargos: number[]): Promise<boolean> => {
      // Validação para garantir que os parâmetros necessários foram fornecidos
      if (!codUsuario) {
        console.error("Código do usuário não fornecido para a atualização.");
        setError("Código do usuário não fornecido.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // A requisição PUT envia o array de IDs dos cargos no corpo da requisição
        await axiosInstance.put(`/usuario/${codUsuario}/cargos`, codCargos);
        return true; // Sucesso
      } catch (err: any) {
        setError("Falha ao atualizar as permissões do usuário.");
        console.error("Erro ao atualizar cargos do usuário:", err);
        return false; // Falha
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateCargos, loading, error };
};

export default useUpdateUsuarioCargos;
