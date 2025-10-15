import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { Usuario } from "../utils/types/Usuario"; // Importa o tipo completo de Usuário

// Interface para o valor de retorno do hook
interface UseGetUsuarioByIdHook {
  usuario: Usuario | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook customizado para buscar os detalhes de um único usuário pelo seu ID.
 * @param codUsuario - O ID do usuário a ser buscado. O hook só será executado se o ID for um número válido.
 * @returns Um objeto contendo os dados do usuário, estado de carregamento, erro e uma função para re-buscar os dados.
 */
const useGetUsuarioById = (
  codUsuario: number | null
): UseGetUsuarioByIdHook => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuario = useCallback(async () => {
    // Não faz a busca se o codUsuario for nulo ou inválido
    if (!codUsuario) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Faz a chamada GET para o endpoint /usuario/{codUsuario}
      const response = await axiosInstance.get<Usuario>(
        `/usuario/${codUsuario}`
      );

      setUsuario(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? `Erro: ${err.message}`
          : "Ocorreu um erro ao buscar os detalhes do usuário.";
      setError(errorMessage);
      setUsuario(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [codUsuario]); // A função de busca depende apenas do codUsuario

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]); // O useEffect executa a busca quando a função muda (ou seja, quando codUsuario muda)

  return {
    usuario,
    loading,
    error,
    refetch: fetchUsuario, // Expõe a função para re-buscas manuais
  };
};

export default useGetUsuarioById;
